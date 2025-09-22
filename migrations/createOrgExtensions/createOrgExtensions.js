// Load environment variables from a .env file located two levels up
require('dotenv').config({ path: '../../.env' })

// Import Kafka client configuration
const kafkaClient = require('../../config/kafka')()

// Import Axios for HTTP requests
const axios = require('axios')

// Import minimist to parse command-line arguments
const minimist = require('minimist')

// Import readline to ask user input interactively
const readline = require('readline')

// Import MongoDB client
const { MongoClient } = require('mongodb')

// Create a new MongoDB client instance
const dbClient = new MongoClient(process.env.MONGODB_URL, { useUnifiedTopology: true })

// Parse command-line arguments
const argv = minimist(process.argv.slice(2))

// Immediately invoked function to perform health checks before running migration
;(async function healthCheck() {
	// URLs for service health checks
	const healthCheckUrls = [
		process.env.INTERFACE_SERVICE_URL + '/' + process.env.SERVICE_NAME + '/health',
		process.env.INTERFACE_SERVICE_URL + process.env.USER_SERVICE_BASE_URL + '/health',
	]

	// Send GET requests to all health check URLs with a 5-second timeout
	const requests = healthCheckUrls.map((url) => axios.get(url, { timeout: 5000 }))
	const responses = await Promise.allSettled(requests)

	// Flag to track overall health check status
	let healthCheckFlag = true

	// Iterate through responses and log any failures
	responses.forEach((response, i) => {
		if (response.status === 'rejected') {
			console.error(`${healthCheckUrls[i]} →`, response.reason.message)
			healthCheckFlag = false
		} else if (response.value.data.result.healthy == false) {
			console.error(`Health Check failed for ${response.value.data.result.name} service!!`)
			healthCheckFlag = false
		}
	})

	// Exit script if any health check failed
	if (!healthCheckFlag) {
		console.error('Health Check Failed!! Exiting the script')
		process.exit(0)
	}

	// Run the main migration function if all health checks pass
	await runMigration()
})().catch((err) => console.error('Top-level error', err))

// Fetch the list of tenants from the interface service
async function fetchTenantList() {
	try {
		const tenant = argv.tenant
		let tenantList = []

		if (!tenant) {
			// Fetch all tenants if no specific tenant is provided via CLI
			const tenantListUrl =
				process.env.INTERFACE_SERVICE_URL + process.env.USER_SERVICE_BASE_URL + '/v1/tenant/list'
			const headers = {
				internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
			}
			const response = await axios.get(tenantListUrl, { headers })

			if (!response || response.data?.responseCode != 'OK') {
				throw new Error('Tenant list fetch unsuccessful!!')
			}

			tenantList = response.data.result.map((tenant) => tenant.code)
		} else tenantList = [tenant] // Use CLI-provided tenant

		return tenantList
	} catch (error) {
		throw error
	}
}

// Function to prompt user input in the terminal
function askQuestion(query) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	return new Promise((resolve) => {
		rl.question(query, (answer) => {
			rl.close()
			resolve(answer.trim())
		})
	})
}

// Fetch organizations for each tenant
async function fetchOrgsData(tenantList) {
	try {
		let orgsByTenant = {}

		// Prepare requests for all tenants
		const requests = tenantList.map((tenant) => {
			let url =
				process.env.INTERFACE_SERVICE_URL +
				process.env.USER_SERVICE_BASE_URL +
				'/v1/organization/list' +
				`?tenant_code=${tenant}`
			let headers = {
				internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
			}
			return axios.get(url, { headers })
		})

		// Send all requests concurrently
		const responses = await Promise.allSettled(requests)

		// Process each response
		responses.forEach(async (response, i) => {
			if (response.status === 'rejected' || !response.value || !(response.value.data.responseCode == 'OK')) {
				// Prompt user whether to continue if fetch fails
				const answer = await askQuestion(`Org list fetch for ${tenantList[i]} failed. Continue anyway? (y/N): `)
				if (/^y(es)?$/i.test(answer)) {
					console.log('Stopping script...')
					process.exit(1)
				}
			} else {
				response = response.value.data.result
				// Map org codes for this tenant
				orgsByTenant[`${tenantList[i]}`] = response.map((org) => org.code)
			}
		})

		return orgsByTenant
	} catch (error) {
		throw error
	}
}

// Push messages to Kafka
const pushMessageToKafka = async (payload) => {
	console.log('-------Kafka producer log starts here------------------')
	console.log('Topic Name: ', payload[0].topic)
	console.log('Message: ', JSON.stringify(payload))
	console.log('-------Kafka producer log ends here------------------')

	try {
		const data = await new Promise((resolve, reject) => {
			kafkaClient.kafkaProducer.send(payload, (err, result) => {
				if (err) return reject(err)
				resolve(result)
			})
		})

		return {
			status: CONSTANTS.common.SUCCESS,
			message: `Kafka push to topic ${payload[0].topic} successful with number - ${data[payload[0].topic][0]}`,
		}
	} catch (err) {
		return {
			status: 'failed',
			message: `Kafka push to topic ${payload[0].topic} failed: ${err}`,
		}
	}
}

// Main migration function
async function runMigration() {
	try {
		// Fetch tenants and their organizations
		const tenantList = await fetchTenantList()
		const orgsByTenant = await fetchOrgsData(tenantList)

		// Connect to MongoDB
		await dbClient.connect()
		const DB = dbClient.db()

		// Template for org extension event
		let orgExtension = {
			entity: 'organization',
			eventType: 'create',
			code: '<org_code>',
			tenant_code: '<tenant_code>',
			status: 'ACTIVE',
			deleted: false,
		}

		// Process each tenant
		for (const [tenant, orgs] of Object.entries(orgsByTenant)) {
			// Fetch existing organization extensions to avoid duplicates
			const existingDocs = await DB.collection('organizationExtension')
				.find({ tenantId: tenant, orgId: { $in: orgs } })
				.project({ orgId: 1, _id: 0 })
				.toArray()

			orgExtension['tenant_code'] = tenant
			const existingOrgIds = new Set(existingDocs.map((d) => d.orgId))
			let messages = []

			// Prepare messages only for new organizations
			for (const org of orgs) {
				if (!existingOrgIds.has(org)) {
					messages.push({ ...orgExtension, tenant_code: tenant, code: org })
				}
			}

			// Push Kafka events if there are new orgs
			if (messages.length > 0) {
				const payload = [
					{
						topic: process.env.ORG_UPDATES_TOPIC,
						messages: messages.map((m) => JSON.stringify(m)),
					},
				]

				await pushMessageToKafka(payload)
				console.log(`Kafka event pushed for tenant ${tenant} with ${messages.length} org(s).`)
			}
		}

		// Close DB connection
		await dbClient.close()
		process.exit(0)
	} catch (error) {
		console.error(error?.message || error)
		console.error('Exiting the script!!')
		process.exit(1)
	}
}

/**
 * name : pushProjectToKafka.js
 * author : vishnu
 * created-date : 21-July-2025
 * Description : Push non-deleted project IDs to Kafka via API.
 */

const axios = require('axios')
const path = require('path')
const _ = require('lodash')
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

// Command-line args
const args = process.argv.slice(2)
const DOMAIN = args[0] // e.g., https://saas-qa.tekdinext.com
const ORIGIN = args[1] // e.g., default-qa.tekdinext.com
const IDENTIFIER = args[2] // e.g., nevil@tunerlabs.com
const PASSWORD = args[3] // e.g., your password
const LIMIT = parseInt(args[4] || '10')

if (!DOMAIN || !ORIGIN || !IDENTIFIER || !PASSWORD) {
	console.error('Usage: node pushProjectToKafka.js <domain> <origin> <identifier> <password>')
	process.exit(1)
}

async function loginAndGetToken() {
	try {
		const response = await axios.post(
			`${DOMAIN}/user/v1/account/login`,
			new URLSearchParams({
				identifier: IDENTIFIER,
				password: PASSWORD,
			}),
			{
				headers: {
					Origin: ORIGIN,
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			}
		)
		console.log('[Auth Success] Token fetched successfully.')
		return response.data.result.access_token
	} catch (err) {
		console.error('[Auth Error] Failed to login and fetch token:', err.response?.data || err.message)
		throw err
	}
}

async function fetchProjectIds(token) {
	try {
		const response = await axios.post(
			`${DOMAIN}/project/v1/admin/dbFind/projects`,
			{
				query: { isDeleted: false },
				projection: ['_id'],
				limit: LIMIT,
			},
			{
				headers: {
					'Content-Type': 'application/json',
					'X-auth-token': token,
				},
			}
		)
		console.log(`[Info] Fetched ${response.data.result.length} project IDs via DB API.`)
		return response.data.result
	} catch (err) {
		console.error('[Error] Failed to fetch project IDs from DB API:', err.response?.data || err.message)
		throw err
	}
}

async function pushToKafka(projectId, token) {
	try {
		const response = await axios.post(
			`${DOMAIN}/project/v1/dataPipeline/pushProjectDetailsToKafka/${projectId}`,
			{},
			{
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json, text/plain, */*',
					'x-auth-token': token,
				},
			}
		)

		console.log(`[Success] Project ${projectId} pushed to Kafka.`)
	} catch (err) {
		console.error(`[Failed] Project ${projectId} failed to push:`, err.response?.data || err.message)
	}
}

;(async () => {
	try {
		const token = await loginAndGetToken()
		console.log('[Info] Logged in successfully.')

		const projectDocs = await fetchProjectIds(token)
		const projectChunks = _.chunk(projectDocs, 5)
		console.log('projectChunks', projectChunks)
		function delay(ms) {
			return new Promise((resolve) => setTimeout(resolve, ms))
		}

		for (let i = 0; i < projectChunks.length; i++) {
			const chunk = projectChunks[i]
			console.log(`[Processing] Chunk ${i + 1} of ${projectChunks.length}`)
			await Promise.all(chunk.map((project) => pushToKafka(project._id, token)))

			// Wait 3 seconds before the next chunk
			if (i < projectChunks.length - 1) {
				console.log(`[Waiting] Delaying before next chunk...`)
				await delay(3000) // delay in milliseconds
			}
		}

		console.log(`[Done] Processed ${projectDocs.length} projects.`)
	} catch (error) {
		console.error('[Error] Script execution failed:', error.message)
	}
})()
// command sample : node pushProjectsToKafka.js   https://saas-qa.tekdinext.com   default-qa.tekdinext.com   nevil@tunerlabs.com   'PASSword###11'

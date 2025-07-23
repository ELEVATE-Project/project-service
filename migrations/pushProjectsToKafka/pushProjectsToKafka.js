/**
 * name : pushProjectToKafka.js
 * author : vishnu
 * created-date : 21-July-2025
 * Description : Push non-deleted project IDs to Kafka via API.
 */

const axios = require('axios')
const path = require('path')
const _ = require('lodash')
const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

// Command-line args
const args = process.argv.slice(2)
const DOMAIN = args[0] // e.g., https://saas-qa.tekdinext.com
const ORIGIN = args[1] // e.g., default-qa.tekdinext.com
const IDENTIFIER = args[2] // e.g., nevil@tunerlabs.com
const PASSWORD = args[3] // e.g., your password

if (!DOMAIN || !ORIGIN || !IDENTIFIER || !PASSWORD) {
	console.error('Usage: node pushProjectToKafka.js <domain> <origin> <identifier> <password>')
	process.exit(1)
}

const mongoUrl = 'mongodb://13.127.166.58/qa-saas-project' //process.env.MONGODB_URL;
const dbName = mongoUrl.split('/').pop()
const mongoHost = mongoUrl.split(dbName)[0]

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
		console.log('[Auth Success] Token fetched successfully.', response)
		return response.data.result.access_token
	} catch (err) {
		console.error('[Auth Error] Failed to login and fetch token:', err.response?.data || err.message)
		throw err
	}
}

async function fetchProjectIds(db) {
	return await db.collection('projects').find({ isDeleted: false }).project({ _id: 1 }).toArray()
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

		console.log(`[Success] Project ${projectId} pushed to Kafka.`, response)
	} catch (err) {
		console.error(`[Failed] Project ${projectId} failed to push:`, err.response?.data || err.message)
	}
}

;(async () => {
	const client = await MongoClient.connect(mongoHost, { useNewUrlParser: true, useUnifiedTopology: true })
	const db = client.db(dbName)

	try {
		const token = await loginAndGetToken()
		console.log('[Info] Logged in successfully.')

		const projectDocs = await fetchProjectIds(db)
		const projectChunks = _.chunk(projectDocs, 5)

		for (let chunk of projectChunks) {
			await Promise.all(chunk.map((project) => pushToKafka(project._id, token)))
		}

		console.log(`[Done] Processed ${projectDocs.length} projects.`)
	} catch (error) {
		console.error('[Error] Script execution failed:', error.message)
	} finally {
		client.close()
	}
})()
// command sample : node pushProjectsToKafka.js   https://saas-qa.tekdinext.com   default-qa.tekdinext.com   nevil@tunerlabs.com   'PASSword###11'

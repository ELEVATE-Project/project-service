/**
 * name : correcScopeOrgValues.js
 * description : Normalize orgId/orgIds fields in given collections
 * author : Saish
 */

const path = require('path')
const rootPath = path.join(__dirname, '../../')
require('dotenv').config({ path: rootPath + '/.env' })

const MongoClient = require('mongodb').MongoClient
const _ = require('lodash')

const mongoUrl = process.env.MONGODB_URL
const dbName = mongoUrl.split('/').pop()
const url = mongoUrl.split(dbName)[0]

// Collections with "orgId" (string) field
const singleOrgIdCollections = ['programs', 'solutions']

// Normalize function
function normalizeOrgId(orgId) {
	if (orgId == 'ALL') {
		return orgId
	}
	return orgId.trim().toLowerCase().replace(/\s+/g, '_')
}

;(async () => {
	console.log('Start................')
	const connection = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
	const db = connection.db(dbName)

	try {
		// Process single orgId collections
		for (const collectionName of singleOrgIdCollections) {
			console.log(`\nProcessing collection: ${collectionName}`)
			const records = await db
				.collection(collectionName)
				.find(
					{ 'scope.organizations': { $exists: true } } // query
				)
				.project({ _id: 1, scope: 1 }) // projection
				.toArray() // get the results as an array

			for (let record of records) {
				let currentScope = record.scope

				let currentOrganizationField = currentScope.organizations
				let modifiedOrganizationField = []

				for (let i = 0; i < currentOrganizationField.length; i++) {
					modifiedOrganizationField[i] = normalizeOrgId(currentOrganizationField[i])
				}

				if (!_.isEqual(currentOrganizationField, modifiedOrganizationField)) {
					console.log(
						`Record ${record._id}: ${JSON.stringify(currentOrganizationField)} -> ${JSON.stringify(
							modifiedOrganizationField
						)}`
					)

					let updateResult = await db
						.collection(collectionName)
						.updateOne({ _id: record._id }, { $set: { 'scope.organizations': modifiedOrganizationField } })
					console.log('updated id..', record._id)
				}
			}
		}

		console.log('\n Normalization completed!')
		connection.close()
	} catch (error) {
		console.error('Error occurred:', error)
		connection.close()
	}
})()

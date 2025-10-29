/**
 * name : correctOrgIdValuesInCollections.js
 * description : Normalize orgId/orgIds fields in given collections
 * author : vishnu
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
const singleOrgIdCollections = [
	'certificateBaseTemplates',
	'certificateTemplates',
	'forms',
	'programs',
	'projectAttributes',
	'projectCategories',
	'projectTemplateTasks',
	'projectTemplates',
	'projects',
	'solutions',
]

// Collections with "orgIds" (array) field
const multiOrgIdsCollections = ['userExtension']

// Normalize function
function normalizeOrgId(orgId) {
	return orgId.trim().toLowerCase().replace(/\s+/g, '_')
}

;(async () => {
	const connection = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
	const db = connection.db(dbName)

	try {
		// Process single orgId collections
		for (const collectionName of singleOrgIdCollections) {
			console.log(`\nProcessing collection: ${collectionName}`)
			const orgIds = await db.collection(collectionName).distinct('orgId')
			console.log('orgids:------------------->', orgIds)
			for (const originalOrgId of orgIds) {
				if (typeof originalOrgId !== 'string') continue
				const normalizedOrgId = normalizeOrgId(originalOrgId)
				if (normalizedOrgId !== originalOrgId) {
					const result = await db
						.collection(collectionName)
						.updateMany({ orgId: originalOrgId }, { $set: { orgId: normalizedOrgId } })
					console.log(
						`Updated ${result.modifiedCount} documents in ${collectionName} from '${originalOrgId}' to '${normalizedOrgId}'`
					)
				}
			}
		}

		// Process orgIds array in userExtension collection
		for (const collectionName of multiOrgIdsCollections) {
			console.log(`\nProcessing array orgIds in collection: ${collectionName}`)

			// Get all documents
			const cursor = db.collection(collectionName).find({ orgIds: { $exists: true, $type: 'array' } })
			while (await cursor.hasNext()) {
				const doc = await cursor.next()
				const originalOrgIds = doc.orgIds
				const normalizedOrgIds = originalOrgIds.map((id) => (typeof id === 'string' ? normalizeOrgId(id) : id))

				if (!_.isEqual(originalOrgIds, normalizedOrgIds)) {
					await db
						.collection(collectionName)
						.updateOne({ _id: doc._id }, { $set: { orgIds: normalizedOrgIds } })
					console.log(`Updated _id: ${doc._id} in ${collectionName}`)
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

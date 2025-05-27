/**
 * name : transformOrgIdsFields.js
 * author : Prajwal
 * created-date : 26-May-2025
 * Description : Migration script to update orgIds
 */

require('dotenv').config({ path: '../../.env' })
const { MongoClient } = require('mongodb')
const dbClient = new MongoClient(process.env.SOURCE_MONGODB_URL, { useUnifiedTopology: true })

let allCollectionsFromSourceDB = []

async function fetchCollectionNamesFromSourceDB() {
	const sourceDB = dbClient.db()
	const allCollections = await sourceDB.listCollections().toArray()

	await Promise.all(allCollections)
	allCollectionsFromSourceDB = allCollections.map((collection) => {
		return collection.name
	})
}

async function modifyCollection(collectionName) {
	console.log(`Starting migration for collection: ${collectionName}`)
	const DB = dbClient.db()
	const collection = DB.collection(collectionName)

	const cursor = collection.find({
		orgIds: { $exists: true, $type: 'array' },
	})

	while (await cursor.hasNext()) {
		console.log(`processing for collection: ${collectionName}`)
		const doc = await cursor.next()

		console.log(`Processing document with _id: ${doc._id}`)

		const orgIds = doc.orgIds

		if (orgIds.length === 0 || !orgIds) {
			console.log(`Skipping document with _id: ${doc._id} as it contains 'ALL' or is empty.`)
			continue
		}

		let dataToBeUpdated = {}
		if (['programs', 'solutions'].includes(collectionName)) {
			//neeed to update the scope
			let currentScope = doc.scope || []

			currentScope['organizations'] = orgIds

			console.log(`Updating document with _id: ${doc._id} with scope: ${currentScope}`)
			dataToBeUpdated = {
				scope: currentScope,
			}
		}

		dataToBeUpdated['orgId'] = orgIds[0]

		await collection.updateOne({ _id: doc._id }, { $unset: { orgIds: '' }, $set: { ...dataToBeUpdated } })
	}

	console.log(`Collection "${collectionName}" migration completed.`)
}

async function runMigration() {
	// Example call, you can call modifyCollection with different collection names
	await dbClient.connect()
	await fetchCollectionNamesFromSourceDB()
	for (const collection of allCollectionsFromSourceDB) {
		await modifyCollection(collection)
	}
	console.log('Migration Completed!')
	await dbClient.close()
}

runMigration()

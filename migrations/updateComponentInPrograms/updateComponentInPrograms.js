/**
 * name : updateComponentInPrograms.js
 * author : Saish R B
 * created-date : 01-Aug-2025
 * Description : Migration script to update components in 'programs' collection in memory-chunks
 */
const path = require('path')
let rootPath = path.join(__dirname, '../../')
require('dotenv').config({ path: rootPath + '/.env' })
const { MongoClient, ObjectId } = require('mongodb')
const MONGODB_URL = process.env.MONGODB_URL

if (!MONGODB_URL) {
	console.error('MONGODB_URL environment variable is required')
	process.exit(1)
}

const DB = MONGODB_URL.split('/').pop()
const URL = MONGODB_URL.split(DB)[0]

if (!DB || !URL) {
	console.error('Invalid MONGODB_URL format')
	process.exit(1)
}

const BATCH_SIZE = 100 // Tune this based on system capacity

const dbClient = new MongoClient(URL)

let finalArray = []

async function modifyProgramsCollection() {
	console.log(`Starting migration for collection: programs`)
	await dbClient.connect()
	const db = dbClient.db(DB)
	const collection = db.collection('programs')

	const cursor = collection
		.find({
			components: { $exists: true, $type: 'array' },
		})
		.sort({ createdAt: 1 })

	let batch = []

	while (await cursor.hasNext()) {
		const doc = await cursor.next()
		batch.push(doc)
		if (batch.length >= BATCH_SIZE) {
			await processBatch(batch, collection)
			batch = []
		}
	}

	// process remaining documents in last batch
	if (batch.length > 0) {
		await processBatch(batch, collection)
	}

	await dbClient.close()
	console.log(`Migration for "programs" collection completed.`)
	require('fs').writeFileSync('finalArray' + Date.now() + '.json', JSON.stringify(finalArray, null, 2))
}

async function processBatch(docs, collection) {
	const bulkOps = []

	for (const doc of docs) {
		console.log(`Processing document with _id: ${doc._id}`)

		const components = doc.components

		if (!components || components.length === 0) {
			console.log(`Skipping document with _id: ${doc._id} as it contains empty components.`)
			continue
		}

		// Placeholder: Replace with actual modification logic
		const modifiedComponents = []
		let order = 1

		for (const element of components) {
			// If element is already an object and has 'order', assume it's already transformed
			if (typeof element === 'object' && element !== null && 'order' in element) {
				modifiedComponents.push(element)
			} else {
				// Wrap raw ObjectId in the desired object format
				modifiedComponents.push({
					_id: new ObjectId(element), // rename field if needed
					order: order,
				})
			}
			order++
		}

		bulkOps.push({
			updateOne: {
				filter: { _id: doc._id },
				update: {
					$set: {
						components: modifiedComponents, // your modified array
					},
				},
			},
		})
	}

	if (bulkOps.length > 0) {
		await collection.bulkWrite(bulkOps, { ordered: false })
		console.log(`Processed batch of ${bulkOps.length} documents`)
		finalArray.push(bulkOps)
	}
}

modifyProgramsCollection()

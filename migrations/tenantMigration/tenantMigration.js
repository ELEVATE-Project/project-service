/**
 * Tenant Migration Script
 * --------------------------
 */

const path = require('path')
const rootPath = path.join(__dirname, '../../')
require('dotenv').config({ path: rootPath + '/.env' })
const { MongoClient, ObjectId } = require('mongodb')
const fs = require('fs')
const MONGO_URL = process.env.MONGODB_URL
const BATCH_SIZE = 10

// Add collections here
const COLLECTIONS = ['certificateBaseTemplates', 'projectCategories', 'userExtension']

if (!MONGO_URL) {
	console.error('❌ MONGO_URL missing in .env')
	process.exit(1)
}

const inputFilePath = path.resolve(__dirname, './input.json')
const rawData = fs.readFileSync(inputFilePath, 'utf8')
const inputData = JSON.parse(rawData)
const timeStamp = new Date()

const outputFilePath = path.resolve(__dirname, `./output-${timeStamp}.json`)
fs.writeFileSync(outputFilePath, JSON.stringify({}, null, 2), 'utf8')

async function migrateCollection(db, collectionName) {
	console.log(`\n🚀 Starting migration for: ${collectionName}`)

	const collection = db.collection(collectionName)

	const query = {
		tenantId: inputData.currentTenantId.toString().trim(),
		orgId: inputData.currentOrgId.toString().trim(),
		tenantMigrationReferenceId: { $exists: false },
	}

	const totalDocs = await collection.countDocuments(query)
	console.log(`📊 Documents to migrate: ${totalDocs}`)

	let outputData = {
		data: [],
		count: totalDocs,
	}

	const cursor = collection.find(query).batchSize(BATCH_SIZE)

	let batch = []
	while (true) {
		const doc = await cursor.next()
		if (!doc) break
		const newObjectId = new ObjectId()
		const newDoc = {
			...doc,
			_id: newObjectId, // generate new _id
			tenantId: inputData.newTenantId.toString().trim(),
			orgId: inputData.newOrgId.toString().trim(),
			tenantMigrationReferenceId: doc._id,
		}

		batch.push({
			insertOne: {
				document: newDoc,
			},
		})
		outputData.data.push({
			_id: newObjectId.toString(),
			migrationReferenceId: doc._id.toString(),
		})

		if (batch.length == BATCH_SIZE) {
			await collection.bulkWrite(batch)
			batch = []
		}
	}

	if (batch.length) {
		await collection.bulkWrite(batch)
		batch = []
	}
	let existingData = fs.readFileSync(outputFilePath, 'utf8')
	existingData = existingData ? JSON.parse(existingData) : {}
	existingData[`${collectionName}`] = outputData
	fs.writeFileSync(outputFilePath, JSON.stringify(existingData, null, 2), 'utf8')

	console.log(`🎉 Completed migration for: ${collectionName}`)
}

async function runMigration() {
	const client = await MongoClient.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })

	try {
		await client.connect()
		console.log('🔌 Connected to MongoDB')

		const db = client.db()

		// ---------------PHASE-1---------------
		for (const collectionName of COLLECTIONS) {
			await migrateCollection(db, collectionName)
		}

		console.log('\n🏁 Migration completed successfully.')
	} catch (error) {
		console.error('❌ Migration failed:', error)
	} finally {
		await client.close()
		console.log('🔒 Connection closed')
		process.exit(1)
	}
}

runMigration()

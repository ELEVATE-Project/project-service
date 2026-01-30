const { MongoClient } = require('mongodb')

const url = 'mongodb://localhost:27017/' // MongoDB URL
const projectDB = 'elevate-project'
const entityDB = 'elevate-entity'
const samikshaDB = "elevate-samiksha";
const entityData = require('./entity_sampleData.js')
const projectData = require('./project_sampleData.js')
const surveyData = require("./survey_sampleData.js");

// MongoDB Error Code for Duplicate Key
const DUPLICATE_KEY_ERROR_CODE = 11000

// --- UTILITY FUNCTIONS ---

/**
 * Drops the specified collection, effectively deleting all data.
 * @param {string} collectionName The name of the collection to drop.
 * @param {string} currentDB The name of the database.
 */
async function cleanData(collectionName, currentDB) {
	const client = new MongoClient(url)
	try {
		await client.connect()
		const db = client.db(currentDB)
		const collection = db.collection(collectionName)

		const exists = await collection.findOne({})
		if (exists) {
			await collection.drop()
			console.log(`🗑️ Successfully dropped collection: ${currentDB}.${collectionName}`)
		} else {
			// Use .listCollections for a more definitive check if needed, but drop() is usually safe.
			console.log(`ℹ️ Collection ${collectionName} in ${currentDB} does not exist or is empty. Skipping drop.`)
		}
	} catch (error) {
		// This catches general connection or other drop errors
		console.error(`❌ Error dropping collection ${collectionName} in ${currentDB}: ${error.message}`)
	} finally {
		await client.close()
	}
}

/**
 * Inserts data into the specified collection and provides detailed status messages.
 * (This function is kept the same as your previous version for insertion logic)
 * @param {string} collectionName The name of the collection.
 * @param {Array<Object>} dataFile The array of documents to insert.
 * @param {string} currentDB The name of the database.
 */
async function insertData(collectionName, dataFile, currentDB = projectDB) {
	const client = new MongoClient(url)

	try {
		await client.connect()
		const db = client.db(currentDB)
		const collection = db.collection(collectionName)

		const data = dataFile

		if (!data || data.length === 0) {
			return
		}

		console.log(`\n--- Attempting insertion into: ${currentDB}.${collectionName} ---`)

		const results = []
		await Promise.all(
			data.map(async (doc, index) => {
				const tempId = doc._id || `(Document Index: ${index})`

				try {
					const result = await collection.insertOne(doc)
					const finalId = result.insertedId || doc._id

					results.push({
						id: finalId,
						status: 'SUCCESS',
						message: `Document successfully created with _id: ${finalId}`,
					})
				} catch (error) {
					if (error.code === DUPLICATE_KEY_ERROR_CODE) {
						results.push({
							id: tempId,
							status: 'DUPLICATE',
							message: `The data with identifier ${tempId} is already present in the DB. Please ensure unique identifiers are provided or clean the existing data.`,
						})
					} else {
						// Catch other errors (e.g., validation failure, connection issues)
						results.push({
							id: tempId,
							status: 'FAILURE',
							message: `Error inserting document ${tempId}: ${error.message}`,
						})
					}
				}
			})
		)

		// Print the detailed results
		results.forEach((res) => {
			let message = ''
			if (res.status === 'SUCCESS') {
				message = `✅ SUCCESS: ${res.message}`
			} else if (res.status === 'DUPLICATE') {
				message = `⚠️ DUPLICATE: ${res.message}`
			} else {
				message = `❌ FAILURE: ${res.message}`
			}
			console.log(message)
		})
	} catch (globalError) {
		console.error(`\nFatal error connecting to or operating on the database: ${globalError.message}`)
	} finally {
		await client.close()
	}
}


async function main({ dataToBeInserted }) {
	const collectionsToInsert = [
		{ name: 'entities', data: dataToBeInserted.entities, db: entityDB },
		{ name: 'entityTypes', data: dataToBeInserted.entityType, db: entityDB },
		{ name: 'programs', data: dataToBeInserted.programData, db: projectDB },
		{ name: 'solutions', data: dataToBeInserted.solutionData, db: projectDB },
		{ name: 'projectTemplates', data: dataToBeInserted.projectTemplatesData, db: projectDB },
		{ name: 'projectTemplateTasks', data: dataToBeInserted.projectTemplateTasksData, db: projectDB },
		{ name: 'certificateTemplates', data: dataToBeInserted.certificateTemplatesData, db: projectDB },
		{ name: 'certificateBaseTemplates', data: dataToBeInserted.certificateBaseTemplatesData, db: projectDB },
		{ name: 'projectCategories', data: dataToBeInserted.projectCategoriesData, db: projectDB },
		{ name: 'configurations', data: dataToBeInserted.configurationData, db: projectDB },
		{ name: 'organizationExtension', data: dataToBeInserted.organizationExtensionData, db: projectDB },
    	{ name: "solutions", data: dataToBeInserted.solutionData, db:samikshaDB},
    	{ name: "criteria",  data:dataToBeInserted.criteriaData, db : samikshaDB},
    	{ name: "criteriaQuestions", data: dataToBeInserted.criteriaQuestionsData, db : samikshaDB},
    	{ name: "frameworks", data: dataToBeInserted.frameworkData, db : samikshaDB},
    	{ name: "questions", data: dataToBeInserted.questionsData, db : samikshaDB},
		{ name: "observations", data: dataToBeInserted.observationData, db : samikshaDB},
    	{ name: "surveys", data: dataToBeInserted.surveyData, db : samikshaDB},
    	{ name: "organizationExtension", data: dataToBeInserted.organizationExtensionData, db : samikshaDB},

	]

	console.log(`\n=================================================`)
	console.log(
		`🗑️ Starting CLEANUP for ${dataToBeInserted === entityData ? 'Entity Data' : 'Project Data & Survey Data' } Collections...`
	)
	console.log(`=================================================`)

	for (const item of collectionsToInsert) {
		if (item.data) {
			await cleanData(item.name, item.db)
		}
	}

	console.log(`\n=================================================`)
	console.log(
		`➕ Starting INSERTION for ${dataToBeInserted === entityData ? 'Entity Data' : 'Project Data & Survey Data '} Collections...`
	)
	console.log(`=================================================`)

	for (const item of collectionsToInsert) {
		if (item.data) {
			await insertData(item.name, item.data, item.db)
		}
	}
}

main({ dataToBeInserted: entityData })
	.then(() => {
		console.log('\n=======================================')
		console.log('✅ Entity data population process finished.')
		console.log('=======================================')
	})
	.catch(console.error)

main({ dataToBeInserted: projectData })
	.then(() => {
		console.log('\n=======================================')
		console.log('✅ Project data population process finished.')
		console.log('=======================================')
	})
	.catch(console.error)


main({ dataToBeInserted: surveyData })
.then(() => {
  console.log('\n=======================================')
  console.log('✅ survey data population process finished.')
  console.log('=======================================')
})
.catch(console.error)

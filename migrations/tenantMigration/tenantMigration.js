/**
 * Tenant Migration Script
 * --------------------------
 */

const path = require('path')
const rootPath = path.join(__dirname, '../../')
require('dotenv').config({ path: rootPath + '/.env' })
const { MongoClient, ObjectId } = require('mongodb')
const fs = require('fs')
const http = require('http')
const request = require('request')
const jwt = require('jsonwebtoken')
const MONGO_URL = process.env.MONGODB_URL
const BATCH_SIZE = 100
const interfaceServiceUrl = process.env.INTERFACE_SERVICE_URL

// Add collections here
const collections = [
	'certificateBaseTemplates',
	'projectCategories',
	'certificateTemplates',
	'organizationExtension',
	'programs',
	'solutions',
	'projectTemplates',
	'projectTemplateTasks',
	'projects',
	'userExtension',
	'userCourses',
]

let kafkaPushSuccessProjects = []
let kafkaPushFailedProjects = []

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

function verifyToken(token) {
	try {
		const decoded = jwt.verify(token.trim(), process.env.ACCESS_TOKEN_SECRET)

		const isAdmin = (decoded?.data?.organizations || []).some((org) =>
			(org.roles || []).some((role) => role.title === 'admin')
		)

		if (!isAdmin) {
			throw new Error('Unauthorized')
		}

		return decoded
	} catch (err) {
		throw new Error('Unauthorized')
	}
}

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

function writeMigrationOutput(collectionName, outputData) {
	let existingData = {}

	if (fs.existsSync(outputFilePath)) {
		const fileContent = fs.readFileSync(outputFilePath, 'utf8')
		existingData = fileContent ? JSON.parse(fileContent) : {}
	}

	existingData[collectionName] = outputData

	fs.writeFileSync(outputFilePath, JSON.stringify(existingData, null, 2), 'utf8')
}

async function migrateAssetCollections(db, collectionName) {
	const collection = db.collection(collectionName)

	let query = {
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
		let newDoc = {
			...doc,
			_id: newObjectId, // generate new _id
			tenantId: inputData.newTenantId.toString().trim(),
			orgId: inputData.newOrgId.toString().trim(),
			tenantMigrationReferenceId: doc._id,
		}

		if (collectionName == 'projectCategories') {
			newDoc['visibleToOrganizations'] = [inputData.newOrgId.toString().trim()]
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
			await collection.bulkWrite(batch, { ordered: false })
			batch = []
			await delay(3000)
		}
	}

	if (batch.length) {
		await collection.bulkWrite(batch, { ordered: false })
		batch = []
		await delay(3000)
	}

	writeMigrationOutput(collectionName, outputData)
}

async function migrateOrganizationExtension(db, collectionName) {
	const collection = db.collection(collectionName)

	const query = {
		tenantId: inputData.currentTenantId.toString().trim(),
		orgId: inputData.currentOrgId.toString().trim(),
	}

	const totalDocs = await collection.countDocuments(query)
	console.log(`📊 Documents to delete: ${totalDocs}`)

	let outputData = {
		data: [],
		count: totalDocs,
	}

	const cursor = collection.find(query).batchSize(BATCH_SIZE)

	let batch = []
	while (true) {
		const doc = await cursor.next()
		if (!doc) break

		batch.push({
			deleteOne: {
				filter: { _id: doc._id },
			},
		})

		outputData.data.push({
			_id: doc._id.toString(),
			migrationReferenceId: 'N/A',
		})

		if (batch.length == BATCH_SIZE) {
			await collection.bulkWrite(batch, { ordered: false })
			batch = []
			await delay(3000)
		}
	}

	if (batch.length) {
		await collection.bulkWrite(batch, { ordered: false })
		batch = []
		await delay(3000)
	}

	writeMigrationOutput(collectionName, outputData)
}

async function migrateProjectTemplateTasks(db, collectionName) {
	const collection = db.collection(collectionName)

	const query = {
		tenantId: inputData.currentTenantId.toString().trim(),
		orgId: inputData.currentOrgId.toString().trim(),
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

		batch.push({
			updateOne: {
				filter: { _id: doc._id },
				update: {
					$set: {
						tenantId: inputData.newTenantId.toString().trim(),
						orgId: inputData.newOrgId.toString().trim(),
					},
				},
			},
		})

		outputData.data.push({
			_id: doc._id.toString(),
			migrationReferenceId: 'N/A',
		})

		if (batch.length == BATCH_SIZE) {
			await collection.bulkWrite(batch, { ordered: false })
			batch = []
			await delay(3000)
		}
	}

	if (batch.length) {
		await collection.bulkWrite(batch, { ordered: false })
		batch = []
		await delay(3000)
	}

	writeMigrationOutput(collectionName, outputData)
}

async function migrateCertificateTemplates(db, collectionName) {
	const collection = db.collection(collectionName)
	const baseTemplateCollection = db.collection('certificateBaseTemplates')

	const query = {
		tenantId: inputData.currentTenantId.toString().trim(),
		orgId: inputData.currentOrgId.toString().trim(),
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

		let newBaseTemplateId = null
		if (doc.baseTemplateId) {
			const baseTemplate = await baseTemplateCollection.findOne(
				{
					tenantMigrationReferenceId: doc.baseTemplateId,
				},
				{ projection: { _id: 1 } }
			)

			if (baseTemplate) {
				newBaseTemplateId = baseTemplate._id
			}
		}

		batch.push({
			updateOne: {
				filter: { _id: doc._id },
				update: {
					$set: {
						tenantId: inputData.newTenantId.toString().trim(),
						orgId: inputData.newOrgId.toString().trim(),
						baseTemplateId: newBaseTemplateId,
					},
				},
			},
		})
		outputData.data.push({
			_id: doc._id.toString(),
			migrationReferenceId: 'N/A',
		})

		if (batch.length == BATCH_SIZE) {
			await collection.bulkWrite(batch, { ordered: false })
			batch = []
			await delay(3000)
		}
	}

	if (batch.length) {
		await collection.bulkWrite(batch, { ordered: false })
		batch = []
		await delay(3000)
	}

	writeMigrationOutput(collectionName, outputData)
}

async function migrateProjectTemplates(db, collectionName) {
	const collection = db.collection(collectionName)
	const projectCategoriesCollection = db.collection('projectCategories')

	const query = {
		tenantId: inputData.currentTenantId.toString().trim(),
		orgId: inputData.currentOrgId.toString().trim(),
	}

	const totalDocs = await collection.countDocuments(query)
	console.log(`📊 Documents to migrate: ${totalDocs}`)

	let outputData = {
		data: [],
		count: totalDocs,
	}

	/* --------------------------------------------------
	   Build category reference map
	   oldCategoryId -> newCategoryId
	---------------------------------------------------*/
	const categoryDocs = await projectCategoriesCollection
		.find(
			{
				tenantId: inputData.newTenantId.toString().trim(),
				orgId: inputData.newOrgId.toString().trim(),
				tenantMigrationReferenceId: { $exists: true },
			},
			{
				projection: {
					_id: 1,
					tenantMigrationReferenceId: 1,
				},
			}
		)
		.toArray()

	const categoryMap = new Map()

	for (const cat of categoryDocs) {
		categoryMap.set(cat.tenantMigrationReferenceId.toString(), cat._id)
	}

	const cursor = collection.find(query).batchSize(BATCH_SIZE)

	let batch = []

	while (true) {
		const doc = await cursor.next()
		if (!doc) break

		let updatedCategories = []

		if (Array.isArray(doc.categories)) {
			updatedCategories = doc.categories.map((category) => {
				const newCategoryId = categoryMap.get(category._id.toString())

				return {
					...category,
					_id: newCategoryId || category._id,
				}
			})
		}

		batch.push({
			updateOne: {
				filter: { _id: doc._id },
				update: {
					$set: {
						tenantId: inputData.newTenantId.toString().trim(),
						orgId: inputData.newOrgId.toString().trim(),
						categories: updatedCategories,
					},
				},
			},
		})

		outputData.data.push({
			_id: doc._id.toString(),
			migrationReferenceId: 'N/A',
		})

		if (batch.length === BATCH_SIZE) {
			await collection.bulkWrite(batch, { ordered: false })
			batch = []
			await delay(3000)
		}
	}

	if (batch.length) {
		await collection.bulkWrite(batch, { ordered: false })
		batch = []
		await delay(3000)
	}

	writeMigrationOutput(collectionName, outputData)
}

const entityDocuments = function (
	filterData = 'all',
	projection = 'all',
	page = null,
	limit = null,
	search = '',
	aggregateValue = null,
	isAggregateStaging = false,
	isSort = true,
	aggregateProjection = []
) {
	return new Promise(async (resolve, reject) => {
		try {
			// Function to find entity documents based on the given filter and projection
			const url =
				interfaceServiceUrl +
				process.env.ENTITY_MANAGEMENT_SERVICE_BASE_URL +
				'/v1/entities/find' +
				`?page=${page}&limit=${limit}&search=${search}&aggregateValue=${aggregateValue}&aggregateStaging=${isAggregateStaging}&aggregateSort=${isSort}`

			if (filterData._id && Array.isArray(filterData._id) && filterData._id.length > 0) {
				filterData['_id'] = {
					$in: filterData._id,
				}
			}

			let requestJSON = {
				query: filterData,
				projection: projection,
				aggregateProjection: aggregateProjection,
			}

			// Set the options for the HTTP POST request
			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
				},
				json: requestJSON,
			}
			// Make the HTTP POST request to the entity management service
			request.post(url, options, requestCallBack)

			// Callback function to handle the response from the HTTP POST request
			function requestCallBack(err, data) {
				let result = {
					success: true,
				}

				if (err) {
					result.success = false
				} else {
					let response = data.body
					// Check if the response status is OK (HTTP 200)
					if (response.status === 200) {
						result['data'] = response.result
					} else {
						result.success = false
					}
				}

				return resolve(result)
			}
		} catch (error) {
			return reject(error)
		}
	})
}

async function migratePrograms(db, collectionName) {
	const collection = db.collection(collectionName)

	const query = {
		tenantId: inputData.currentTenantId.toString().trim(),
		orgId: inputData.currentOrgId.toString().trim(),
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

		let scope = doc.scope || {}

		const scopeKeys = [
			'state',
			'district',
			'block',
			'cluster',
			'school',
			'professional_subroles',
			'professional_role',
		]

		let updatedScope = { ...scope }

		for (const key of scopeKeys) {
			if (!Array.isArray(scope[key]) || scope[key].length === 0) {
				updatedScope[key] = scope[key]
				continue
			} else if (scope[key].includes('ALL')) {
				updatedScope[key] = ['ALL']
				continue
			}

			const result = await entityDocuments(
				{
					tenantId: inputData.newTenantId.toString().trim(),
					'metaInformation.tenantMigrationReferenceId': { $in: scope[key] },
				},
				{
					_id: 1,
					'metaInformation.tenantMigrationReferenceId': 1,
				}
			)

			if (result.success && result.data) {
				const entityMap = new Map()
				for (const entity of result.data) {
					entityMap.set(entity.metaInformation.tenantMigrationReferenceId.toString(), entity._id.toString())
				}

				updatedScope[key] = scope[key].map((id) => entityMap.get(id.toString()) || id)
			}
		}

		updatedScope.organizations = [inputData.newOrgId.toString().trim()]

		batch.push({
			updateOne: {
				filter: { _id: doc._id },
				update: {
					$set: {
						tenantId: inputData.newTenantId.toString().trim(),
						orgId: inputData.newOrgId.toString().trim(),
						scope: updatedScope,
					},
				},
			},
		})

		outputData.data.push({
			_id: doc._id.toString(),
			migrationReferenceId: 'N/A',
		})

		if (batch.length === BATCH_SIZE) {
			await collection.bulkWrite(batch, { ordered: false })
			batch = []
			await delay(3000)
		}
	}

	if (batch.length) {
		await collection.bulkWrite(batch, { ordered: false })
		batch = []
		await delay(3000)
	}

	writeMigrationOutput(collectionName, outputData)
}

async function migrateSolutions(db, collectionName) {
	const collection = db.collection(collectionName)

	const query = {
		tenantId: inputData.currentTenantId.toString().trim(),
		orgId: inputData.currentOrgId.toString().trim(),
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

		let scope = doc.scope || {}

		const scopeKeys = [
			'state',
			'district',
			'block',
			'cluster',
			'school',
			'professional_subroles',
			'professional_role',
		]

		let updatedScope = { ...scope }

		for (const key of scopeKeys) {
			if (!Array.isArray(scope[key]) || scope[key].length === 0) {
				updatedScope[key] = scope[key]
				continue
			} else if (scope[key].includes('ALL')) {
				updatedScope[key] = ['ALL']
				continue
			}

			const result = await entityDocuments(
				{
					tenantId: inputData.newTenantId.toString().trim(),
					'metaInformation.tenantMigrationReferenceId': { $in: scope[key] },
				},
				{
					_id: 1,
					'metaInformation.tenantMigrationReferenceId': 1,
				}
			)

			if (result.success && result.data) {
				const entityMap = new Map()

				for (const entity of result.data) {
					entityMap.set(entity.metaInformation.tenantMigrationReferenceId.toString(), entity._id.toString())
				}

				updatedScope[key] = scope[key].map((id) => entityMap.get(id.toString()) || id)
			}
		}

		updatedScope.organizations = [inputData.newOrgId.toString().trim()]

		batch.push({
			updateOne: {
				filter: { _id: doc._id },
				update: {
					$set: {
						tenantId: inputData.newTenantId.toString().trim(),
						orgId: inputData.newOrgId.toString().trim(),
						scope: updatedScope,
					},
				},
			},
		})

		outputData.data.push({
			_id: doc._id.toString(),
			migrationReferenceId: 'N/A',
		})

		if (batch.length === BATCH_SIZE) {
			await collection.bulkWrite(batch, { ordered: false })
			batch = []
			await delay(3000)
		}
	}

	if (batch.length) {
		await collection.bulkWrite(batch, { ordered: false })
		batch = []
		await delay(3000)
	}

	writeMigrationOutput(collectionName, outputData)
}

async function fetchUserProfile(userId, tenantId) {
	return new Promise((resolve, reject) => {
		const baseUrl = new URL(process.env.INTERFACE_SERVICE_URL)
		const options = {
			hostname: baseUrl.hostname,
			port: baseUrl.port || 3567,
			path: `${process.env.USER_SERVICE_BASE_URL}/v1/user/profileById/${userId}?tenant_code=${tenantId}`,
			method: 'GET',
			headers: {
				internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
			},
		}

		const req = http.request(options, (res) => {
			let data = ''

			res.on('data', (chunk) => {
				data += chunk
			})

			res.on('end', () => {
				try {
					const parsedData = JSON.parse(data)
					resolve(parsedData) // ✅ store full response
				} catch (err) {
					reject(err)
				}
			})
		})

		req.on('error', (err) => {
			reject(err)
		})

		req.end()
	})
}

async function pushToKafka(projectId, token, kafkaPushFailedProjects, kafkaPushSuccessProjects) {
	return new Promise((resolve, reject) => {
		const baseUrl = new URL(process.env.INTERFACE_SERVICE_URL)

		const options = {
			hostname: baseUrl.hostname,
			port: baseUrl.port,
			path: `/project/v1/dataPipeline/pushProjectDetailsToKafka/${projectId}`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json, text/plain, */*',
				'x-auth-token': token,
			},
		}

		const req = http.request(options, (res) => {
			let data = ''

			res.on('data', (chunk) => {
				data += chunk
			})

			res.on('end', () => {
				try {
					if (res.statusCode >= 200 && res.statusCode < 300) {
						console.log(`[Success] Project ${projectId} pushed to Kafka.`)
						kafkaPushSuccessProjects.push(projectId)
						resolve()
					} else {
						console.error(`[Failed] Project ${projectId} failed to push:`)
						kafkaPushFailedProjects.push(projectId)
						reject()
					}
				} catch (err) {
					console.error(`[Parse Error] Project ${projectId}:`, err.message)
					reject(err)
				}
			})
		})

		req.on('error', (err) => {
			console.error(`[Error] Project ${projectId}:`, err.message)
			reject(err)
		})

		req.end()
	})
}

async function migrateProjects(db, collectionName) {
	const collection = db.collection(collectionName)
	const programsCollection = db.collection('programs')
	const solutionsCollection = db.collection('solutions')
	const projectCategoriesCollection = db.collection('projectCategories')
	let projectIdsToPushToKafka = []

	const query = {
		tenantId: inputData.currentTenantId.toString().trim(),
		orgId: inputData.currentOrgId.toString().trim(),
	}

	const totalDocs = await collection.countDocuments(query)
	console.log(`📊 Documents to migrate: ${totalDocs}`)

	let outputData = {
		data: [],
		count: totalDocs,
	}

	/* --------------------------------------------------
	   Build category reference map
	   oldCategoryId -> newCategoryId
	---------------------------------------------------*/
	const categoryDocs = await projectCategoriesCollection
		.find(
			{
				tenantId: inputData.newTenantId.toString().trim(),
				orgId: inputData.newOrgId.toString().trim(),
				tenantMigrationReferenceId: { $exists: true },
			},
			{
				projection: {
					_id: 1,
					tenantMigrationReferenceId: 1,
				},
			}
		)
		.toArray()

	const categoryMap = new Map()

	for (const cat of categoryDocs) {
		categoryMap.set(cat.tenantMigrationReferenceId.toString(), cat._id)
	}

	const cursor = collection.find(query).batchSize(BATCH_SIZE)

	let batch = []

	while (true) {
		const doc = await cursor.next()
		if (!doc) break

		/* --------------------------
		   Update categories
		---------------------------*/
		let updatedCategories = []

		if (Array.isArray(doc.categories)) {
			updatedCategories = doc.categories.map((category) => {
				const newCategoryId = categoryMap.get(category._id.toString())

				return {
					...category,
					_id: newCategoryId || category._id,
				}
			})
		}

		/* --------------------------
		   Update userRoleInformation
		---------------------------*/

		let updatedUserRoleInformation = { ...(doc.userRoleInformation || {}) }

		const roleKeys = [
			'state',
			'district',
			'block',
			'cluster',
			'school',
			'professional_role',
			'professional_subroles',
		]

		for (const key of roleKeys) {
			if (!Array.isArray(updatedUserRoleInformation[key]) || updatedUserRoleInformation[key].length === 0)
				continue

			const result = await entityDocuments(
				{
					tenantId: inputData.newTenantId.toString().trim(),
					'metaInformation.tenantMigrationReferenceId': { $in: updatedUserRoleInformation[key] },
				},
				{
					_id: 1,
					'metaInformation.tenantMigrationReferenceId': 1,
				}
			)

			if (result.success && result.data) {
				const entityMap = new Map()

				for (const entity of result.data) {
					entityMap.set(entity.metaInformation.tenantMigrationReferenceId.toString(), entity._id.toString())
				}

				updatedUserRoleInformation[key] = updatedUserRoleInformation[key].map(
					(id) => entityMap.get(id.toString()) || id
				)
			}
		}

		updatedUserRoleInformation['organizations'] = [inputData.newOrgId.toString().trim()]
		updatedUserRoleInformation['tenantId'] = inputData.newTenantId.toString().trim()
		updatedUserRoleInformation['orgId'] = inputData.newOrgId.toString().trim()

		/* --------------------------
		   Update entity-information
		---------------------------*/
		let updatedEntityInformation = doc.entityInformation
		let updatedEntityId = ''

		if (doc.entityInformation && doc.entityInformation._id && doc.entityInformation._id != '') {
			const result = await entityDocuments(
				{
					tenantId: inputData.newTenantId.toString().trim(),
					'metaInformation.tenantMigrationReferenceId': doc.entityInformation._id,
				},
				{
					_id: 1,
					'metaInformation.tenantMigrationReferenceId': 1,
				}
			)

			if (result.success && result.data) {
				updatedEntityInformation._id = result.data[0]._id
			}
		}

		if (doc.entityId && doc.entityId != '') {
			const result = await entityDocuments(
				{
					tenantId: inputData.newTenantId.toString().trim(),
					'metaInformation.tenantMigrationReferenceId': doc.entityInformation._id,
				},
				{
					_id: 1,
					'metaInformation.tenantMigrationReferenceId': 1,
				}
			)

			if (result.success && result.data) {
				updatedEntityId = result.data[0]._id
			}
		}

		/* --------------------------
		   Update user-profile
		---------------------------*/

		let updatedUserProfile = await fetchUserProfile(doc.userId, inputData.newTenantId.toString().trim())

		/* --------------------------
		   Update program-information
		---------------------------*/

		let updatedProgramInformation = await programsCollection.findOne({
			_id: new ObjectId(doc.programId),
			tenantId: inputData.newTenantId.toString().trim(),
		})

		/* --------------------------
		   Update solution-information
		---------------------------*/
		let updatedSolutionInformation = await solutionsCollection.findOne({
			_id: new ObjectId(doc.solutionId),
			tenantId: inputData.newTenantId.toString().trim(),
		})

		projectIdsToPushToKafka.push(doc._id.toString())

		/* --------------------------
		   Update tasks
		---------------------------*/
		let updatedTasks = []

		if (Array.isArray(doc.tasks)) {
			updatedTasks = doc.tasks.map((task) => ({
				...task,
				tenantId: inputData.newTenantId.toString().trim(),
				orgIds: [inputData.newOrgId.toString().trim()],
				orgId: inputData.newOrgId.toString().trim(),
			}))
		}

		/* --------------------------
		   Add to batch
		---------------------------*/
		batch.push({
			updateOne: {
				filter: { _id: doc._id },
				update: {
					$set: {
						tenantId: inputData.newTenantId.toString().trim(),
						orgId: inputData.newOrgId.toString().trim(),
						categories: updatedCategories,
						userRoleInformation: updatedUserRoleInformation,
						entityInformation: updatedEntityInformation,
						entityId: updatedEntityId,
						userProfile: updatedUserProfile.result,
						programInformation: updatedProgramInformation,
						solutionInformation: updatedSolutionInformation,
						tasks: updatedTasks,
					},
				},
			},
		})

		outputData.data.push({
			_id: doc._id.toString(),
			migrationReferenceId: 'N/A',
		})

		if (batch.length === BATCH_SIZE) {
			await collection.bulkWrite(batch, { ordered: false })
			batch = []
			await delay(3000)
		}
	}

	if (batch.length) {
		await collection.bulkWrite(batch, { ordered: false })
		batch = []
		await delay(3000)
	}

	// Push projects to Kafka
	for (const projectId of projectIdsToPushToKafka) {
		await pushToKafka(
			projectId,
			inputData.token.toString().trim(),
			kafkaPushFailedProjects,
			kafkaPushSuccessProjects
		)
		await delay(1000)
	}

	writeMigrationOutput('kafkaPushSuccessProjects', kafkaPushSuccessProjects)
	writeMigrationOutput('kafkaPushFailedProjects', kafkaPushFailedProjects)
	writeMigrationOutput(collectionName, outputData)
}

async function migrateUserCourses(db, collectionName) {
	const collection = db.collection(collectionName)

	const query = {
		tenantId: inputData.currentTenantId.toString().trim(),
		orgId: inputData.currentOrgId.toString().trim(),
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

		/* --------------------------
		   Update user-profile
		---------------------------*/

		let updatedUserProfile = await fetchUserProfile(doc.userId, inputData.newTenantId.toString().trim())

		batch.push({
			updateOne: {
				filter: { _id: doc._id },
				update: {
					$set: {
						tenantId: inputData.newTenantId.toString().trim(),
						orgId: inputData.newOrgId.toString().trim(),
						userProfile: updatedUserProfile.result,
					},
				},
			},
		})

		outputData.data.push({
			_id: doc._id.toString(),
			migrationReferenceId: 'N/A',
		})

		if (batch.length === BATCH_SIZE) {
			await collection.bulkWrite(batch, { ordered: false })
			batch = []
			await delay(3000)
		}
	}

	if (batch.length) {
		await collection.bulkWrite(batch, { ordered: false })
		batch = []
		await delay(3000)
	}

	writeMigrationOutput(collectionName, outputData)
}

async function migrateUserExtensions(db, collectionName) {
	const collection = db.collection(collectionName)

	const query = {
		tenantId: inputData.currentTenantId.toString().trim(),
		orgIds: { $in: [inputData.currentOrgId.toString().trim()] },
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

		batch.push({
			updateOne: {
				filter: { _id: doc._id },
				update: {
					$set: {
						tenantId: inputData.newTenantId.toString().trim(),
						orgIds: [inputData.newOrgId.toString().trim()],
					},
				},
			},
		})

		outputData.data.push({
			_id: doc._id.toString(),
			migrationReferenceId: 'N/A',
		})

		if (batch.length === BATCH_SIZE) {
			await collection.bulkWrite(batch, { ordered: false })
			batch = []
			await delay(3000)
		}
	}

	if (batch.length) {
		await collection.bulkWrite(batch, { ordered: false })
		batch = []
		await delay(3000)
	}

	writeMigrationOutput(collectionName, outputData)
}

async function runMigration() {
	const client = await MongoClient.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })

	try {
		verifyToken(inputData.token.trim())
		await client.connect()
		console.log('🔌 Connected to MongoDB')

		const db = client.db()

		for (const collectionName of collections) {
			console.log(`\n🚀 Starting migration for: ${collectionName}`)
			switch (collectionName) {
				case 'certificateBaseTemplates':
					await migrateAssetCollections(db, collectionName)
					break

				case 'projectCategories':
					await migrateAssetCollections(db, collectionName)
					break

				case 'organizationExtension':
					await migrateOrganizationExtension(db, collectionName)
					break

				case 'programs':
					await migratePrograms(db, collectionName)
					break

				case 'solutions':
					await migrateSolutions(db, collectionName)
					break

				case 'projectTemplateTasks':
					await migrateProjectTemplateTasks(db, collectionName)
					break

				case 'certificateTemplates':
					await migrateCertificateTemplates(db, collectionName)
					break

				case 'projectTemplates':
					await migrateProjectTemplates(db, collectionName)
					break

				case 'projects':
					await migrateProjects(db, collectionName)
					break

				case 'userCourses':
					await migrateUserCourses(db, collectionName)
					break

				case 'userExtension':
					await migrateUserExtensions(db, collectionName)
					break
			}
			console.log(`🎉 Completed migration for: ${collectionName}`)
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

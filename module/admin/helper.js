/**
 * name : helper.js
 * author : Prajwal
 * created-date : 15-Apr-2024
 * Description : Admin.
 */

// Dependencies
/**
 * ProgramsHelper
 * @class
 */
const adminQueries = require(DB_QUERY_BASE_PATH + '/admin')
const configurationQueries = require(DB_QUERY_BASE_PATH + '/configurations')
const programsQueries = require(DB_QUERY_BASE_PATH + '/programs')
const solutionsQueries = require(DB_QUERY_BASE_PATH + '/solutions')
const projectTemplateQueries = require(DB_QUERY_BASE_PATH + '/projectTemplates')
const projectTemplateTaskQueries = require(DB_QUERY_BASE_PATH + '/projectTemplateTask')
const certificateTemplateQueries = require(DB_QUERY_BASE_PATH + '/certificateTemplates')
const deletionAuditQueries = require(DB_QUERY_BASE_PATH + '/deletionAuditLogs')
const surveyService = require(SERVICES_BASE_PATH + '/survey')
const ObjectId = require('mongodb').ObjectId
const kafkaProducersHelper = require(GENERICS_FILES_PATH + '/kafka/producers')

module.exports = class AdminHelper {
	/**
	 * create index in the model.
	 * @method
	 * @name createIndex
	 * @param {String} collection - collectionName.
	 * @param {Array} keys - keys data.
	 * @returns {JSON} - success/failure message.
	 */
	static createIndex(collection, keys) {
		return new Promise(async (resolve, reject) => {
			try {
				let presentIndex = await adminQueries.listIndices(collection)
				let indexes = presentIndex.map((indexedKeys) => {
					return Object.keys(indexedKeys.key)[0]
				})
				let indexNotPresent = _.differenceWith(keys, indexes)
				if (indexNotPresent.length > 0) {
					indexNotPresent.forEach(async (key) => {
						await adminQueries.createIndex(collection, key)
					})
					//If indexing is happening in solutions collection update the configuration table
					if (collection === CONSTANTS.common.SOLUTION_MODEL_NAME) {
						// Filter keys that start with "scope." and extract the part after "scope."
						const scopeKeys = keys
							.filter((key) => key.startsWith('scope.')) // Filter out keys that start with "scope."
							.map((key) => key.split('scope.')[1]) // Extract the part after "scope."
						if (scopeKeys.length > 0) {
							await configurationQueries.createOrUpdate('keysAllowedForTargeting', scopeKeys)
						}
					}
					return resolve({
						message: CONSTANTS.apiResponses.KEYS_INDEXED_SUCCESSFULL,
						success: true,
					})
				} else {
					return resolve({
						message: CONSTANTS.apiResponses.KEYS_ALREADY_INDEXED_SUCCESSFULL,
						success: true,
					})
				}
			} catch (error) {
				return resolve({
					status: error.status ? error.status : HTTP_STATUS_CODE.internal_server_error.status,
					success: false,
					message: error.message,
					data: {},
				})
			}
		})
	}

	/**
	 * List of data based on collection
	 * @method
	 * @name dbFind
	 * @param {Object} reqBody - request body
	 * @returns {Object}  - collection details.
	 */

	static dbFind(collection, reqBody) {
		return new Promise(async (resolve, reject) => {
			try {
				if (reqBody.mongoIdKeys) {
					reqBody.query = await this.convertStringToObjectIdInQuery(reqBody.query, reqBody.mongoIdKeys)
				}

				let mongoDBDocuments = await adminQueries.list(
					collection,
					reqBody.query,
					reqBody.projection ? reqBody.projection : [],
					'none',
					reqBody.limit ? reqBody.limit : 100,
					reqBody.skip ? reqBody.skip : 0
				)
				return resolve({
					message: CONSTANTS.apiResponses.DATA_FETCHED_SUCCESSFULLY,
					success: true,
					result: mongoDBDocuments.data ? mongoDBDocuments.data : [],
					count: mongoDBDocuments.count ? mongoDBDocuments.count : 0,
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					data: false,
				})
			}
		})
	}

	/**
	 * Convert String to ObjectIds inside Query.
	 * @method
	 * @name convertStringToObjectIdInQuery
	 * @returns {Array} Query.
	 */

	static convertStringToObjectIdInQuery(query, mongoIdKeys) {
		for (let pointerToArray = 0; pointerToArray < mongoIdKeys.length; pointerToArray++) {
			let eachKey = mongoIdKeys[pointerToArray]
			let currentQuery = query[eachKey]

			if (typeof currentQuery === 'string') {
				query[eachKey] = UTILS.convertStringToObjectId(currentQuery)
			} else if (typeof currentQuery === 'object') {
				let nestedKey = Object.keys(query[eachKey])
				if (nestedKey) {
					nestedKey = nestedKey[0]
					query[eachKey][nestedKey] = UTILS.arrayIdsTobjectIds(currentQuery[nestedKey])
				}
			}
		}

		return query
	}

	/**
	 * Deletes a program or solution resource along with its associated dependencies.
	 *
	 * @param {String} resourceId - ID of the resource to delete.
	 * @param {String} resourceType - Type of the resource ('program' or 'solution').
	 * @param {String} tenantId - Tenant identifier for multitenancy.
	 * @param {String} orgId - Organization ID performing the operation.
	 * @param {String} [deletedBy='SYSTEM'] - User ID or system name that triggered the deletion.
	 * @param {String} userToken - Auth token used for downstream service calls (e.g., survey service).
	 *
	 * @returns {Promise<Object>} - Result object summarizing deletion impact.
	 */
	static deleteResource(resourceId, resourceType, tenantId, orgId, deletedBy = 'SYSTEM', userToken) {
		return new Promise(async (resolve, reject) => {
			try {
				// Track deletion counts for all associated resources
				let programDeletedCount = 0
				let solutionDeletedCount = 0
				let projectTemplateDeletedCount = 0
				let certificateTemplateDeletedCount = 0
				let taskDeletedCount = 0
				let surveyCount = 0
				let surveySubmissionCount = 0
				let observationCount = 0
				let observationSubmissionCount = 0

				let deletedResourceIds = []

				/**
				 * Helper function to delete associated resources linked to a solution.
				 * This includes project templates, certificate templates, and tasks (along with surveys/observations).
				 */
				const deleteAssociatedResources = async (solutionDoc) => {
					const projectTemplateId = solutionDoc.projectTemplateId

					if (!projectTemplateId) return

					const projectTemplateFilter = {
						_id: projectTemplateId,
						tenantId: tenantId,
					}

					// Fetch the project template document
					const projectTemplateDoc = await projectTemplateQueries.templateDocument(projectTemplateFilter, [
						'tasks',
						'certificateTemplateId',
					])

					if (!projectTemplateDoc || !projectTemplateDoc.length) {
						throw {
							status: HTTP_STATUS_CODE.bad_request.status,
							message: CONSTANTS.apiResponses.PROJECT_TEMPLATE_NOT_FOUND,
						}
					}

					await projectTemplateQueries.removeDocuments(projectTemplateFilter)
					projectTemplateDeletedCount++

					const certificateTemplateId = projectTemplateDoc[0].certificateTemplateId
					// Fetch and process certificate template if present
					if (certificateTemplateId) {
						const certificateTemplateFilter = {
							_id: certificateTemplateId,
							tenantId: tenantId,
						}
						const certificateTemplateDoc = await certificateTemplateQueries.certificateTemplateDocument(
							certificateTemplateFilter
						)

						if (!certificateTemplateDoc || !certificateTemplateDoc.length) {
							throw {
								status: HTTP_STATUS_CODE.bad_request.status,
								message: CONSTANTS.apiResponses.CERTIFICATE_TEMPLATE_NOT_FOUND,
							}
						}

						await certificateTemplateQueries.removeDocuments(certificateTemplateFilter)
						certificateTemplateDeletedCount++
					}

					// Delete tasks associated with the template
					if (projectTemplateDoc[0].tasks && projectTemplateDoc[0].tasks.length > 0) {
						const taskFilter = {
							_id: { $in: projectTemplateDoc[0].tasks },
						}

						const taskDoc = await projectTemplateTaskQueries.taskDocuments(taskFilter, [
							'_id',
							'type',
							'solutionDetails',
						])

						// Loop through each task and delete associated surveys/observations
						for (const taskType of taskDoc) {
							if (taskType.type == CONSTANTS.common.SURVEY && taskType.solutionDetails) {
								// Call survey service to delete associated survey
								let surevyDeleteResource = await surveyService.surevyDeleteResource(
									userToken,
									taskType.solutionDetails._id,
									CONSTANTS.common.SOLUTION_CHECK,
									tenantId,
									orgId
								)
								if (!surevyDeleteResource.status == 200) {
									throw {
										status: HTTP_STATUS_CODE.bad_request.status,
										message: CONSTANTS.apiResponses.OBSERVATION_NOT_CREATED,
									}
								}
								surveyCount += surevyDeleteResource.result?.surveyCount || 0
								surveySubmissionCount += surevyDeleteResource.result?.surveySubmissionCount || 0
							} else if (taskType.type == CONSTANTS.common.OBSERVATION && taskType.solutionDetails) {
								// Call survey service to delete associated observation
								let observationDeleteResource = await surveyService.surevyDeleteResource(
									userToken,
									taskType.solutionDetails._id,
									CONSTANTS.common.SOLUTION_CHECK,
									tenantId,
									orgId
								)
								if (!observationDeleteResource.status == 200) {
									throw {
										status: HTTP_STATUS_CODE.bad_request.status,
										message: CONSTANTS.apiResponses.OBSERVATION_NOT_CREATED,
									}
								}
								observationCount += observationDeleteResource.result?.observationCount || 0
								observationSubmissionCount +=
									observationDeleteResource.result?.observationSubmissionCount || 0
							}
						}

						if (!taskDoc || !taskDoc.length) {
							throw {
								status: HTTP_STATUS_CODE.bad_request.status,
								message: CONSTANTS.apiResponses.INVALID_TASK_ID,
							}
						}

						await projectTemplateTaskQueries.removeDocuments(taskFilter)
						taskDeletedCount += taskDoc.length
					}
				}

				if (resourceType === CONSTANTS.common.PROGRAM_CHECK) {
					const programFilter = {
						_id: resourceId,
						tenantId: tenantId,
						isAPrivateProgram: false,
					}

					const programDoc = await programsQueries.programsDocument(programFilter, 'all')
					if (!programDoc || !programDoc.length) {
						throw {
							status: HTTP_STATUS_CODE.bad_request.status,
							message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
						}
					}

					const programComponents = programDoc[0].components
					if (!Array.isArray(programComponents) || programComponents.length === 0) {
						throw {
							status: HTTP_STATUS_CODE.bad_request.status,
							message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
						}
					}
					deletedResourceIds.push(resourceId)
					// Loop through all solution components and delete them
					for (const id of programComponents) {
						const solutionFilter = {
							_id: id,
							tenantId,
						}

						const solutionDoc = await solutionsQueries.solutionsDocument(solutionFilter, [
							'projectTemplateId',
						])
						if (!solutionDoc || !solutionDoc.length) {
							throw {
								status: HTTP_STATUS_CODE.bad_request.status,
								message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
							}
						}

						await solutionsQueries.removeDocuments(solutionFilter)
						solutionDeletedCount++
						deletedResourceIds.push(id)
						await deleteAssociatedResources(solutionDoc[0])
					}

					// Finally delete the program itself
					await programsQueries.removeDocuments(filter)
					programDeletedCount++
					// Publish Kafka event
					await this.pushResourceDeleteKafkaEvent(
						CONSTANTS.common.PROGRAM_CHECK,
						resourceId,
						deletedBy,
						tenantId,
						orgId
					)

					await this.logDeletion(deletedResourceIds, deletedBy)
					return resolve({
						success: true,
						message: CONSTANTS.apiResponses.PROGRAM_RESOURCE_DELETED,
						result: {
							programDeletedCount,
							solutionDeletedCount,
							projectTemplateDeletedCount,
							certificateTemplateDeletedCount,
							taskDeletedCount,
							surveyCount,
							surveySubmissionCount,
							observationCount,
							observationSubmissionCount,
						},
					})
				} else if (resourceType === CONSTANTS.common.SOLUTION_CHECK) {
					const solutionFilter = {
						_id: resourceId,
						tenantId,
					}

					// Fetch solution document
					const solutionDoc = await solutionsQueries.solutionsDocument(solutionFilter, ['projectTemplateId'])
					if (!solutionDoc || !solutionDoc.length) {
						throw {
							status: HTTP_STATUS_CODE.bad_request.status,
							message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
						}
					}
					// Remove the solution from any parent program
					const solutionId = new ObjectId(resourceId)
					await programsQueries.pullSolutionsFromComponents(solutionId)

					await solutionsQueries.removeDocuments(solutionFilter)
					solutionDeletedCount++
					// Push event to kafka
					await this.pushResourceDeleteKafkaEvent('solution', resourceId, deletedBy, tenantId, orgId)

					deletedResourceIds.push(resourceId)
					await deleteAssociatedResources(solutionDoc[0])
					await this.logDeletion(deletedResourceIds, deletedBy)
					return resolve({
						success: true,
						message: CONSTANTS.apiResponses.SOLUTION_RESOURCE_DELETED,
						result: {
							solutionDeletedCount,
							projectTemplateDeletedCount,
							certificateTemplateDeletedCount,
							taskDeletedCount,
							surveyCount,
							surveySubmissionCount,
							observationCount,
							observationSubmissionCount,
						},
					})
				} else {
					return resolve({
						success: false,
						message: CONSTANTS.apiResponses.INVALID_RESOURCE_TYPE,
						result: false,
					})
				}
			} catch (error) {
				return resolve({
					success: false,
					message: error.message || 'Failed to delete resource',
					result: false,
					status: error.status,
				})
			}
		})
	}

	/**
	 * Logs deletion entries for one or more entities into the `deletionAuditLogs` collection.
	 *
	 * @method
	 * @name logDeletion
	 * @param {Array<String|ObjectId>} entityIds - Array of entity IDs (as strings or ObjectIds) to log deletion for.
	 * @param {String|Number} deletedBy - User ID (or 'SYSTEM') who performed the deletion.
	 *
	 * @returns {Promise<Object>} - Returns success status or error information.
	 */
	static logDeletion(resourceId, deletedBy) {
		return new Promise(async (resolve, reject) => {
			try {
				// Prepare log entries
				const logs = resourceId.map((id) => ({
					resourceId: new ObjectId(id),
					deletedBy: deletedBy || 'SYSTEM',
					deletedAt: new Date().toISOString(),
				}))
				// Insert logs into deletionAuditLogs collection
				await deletionAuditQueries.deletionAuditLogs(logs)
				return resolve({ success: true })
			} catch (error) {
				resolve({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					success: false,
					message: error.message,
					data: {},
				})
			}
		})
	}

	/**
	 * Pushes a Kafka event for resource deletion (program/solution).
	 *
	 * @param {string} resourceType - Type of the resource ('program' or 'solution').
	 * @param {ObjectId|string} resourceId - ID of the deleted resource.
	 * @param {string|number} deletedBy - User ID or 'SYSTEM'.
	 * @param {string} tenantId - Tenant code.
	 * @param {string|number|null} [organizationId=null] - Organization ID (optional).
	 */
	static async pushResourceDeleteKafkaEvent(resourceType, resourceId, deletedBy, tenantId, organizationId = null) {
		return new Promise(async (resolve, reject) => {
			try {
				const kafkaMessage = {
					entity: 'resource',
					type: resourceType,
					eventType: 'delete',
					entityId: resourceId.toString(),
					deleted_By: parseInt(deletedBy) || deletedBy,
					tenant_code: tenantId,
					organization_id: organizationId,
				}
				const kafkaPushed = await kafkaProducersHelper.pushResourceDeleteKafkaEvent(kafkaMessage)
				return resolve()
			} catch (error) {
				console.error(`Kafka push failed for ${resourceType} ${resourceId}:`, error.message)
			}
		})
	}
}

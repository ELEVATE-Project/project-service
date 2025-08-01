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
const createDeletionLog = require(DB_QUERY_BASE_PATH + '/deletionAuditLogs')
const surveyService = require(SERVICES_BASE_PATH + '/survey')
const ObjectId = require('mongodb').ObjectId
const kafkaProducersHelper = require(GENERICS_FILES_PATH + '/kafka/producers')
const userExtensionQueries = require(DB_QUERY_BASE_PATH + '/userExtension')
const projectQueries = require(DB_QUERY_BASE_PATH + '/projects')

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
	static deletedResourceDetails(resourceId, resourceType, tenantId, orgId, deletedBy = 'SYSTEM', userToken) {
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
				let pullProgramFromUserExtensionCount = 0
				let projectDeletedCount = 0

				// Track all resource IDs deleted for audit logging
				let resourceIdsWithType = []

				// Handle deletion if the resource type is PROGRAM
				if (resourceType === CONSTANTS.common.PROGRAM) {
					const programFilter = {
						_id: resourceId,
						tenantId: tenantId,
						isAPrivateProgram: false,
					}

					// Fetch the program to ensure it exists
					const programDetails = await programsQueries.programsDocument(programFilter, ['components'])
					if (!programDetails || !programDetails.length) {
						throw {
							status: HTTP_STATUS_CODE.bad_request.status,
							message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
						}
					}

					// Initialize projectTemplate and solution ID holders
					let projectTemplateIds
					let solutionIds
					if (programDetails[0].components) {
						// Extract solution IDs from program components
						solutionIds = programDetails[0].components.map((component) => component._id)

						const solutionFilter = {
							_id: { $in: solutionIds },
							tenantId,
						}
						// Get solution documents to retrieve associated project templates
						const solutionDetails = await solutionsQueries.solutionsDocument(solutionFilter, [
							'projectTemplateId',
						])

						await solutionsQueries.deleteSolutions(solutionFilter)
						solutionDeletedCount++
						if (solutionIds && solutionIds.length) {
							for (const Id of solutionIds) {
								resourceIdsWithType.push({ id: Id, type: CONSTANTS.common.SOLUTION })
							}
						}
						// Extract project template IDs from solutions
						projectTemplateIds = solutionDetails.map((projectTemplateIds) => {
							return projectTemplateIds.projectTemplateId
						})
					}
					// Add main program ID to deletion list
					resourceIdsWithType.push({ id: resourceId, type: CONSTANTS.common.PROGRAM })

					// Delete all projects linked to the solutions
					let projecFilter = {
						solutionId: { $in: solutionIds },
					}
					let deletedProjectIds = await projectQueries.deleteProjects(projecFilter)

					if (deletedProjectIds.deletedCount > 0) {
						projectDeletedCount = deletedProjectIds.deletedCount
					}

					// Remove program ID from user extension's programRoleMapping
					const programObjectId = typeof resourceId === 'string' ? new ObjectId(resourceId) : resourceId
					let programRoleMappingId = await userExtensionQueries.pullProgramIdFromTheProgramRoleMapping(
						programObjectId
					)
					// Delete all associated entities tied to projectTemplateIds
					if (programRoleMappingId.nModified > 0) {
						pullProgramFromUserExtensionCount = programRoleMappingId.nModified
					}

					// Delete all associated resources for collected projectTemplateIds
					if (projectTemplateIds.length > 0) {
						const result = await this.deleteAssociatedResources(
							projectTemplateIds,
							tenantId,
							orgId,
							userToken
						)

						if (result.success) {
							projectTemplateDeletedCount += result.result.projectTemplateDeletedCount
							certificateTemplateDeletedCount += result.result.certificateTemplateDeletedCount
							taskDeletedCount += result.result.taskDeletedCount
							surveyCount += result.result.surveyCount
							surveySubmissionCount += result.result.surveySubmissionCount
							observationCount += result.result.observationCount
							observationSubmissionCount += result.result.observationSubmissionCount
						}
					}

					// Delete the program itself
					await programsQueries.deletePrograms(programFilter)
					programDeletedCount++
					// Publish Kafka event
					await this.pushResourceDeleteKafkaEvent(
						CONSTANTS.common.PROGRAM,
						resourceId,
						deletedBy,
						tenantId,
						orgId
					)

					// Add deletion entry to logs
					await this.addDeletionLog(resourceIdsWithType, deletedBy)
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
							pullProgramFromUserExtensionCount,
							projectDeletedCount,
						},
					})
				} else if (resourceType === CONSTANTS.common.SOLUTION) {
					// Handle deletion for a solution
					const solutionFilter = {
						_id: resourceId,
						tenantId,
					}
					// Fetch solution document
					const solutionDetails = await solutionsQueries.solutionsDocument(solutionFilter, [
						'projectTemplateId',
					])
					if (!solutionDetails || !solutionDetails.length) {
						throw {
							status: HTTP_STATUS_CODE.bad_request.status,
							message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
						}
					}
					// Delete projects linked to the solution
					let projecFilter = {
						solutionId: { $in: resourceId },
					}
					let deletedProjectIds = await projectQueries.deleteProjects(projecFilter)

					if (deletedProjectIds.deletedCount > 0) {
						projectDeletedCount = deletedProjectIds.deletedCount
					}

					// Remove the solution reference from parent program
					const solutionId = new ObjectId(resourceId)
					await programsQueries.pullSolutionsFromComponents(solutionId)

					await solutionsQueries.deleteSolutions(solutionFilter)
					solutionDeletedCount++

					// Push event to kafka
					await this.pushResourceDeleteKafkaEvent('solution', resourceId, deletedBy, tenantId, orgId)

					resourceIdsWithType.push({ id: resourceId, type: CONSTANTS.common.SOLUTION })

					// Delete the associated projectTemplateId, if present
					if (solutionDetails[0].projectTemplateId) {
						const result = await this.deleteAssociatedResources(
							[solutionDetails[0].projectTemplateId],
							tenantId,
							orgId,
							userToken
						)

						if (result.success) {
							projectTemplateDeletedCount += result.result.projectTemplateDeletedCount
							certificateTemplateDeletedCount += result.result.certificateTemplateDeletedCount
							taskDeletedCount += result.result.taskDeletedCount
							surveyCount += result.result.surveyCount
							surveySubmissionCount += result.result.surveySubmissionCount
							observationCount += result.result.observationCount
							observationSubmissionCount += result.result.observationSubmissionCount
						}
					}

					await this.addDeletionLog(resourceIdsWithType, deletedBy)
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
							projectDeletedCount,
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
				console.log(error)
				return resolve({
					success: false,
					message: error.message,
					data: false,
				})
			}
		})
	}

	static deleteAssociatedResources(projectTemplateIds, tenantId, orgId, userToken) {
		return new Promise(async (resolve, reject) => {
			try {
				// Initialize counters to track deletions
				let projectTemplateDeletedCount = 0
				let certificateTemplateDeletedCount = 0
				let taskDeletedCount = 0
				let surveyCount = 0
				let surveySubmissionCount = 0
				let observationCount = 0
				let observationSubmissionCount = 0

				// Prepare the filter to fetch matching project templates
				const projectTemplateFilter = {
					_id: { $in: projectTemplateIds },
					tenantId: tenantId,
				}

				// Fetch project templates along with associated tasks and certificates
				const projectTemplateDetails = await projectTemplateQueries.templateDocument(projectTemplateFilter, [
					'tasks',
					'certificateTemplateId',
				])

				if (!projectTemplateDetails || !projectTemplateDetails.length) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROJECT_TEMPLATE_NOT_FOUND,
					}
				}

				// Extract all certificateTemplateIds used by project templates
				const certificateTemplateIds = projectTemplateDetails
					.map((doc) => doc.certificateTemplateId)
					.filter(Boolean)

				// Flatten all task IDs from all project templates
				const allTaskIds = projectTemplateDetails.flatMap((doc) => doc.tasks || []).filter(Boolean)

				// Delete all fetched project templates
				await projectTemplateQueries.deleteProjectTemplates(projectTemplateFilter)
				projectTemplateDeletedCount = projectTemplateDetails.length

				// If any certificate templates are associated, delete them
				if (certificateTemplateIds.length > 0) {
					const certificateTemplateFilter = {
						_id: { $in: certificateTemplateIds },
						tenantId: tenantId,
					}

					const certificateTemplateDetails = await certificateTemplateQueries.certificateTemplateDocument(
						certificateTemplateFilter
					)

					if (!certificateTemplateDetails || !certificateTemplateDetails.length) {
						throw {
							status: HTTP_STATUS_CODE.bad_request.status,
							message: CONSTANTS.apiResponses.CERTIFICATE_TEMPLATE_NOT_FOUND,
						}
					}

					await certificateTemplateQueries.deleteCertificateTemplate(certificateTemplateFilter)
					certificateTemplateDeletedCount = certificateTemplateDetails.length
				}

				// If any tasks exist, fetch and delete them
				if (allTaskIds.length > 0) {
					const taskFilter = {
						_id: { $in: allTaskIds },
					}
					const taskDetails = await projectTemplateTaskQueries.taskDocuments(taskFilter, [
						'_id',
						'type',
						'solutionDetails',
					])

					if (!taskDetails || !taskDetails.length) {
						throw {
							status: HTTP_STATUS_CODE.bad_request.status,
							message: CONSTANTS.apiResponses.INVALID_TASK_ID,
						}
					}

					// Handle SURVEY or OBSERVATION resource deletions via survey service
					for (const taskType of taskDetails) {
						// Delete associated survey solution
						if (taskType.type === CONSTANTS.common.SURVEY && taskType.solutionDetails) {
							const surveyDeleteResponse = await surveyService.deleteSolutionResource(
								userToken,
								taskType.solutionDetails._id,
								CONSTANTS.common.SOLUTION,
								tenantId,
								orgId
							)

							if (surveyDeleteResponse.status !== 200) {
								throw {
									status: HTTP_STATUS_CODE.bad_request.status,
									message: CONSTANTS.apiResponses.SURVEY_NOT_DELETED,
								}
							}

							// Update counters from the response
							surveyCount += surveyDeleteResponse.result?.surveyCount || 0
							surveySubmissionCount += surveyDeleteResponse.result?.surveySubmissionCount || 0
						} else if (taskType.type === CONSTANTS.common.OBSERVATION && taskType.solutionDetails) {
							// Delete associated observation solution
							const observationDeleteResponse = await surveyService.deleteSolutionResource(
								userToken,
								taskType.solutionDetails._id,
								CONSTANTS.common.SOLUTION,
								tenantId,
								orgId
							)
							if (observationDeleteResponse.status !== 200) {
								throw {
									status: HTTP_STATUS_CODE.bad_request.status,
									message: CONSTANTS.apiResponses.OBSERVATION_NOT_DELETED,
								}
							}

							// Update counters from the response
							observationCount += observationDeleteResponse.result?.observationCount || 0
							observationSubmissionCount +=
								observationDeleteResponse.result?.observationSubmissionCount || 0
						}
					}

					// Delete the project template tasks
					await projectTemplateTaskQueries.deleteProjectTemplateTasks(taskFilter)
					taskDeletedCount = taskDetails.length
				}

				return resolve({
					success: true,
					message: 'Associated resources deleted successfully',
					result: {
						projectTemplateDeletedCount,
						certificateTemplateDeletedCount,
						taskDeletedCount,
						surveyCount,
						surveySubmissionCount,
						observationCount,
						observationSubmissionCount,
					},
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
	 * Logs deletion entries for one or more entities into the `deletionAuditLogs` collection.
	 *
	 * @method
	 * @name addDeletionLog
	 * @param {Array<String|ObjectId>} entityIds - Array of entity IDs (as strings or ObjectIds) to log deletion for.
	 * @param {String|Number} userId - User ID (or 'SYSTEM') who performed the deletion.
	 *
	 * @returns {Promise<Object>} - Returns success status or error information.
	 */
	static addDeletionLog(resourceIdsWithType = [], userId = 'SYSTEM') {
		return new Promise(async (resolve, reject) => {
			try {
				const logs = resourceIdsWithType.map(({ id, type }) => ({
					resourceId: typeof id === 'string' ? new ObjectId(id) : id,
					resourceType: type,
					deletedBy: userId,
					deletedAt: new Date().toISOString(),
				}))
				await createDeletionLog.createDeletionLog(logs)
				return resolve({ success: true })
			} catch (error) {
				return resolve({
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
				await kafkaProducersHelper.pushResourceDeleteKafkaEvent(kafkaMessage)
				return resolve()
			} catch (error) {
				console.error(`Kafka push failed for ${resourceType} ${resourceId}:`, error.message)
			}
		})
	}
}

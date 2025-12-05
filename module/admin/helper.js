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
	 * @param {Object} isAPrivateProgram - If Program is Private `true` else `false`.
	 * @param {String} tenantId - Tenant identifier for multitenancy.
	 * @param {String} orgId - Organization ID performing the operation.
	 * @param {String} [deletedBy='SYSTEM'] - User ID or system name that triggered the deletion.
	 * @param {String} userToken - Auth token used for downstream service calls (e.g., survey service).
	 *
	 * @returns {Promise<Object>} - Result object summarizing deletion impact.
	 */
	static deletedResourceDetails(
		resourceId,
		resourceType,
		isAPrivateProgram = false,
		tenantId,
		orgId,
		deletedBy = 'SYSTEM'
	) {
		return new Promise(async (resolve, reject) => {
			try {
				// Track deletion counts for all associated resources
				let deletedProgramsCount = 0
				let deletedSolutionsCount = 0
				let deletedProjectTemplatesCount = 0
				let deletedCertificateTemplatesCount = 0
				let deletedProjectTemplateTasksCount = 0
				let deletedSurveysCount = 0
				let deletedSurveySubmissionsCount = 0
				let deletedObservationsCount = 0
				let deletedObservationSubmissionsCount = 0
				let pullProgramFromUserExtensionCount = 0
				let deletedProjectsCount = 0

				// Track all resource IDs deleted for audit logging
				let resourceIdsWithType = []
				let surveyIds = []

				// Handle deletion if the resource type is PROGRAM
				if (resourceType === CONSTANTS.common.PROGRAM) {
					let programFilter
					if (isAPrivateProgram) {
						programFilter = {
							_id: resourceId,
							tenantId: tenantId,
							isAPrivateProgram: true,
						}
					} else {
						programFilter = {
							_id: resourceId,
							tenantId: tenantId,
							isAPrivateProgram: false,
						}
					}

					console.log(programFilter, 'line no 201')

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
						// Extract missing solutionIds by comparing ObjectIds directly using .equals()
						const surveySolutionIds = solutionIds.filter((id) => {
							return !solutionDetails.some((solution) => solution._id.equals(id))
						})

						// Push them into surveyIds
						surveyIds.push(...surveySolutionIds)

						if (surveyIds.length > 0) {
							const deleteResponse = await surveyService.deleteSolutionResource(
								surveyIds,
								CONSTANTS.common.SOLUTION,
								tenantId,
								orgId,
								deletedBy
							)

							deletedSurveysCount += deleteResponse.data.result.deletedSurveysCount || 0
							deletedSurveySubmissionsCount +=
								deleteResponse.data.result.deletedSurveySubmissionsCount || 0
							deletedObservationsCount += deleteResponse.data.result.deletedObservationsCount || 0
							deletedObservationSubmissionsCount +=
								deleteResponse.data.result.deletedObservationSubmissionsCount || 0
						}

						const deletedSolutions = await solutionsQueries.delete(solutionFilter)
						deletedSolutionsCount += deletedSolutions.deletedCount || 0
						if (solutionIds && solutionIds.length) {
							for (const Id of solutionIds) {
								resourceIdsWithType.push({ id: Id, type: CONSTANTS.common.SOLUTION })
							}
						}
						// Extract project template IDs from solutions
						projectTemplateIds = solutionDetails.map((solution) => {
							return solution.projectTemplateId
						})

						// Add main program ID to deletion list
						resourceIdsWithType.push({ id: resourceId, type: CONSTANTS.common.PROGRAM })

						if (solutionIds && solutionIds.length > 0) {
							// Delete all projects linked to the solutions
							let projecFilter = {
								solutionId: { $in: solutionIds },
								isAPrivateProgram: false,
								tenantId: tenantId,
							}
							let deletedProjectIds = await projectQueries.delete(projecFilter)
							deletedProjectsCount = deletedProjectIds.deletedCount
						}
						// Remove program ID from user extension's programRoleMapping
						const programObjectId = typeof resourceId === 'string' ? new ObjectId(resourceId) : resourceId
						let programRoleMappingId = await userExtensionQueries.pullProgramIdFromProgramRoleMapping(
							programObjectId,
							tenantId
						)
						// Delete all associated entities tied to projectTemplateIds
						pullProgramFromUserExtensionCount = programRoleMappingId.nModified || 0

						// Delete all associated resources for collected projectTemplateIds
						if (projectTemplateIds.length > 0) {
							const result = await this.deleteAssociatedResources(
								projectTemplateIds,
								tenantId,
								orgId,
								deletedBy
							)

							if (result.success) {
								deletedProjectTemplatesCount += result.result.deletedProjectTemplatesCount
								deletedCertificateTemplatesCount += result.result.deletedCertificateTemplatesCount
								deletedProjectTemplateTasksCount += result.result.deletedProjectTemplateTasksCount
								deletedSurveysCount += result.result.deletedSurveysCount
								deletedSurveySubmissionsCount += result.result.deletedSurveySubmissionsCount
								deletedObservationsCount += result.result.deletedObservationsCount
								deletedObservationSubmissionsCount += result.result.deletedObservationSubmissionsCount
							}
						}
					}

					// Delete the program itself
					await programsQueries.delete(programFilter)
					deletedProgramsCount++
					// Publish Kafka event
					// {
					// 	"topic": "RESOURCE_DELETION_TOPIC",
					// 	"messages": "{\"entity\":\"resource\",\"type\":\"program\",\"eventType\":\"delete\",\"entityId\":\"682c1526ba875600144d93bc\",\"deleted_By\":1,\"tenant_code\":\"shikshagraha\",\"organization_id\":[\"blr\"]}"
					//   }
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
							deletedProgramsCount,
							deletedSolutionsCount,
							deletedProjectTemplatesCount,
							deletedCertificateTemplatesCount,
							deletedProjectTemplateTasksCount,
							deletedSurveysCount,
							deletedSurveySubmissionsCount,
							deletedObservationsCount,
							deletedObservationSubmissionsCount,
							pullProgramFromUserExtensionCount,
							deletedProjectsCount,
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
						solutionId: { $in: [resourceId] },
						isAPrivateProgram: false,
						tenantId: tenantId,
					}
					let deletedProjectIds = await projectQueries.delete(projecFilter)
					deletedProjectsCount = deletedProjectIds.deletedCount

					// Remove the solution reference from parent program
					const solutionId = new ObjectId(resourceId)
					await programsQueries.pullSolutionsFromComponents(solutionId, tenantId)

					const deletedSolutions = await solutionsQueries.delete(solutionFilter)
					deletedSolutionsCount += deletedSolutions.deletedCount || 0
					// Push event to kafka
					// {
					// 	"topic": "RESOURCE_DELETION_TOPIC",
					// 	"messages": "{\"entity\":\"resource\",\"type\":\"solution\",\"eventType\":\"delete\",\"entityId\":\"682c1526ba875600144d93bc\",\"deleted_By\":1,\"tenant_code\":\"shikshagraha\",\"organization_id\":[\"blr\"]}"
					//   }
					await this.pushResourceDeleteKafkaEvent('solution', resourceId, deletedBy, tenantId, orgId)

					resourceIdsWithType.push({ id: resourceId, type: CONSTANTS.common.SOLUTION })

					// Delete the associated projectTemplateId, if present
					if (solutionDetails[0].projectTemplateId) {
						const result = await this.deleteAssociatedResources(
							[solutionDetails[0].projectTemplateId],
							tenantId,
							orgId,
							deletedBy
						)

						if (result.success) {
							deletedProjectTemplatesCount += result.result.deletedProjectTemplatesCount
							deletedCertificateTemplatesCount += result.result.deletedCertificateTemplatesCount
							deletedProjectTemplateTasksCount += result.result.deletedProjectTemplateTasksCount
							deletedSurveysCount += result.result.deletedSurveysCount
							deletedSurveySubmissionsCount += result.result.deletedSurveySubmissionsCount
							deletedObservationsCount += result.result.deletedObservationsCount
							deletedObservationSubmissionsCount += result.result.deletedObservationSubmissionsCount
						}
					}

					await this.addDeletionLog(resourceIdsWithType, deletedBy)
					return resolve({
						success: true,
						message: CONSTANTS.apiResponses.SOLUTION_RESOURCE_DELETED,
						result: {
							deletedSolutionsCount,
							deletedProjectTemplatesCount,
							deletedCertificateTemplatesCount,
							deletedProjectTemplateTasksCount,
							deletedSurveysCount,
							deletedSurveySubmissionsCount,
							deletedObservationsCount,
							deletedObservationSubmissionsCount,
							deletedProjectsCount,
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
					message: error.message,
					data: false,
				})
			}
		})
	}

	/**
	 * Deletes associated resources (project templates, certificates, tasks, surveys, observations) for the given projectTemplateIds.
	 *
	 * @param {Array<string>} projectTemplateIds - Array of project template IDs to delete.
	 * @param {string} tenantId - Tenant identifier.
	 * @param {string} orgId - Organization identifier.
	 * @param {string} deletedBy - Auth token for downstream service calls.
	 */
	static deleteAssociatedResources(projectTemplateIds, tenantId, orgId, deletedBy) {
		return new Promise(async (resolve, reject) => {
			try {
				// Initialize counters to track deletions
				let deletedProjectTemplatesCount = 0
				let deletedCertificateTemplatesCount = 0
				let deletedProjectTemplateTasksCount = 0
				let deletedSurveysCount = 0
				let deletedSurveySubmissionsCount = 0
				let deletedObservationsCount = 0
				let deletedObservationSubmissionsCount = 0

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

				// Extract all certificateTemplateIds used by project templates
				const certificateTemplateIds = projectTemplateDetails
					.map((certificateDetails) => certificateDetails.certificateTemplateId)
					.filter(Boolean)

				// Flatten all task IDs from all project templates
				const allTaskIds = projectTemplateDetails.flatMap((taskId) => taskId.tasks || []).filter(Boolean)

				// Delete all fetched project templates
				await projectTemplateQueries.delete(projectTemplateFilter)
				deletedProjectTemplatesCount = projectTemplateDetails.length

				// If any certificate templates are associated, delete them
				if (certificateTemplateIds.length > 0) {
					const certificateTemplateFilter = {
						_id: { $in: certificateTemplateIds },
						tenantId: tenantId,
					}

					let certificateTemplateDetails = await certificateTemplateQueries.delete(certificateTemplateFilter)
					deletedCertificateTemplatesCount = certificateTemplateDetails.deletedCount
				}

				// If any tasks exist, fetch and delete them
				if (allTaskIds.length > 0) {
					const taskFilter = {
						_id: { $in: allTaskIds },
						tenantId: tenantId,
					}
					const taskDetails = await projectTemplateTaskQueries.taskDocuments(taskFilter, [
						'_id',
						'type',
						'solutionDetails',
					])

					let surveySolutionIds = []
					if (taskDetails.length > 0) {
						surveySolutionIds = taskDetails.map((task) => task.solutionDetails?._id).filter(Boolean)
					}

					// Handle SURVEY or OBSERVATION resource deletions via survey service
					if (surveySolutionIds.length > 0) {
						const deleteResponse = await surveyService.deleteSolutionResource(
							surveySolutionIds,
							CONSTANTS.common.SOLUTION,
							tenantId,
							orgId,
							deletedBy
						)

						deletedSurveysCount += deleteResponse.data.result.deletedSurveysCount || 0
						deletedSurveySubmissionsCount += deleteResponse.data.result.deletedSurveySubmissionsCount || 0
						deletedObservationsCount += deleteResponse.data.result.deletedObservationsCount || 0
						deletedObservationSubmissionsCount +=
							deleteResponse.data.result.deletedObservationSubmissionsCount || 0
					}

					// Delete the project template tasks
					await projectTemplateTaskQueries.delete(taskFilter)
					deletedProjectTemplateTasksCount = taskDetails.length
				}

				return resolve({
					success: true,
					message: 'Associated resources deleted successfully',
					result: {
						deletedProjectTemplatesCount,
						deletedCertificateTemplatesCount,
						deletedProjectTemplateTasksCount,
						deletedSurveysCount,
						deletedSurveySubmissionsCount,
						deletedObservationsCount,
						deletedObservationSubmissionsCount,
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
				await createDeletionLog.create(logs)
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

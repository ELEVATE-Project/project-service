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
const cacheHelper = require(GENERICS_FILES_PATH + '/helpers/cache')

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
	 * @returns {Promise<Object>} - Result object summarizing deletion impact with IDs and counts.
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
				// Track deletion IDs and counts for all associated resources
				let deletedPrograms = { deletedProgramsIds: [], deletedProgramsCount: 0 }
				let deletedSolutionsFromProject = {
					deletedSolutionsFromProjectIds: [],
					deletedSolutionsFromProjectCount: 0,
				}
				let deletedSolutionsFromSamiksha = {
					deletedSolutionsFromSamikshaIds: [],
					deletedSolutionsFromSamikshaCount: 0,
				}
				let deletedProjectTemplates = { deletedProjectTemplatesIds: [], deletedProjectTemplatesCount: 0 }
				let deletedCertificateTemplates = {
					deletedCertificateTemplatesIds: [],
					deletedCertificateTemplatesCount: 0,
				}
				let deletedProjectTemplateTasks = {
					deletedProjectTemplateTasksIds: [],
					deletedProjectTemplateTasksCount: 0,
				}
				let deletedSurveys = { deletedSurveysIds: [], deletedSurveysCount: 0 }
				let deletedSurveySubmissions = { deletedSurveySubmissionsIds: [], deletedSurveySubmissionsCount: 0 }
				let deletedObservations = { deletedObservationsIds: [], deletedObservationsCount: 0 }
				let deletedObservationSubmissions = {
					deletedObservationSubmissionsIds: [],
					deletedObservationSubmissionsCount: 0,
				}
				let deletedProjects = { deletedProjectsIds: [], deletedProjectsCount: 0 }
				let pullProgramFromUserExtensionCount = 0

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

					// Fetch the program to ensure it exists
					const programDetails = await programsQueries.programsDocument(programFilter, ['components'])
					if (!programDetails || !programDetails.length) {
						throw {
							status: HTTP_STATUS_CODE.bad_request.status,
							message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
						}
					}

					if (programDetails[0].components) {
						// Extract solution IDs from program components
						const solutionIds = programDetails[0].components.map((component) => component._id)

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
								deletedBy,
								isAPrivateProgram
							)
							const surveyData =
								deleteResponse?.success && deleteResponse.data ? deleteResponse.data.result || {} : {}

							// IDs will be populated once samiksha returns them; counts always merged
							deletedSurveys.deletedSurveysIds.push(
								...(surveyData.deletedSurveys.deletedSurveysIds || [])
							)
							deletedSurveys.deletedSurveysCount += surveyData.deletedSurveys.deletedSurveysCount || 0
							deletedSurveySubmissions.deletedSurveySubmissionsIds.push(
								...(surveyData.deletedSurveySubmissions.deletedSurveySubmissionsIds || [])
							)
							deletedSurveySubmissions.deletedSurveySubmissionsCount +=
								surveyData.deletedSurveySubmissions.deletedSurveySubmissionsCount || 0
							deletedObservations.deletedObservationsIds.push(
								...(surveyData.deletedObservations.deletedObservationsIds || [])
							)
							deletedObservations.deletedObservationsCount +=
								surveyData.deletedObservations.deletedObservationsCount || 0
							deletedObservationSubmissions.deletedObservationSubmissionsIds.push(
								...(surveyData.deletedObservationSubmissions.deletedObservationSubmissionsIds || [])
							)
							deletedObservationSubmissions.deletedObservationSubmissionsCount +=
								surveyData.deletedObservationSubmissions.deletedObservationSubmissionsCount || 0
							// Solutions deleted via samiksha (survey service)
							deletedSolutionsFromSamiksha.deletedSolutionsFromSamikshaIds.push(
								...(surveyData.deletedSolutions.deletedSolutionsIds ||
									surveyData.deletedSolutions.deletedSolutionsIds ||
									[])
							)
							deletedSolutionsFromSamiksha.deletedSolutionsFromSamikshaCount +=
								surveyData.deletedSolutions.deletedSolutionsCount ||
								surveyData.deletedSolutions.deletedSolutionsCount ||
								0
						}

						// Delete solutions from project service
						await solutionsQueries.delete(solutionFilter)
						const locallyDeletedSolutionIds = solutionDetails.map((s) => s._id.toString())
						deletedSolutionsFromProject.deletedSolutionsFromProjectIds.push(...locallyDeletedSolutionIds)
						deletedSolutionsFromProject.deletedSolutionsFromProjectCount += locallyDeletedSolutionIds.length

						// Audit log entries for solutions
						solutionIds.forEach((id) => resourceIdsWithType.push({ id, type: CONSTANTS.common.SOLUTION }))

						// Audit log entry for the program itself
						resourceIdsWithType.push({ id: resourceId, type: CONSTANTS.common.PROGRAM })

						// Delete all projects linked to these solutions
						// Fetch IDs first since deleteMany does not return them
						const projectFilter = {
							solutionId: { $in: solutionIds },
							tenantId,
						}
						const projectsToDelete = await projectQueries.projectDocument(projectFilter, ['_id'])
						if (projectsToDelete && projectsToDelete.length > 0) {
							deletedProjects.deletedProjectsIds = projectsToDelete.map((p) => p._id.toString())
							await projectQueries.delete(projectFilter)
							deletedProjects.deletedProjectsCount = deletedProjects.deletedProjectsIds.length
						}

						// Remove program ID from user extension's programRoleMapping
						const programObjectId = typeof resourceId === 'string' ? new ObjectId(resourceId) : resourceId
						const programRoleMappingResult = await userExtensionQueries.pullProgramIdFromProgramRoleMapping(
							programObjectId,
							tenantId
						)
						pullProgramFromUserExtensionCount = programRoleMappingResult.nModified || 0

						// Delete all associated resources for collected projectTemplateIds
						const projectTemplateIds = solutionDetails
							.map((solution) => solution.projectTemplateId)
							.filter(Boolean)

						if (projectTemplateIds.length > 0) {
							const result = await this.deleteAssociatedResources(
								projectTemplateIds,
								tenantId,
								orgId,
								deletedBy,
								isAPrivateProgram
							)

							if (result.success) {
								const associateResourceData = result.result
								deletedProjectTemplates.deletedProjectTemplatesIds.push(
									...associateResourceData.deletedProjectTemplates.deletedProjectTemplatesIds
								)
								deletedProjectTemplates.deletedProjectTemplatesCount +=
									associateResourceData.deletedProjectTemplates.deletedProjectTemplatesCount
								deletedCertificateTemplates.deletedCertificateTemplatesIds.push(
									...associateResourceData.deletedCertificateTemplates.deletedCertificateTemplatesIds
								)
								deletedCertificateTemplates.deletedCertificateTemplatesCount +=
									associateResourceData.deletedCertificateTemplates.deletedCertificateTemplatesCount
								deletedProjectTemplateTasks.deletedProjectTemplateTasksIds.push(
									...associateResourceData.deletedProjectTemplateTasks.deletedProjectTemplateTasksIds
								)
								deletedProjectTemplateTasks.deletedProjectTemplateTasksCount +=
									associateResourceData.deletedProjectTemplateTasks.deletedProjectTemplateTasksCount
								deletedSurveys.deletedSurveysIds.push(
									...associateResourceData.deletedSurveys.deletedSurveysIds
								)
								deletedSurveys.deletedSurveysCount +=
									associateResourceData.deletedSurveys.deletedSurveysCount
								deletedSurveySubmissions.deletedSurveySubmissionsIds.push(
									...associateResourceData.deletedSurveySubmissions.deletedSurveySubmissionsIds
								)
								deletedSurveySubmissions.deletedSurveySubmissionsCount +=
									associateResourceData.deletedSurveySubmissions.deletedSurveySubmissionsCount
								deletedObservations.deletedObservationsIds.push(
									...associateResourceData.deletedObservations.deletedObservationsIds
								)
								deletedObservations.deletedObservationsCount +=
									associateResourceData.deletedObservations.deletedObservationsCount
								deletedObservationSubmissions.deletedObservationSubmissionsIds.push(
									...associateResourceData.deletedObservationSubmissions
										.deletedObservationSubmissionsIds
								)
								deletedObservationSubmissions.deletedObservationSubmissionsCount +=
									associateResourceData.deletedObservationSubmissions.deletedObservationSubmissionsCount
							}
						}
					}

					// Delete the program itself
					await programsQueries.delete(programFilter)
					deletedPrograms.deletedProgramsIds.push(resourceId.toString())
					deletedPrograms.deletedProgramsCount++

					// Publish Kafka event// {
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
							deletedPrograms,
							deletedSolutionsFromProject,
							deletedSolutionsFromSamiksha,
							deletedProjectTemplates,
							deletedCertificateTemplates,
							deletedProjectTemplateTasks,
							deletedSurveys,
							deletedSurveySubmissions,
							deletedObservations,
							deletedObservationSubmissions,
							pullProgramFromUserExtensionCount,
							deletedProjects,
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
					// Fetch project IDs before deleting
					const projectFilter = {
						solutionId: resourceId,
						isAPrivateProgram: false,
						tenantId,
					}
					const projectsToDelete = await projectQueries.projectDocument(projectFilter, ['_id'])
					if (projectsToDelete && projectsToDelete.length > 0) {
						deletedProjects.deletedProjectsIds = projectsToDelete.map((p) => p._id.toString())
						await projectQueries.delete(projectFilter)
						deletedProjects.deletedProjectsCount = deletedProjects.deletedProjectsIds.length
					}

					// Remove the solution reference from parent program
					const solutionObjectId = new ObjectId(resourceId)
					await programsQueries.pullSolutionsFromComponents(solutionObjectId, tenantId)

					await solutionsQueries.delete(solutionFilter)
					deletedSolutionsFromProject.deletedSolutionsFromProjectIds.push(resourceId.toString())
					deletedSolutionsFromProject.deletedSolutionsFromProjectCount++

					// Publish Kafka event for solution deletion
					await this.pushResourceDeleteKafkaEvent('solution', resourceId, deletedBy, tenantId, orgId)

					resourceIdsWithType.push({ id: resourceId, type: CONSTANTS.common.SOLUTION })

					// Delete the associated projectTemplateId, if present
					if (solutionDetails[0].projectTemplateId) {
						const result = await this.deleteAssociatedResources(
							[solutionDetails[0].projectTemplateId],
							tenantId,
							orgId,
							deletedBy,
							isAPrivateProgram
						)

						if (result.success) {
							const associateResourceData = result.result
							deletedProjectTemplates.deletedProjectTemplatesIds.push(
								...associateResourceData.deletedProjectTemplates.deletedProjectTemplatesIds
							)
							deletedProjectTemplates.deletedProjectTemplatesCount +=
								associateResourceData.deletedProjectTemplates.deletedProjectTemplatesCount
							deletedCertificateTemplates.deletedCertificateTemplatesIds.push(
								...associateResourceData.deletedCertificateTemplates.deletedCertificateTemplatesIds
							)
							deletedCertificateTemplates.deletedCertificateTemplatesCount +=
								associateResourceData.deletedCertificateTemplates.deletedCertificateTemplatesCount
							deletedProjectTemplateTasks.deletedProjectTemplateTasksIds.push(
								...associateResourceData.deletedProjectTemplateTasks.deletedProjectTemplateTasksIds
							)
							deletedProjectTemplateTasks.deletedProjectTemplateTasksCount +=
								associateResourceData.deletedProjectTemplateTasks.deletedProjectTemplateTasksCount
							deletedSurveys.deletedSurveysIds.push(
								...associateResourceData.deletedSurveys.deletedSurveysIds
							)
							deletedSurveys.deletedSurveysCount +=
								associateResourceData.deletedSurveys.deletedSurveysCount
							deletedSurveySubmissions.deletedSurveySubmissionsIds.push(
								...associateResourceData.deletedSurveySubmissions.deletedSurveySubmissionsIds
							)
							deletedSurveySubmissions.deletedSurveySubmissionsCount +=
								associateResourceData.deletedSurveySubmissions.deletedSurveySubmissionsCount
							deletedObservations.deletedObservationsIds.push(
								...associateResourceData.deletedObservations.deletedObservationsIds
							)
							deletedObservations.deletedObservationsCount +=
								associateResourceData.deletedObservations.deletedObservationsCount
							deletedObservationSubmissions.deletedObservationSubmissionsIds.push(
								...associateResourceData.deletedObservationSubmissions.deletedObservationSubmissionsIds
							)
							deletedObservationSubmissions.deletedObservationSubmissionsCount +=
								associateResourceData.deletedObservationSubmissions.deletedObservationSubmissionsCount
						}
					}

					await this.addDeletionLog(resourceIdsWithType, deletedBy)
					return resolve({
						success: true,
						message: CONSTANTS.apiResponses.SOLUTION_RESOURCE_DELETED,
						result: {
							deletedSolutionsFromProject,
							deletedProjectTemplates,
							deletedCertificateTemplates,
							deletedProjectTemplateTasks,
							deletedSurveys,
							deletedSurveySubmissions,
							deletedObservations,
							deletedObservationSubmissions,
							deletedProjects,
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
	 * @param {Boolean} isAPrivateProgram - If Program is Private `true` else `false`.
	 */
	static deleteAssociatedResources(projectTemplateIds, tenantId, orgId, deletedBy, isAPrivateProgram) {
		return new Promise(async (resolve, reject) => {
			try {
				// Track IDs and counts for each resource type
				let deletedProjectTemplates = { deletedProjectTemplatesIds: [], deletedProjectTemplatesCount: 0 }
				let deletedCertificateTemplates = {
					deletedCertificateTemplatesIds: [],
					deletedCertificateTemplatesCount: 0,
				}
				let deletedProjectTemplateTasks = {
					deletedProjectTemplateTasksIds: [],
					deletedProjectTemplateTasksCount: 0,
				}
				let deletedSurveys = { deletedSurveysIds: [], deletedSurveysCount: 0 }
				let deletedSurveySubmissions = { deletedSurveySubmissionsIds: [], deletedSurveySubmissionsCount: 0 }
				let deletedObservations = { deletedObservationsIds: [], deletedObservationsCount: 0 }
				let deletedObservationSubmissions = {
					deletedObservationSubmissionsIds: [],
					deletedObservationSubmissionsCount: 0,
				}

				const projectTemplateFilter = {
					_id: { $in: projectTemplateIds },
					tenantId,
				}

				// Fetch project templates with tasks and certificate references
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
				deletedProjectTemplates.deletedProjectTemplatesIds = projectTemplateDetails.map((t) => t._id.toString())
				deletedProjectTemplates.deletedProjectTemplatesCount =
					deletedProjectTemplates.deletedProjectTemplatesIds.length

				// Delete certificate templates
				if (certificateTemplateIds.length > 0) {
					const certificateTemplateFilter = { _id: { $in: certificateTemplateIds }, tenantId }
					await certificateTemplateQueries.delete(certificateTemplateFilter)
					deletedCertificateTemplates.deletedCertificateTemplatesIds = certificateTemplateIds.map((id) =>
						id.toString()
					)
					deletedCertificateTemplates.deletedCertificateTemplatesCount =
						deletedCertificateTemplates.deletedCertificateTemplatesIds.length
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
							deletedBy,
							isAPrivateProgram
						)
						const surveyData =
							deleteResponse?.success && deleteResponse.data ? deleteResponse.data.result || {} : {}
						// IDs populated once samiksha returns them; counts always merged
						deletedSurveys.deletedSurveysIds.push(...(surveyData.deletedSurveys.deletedSurveysIds || []))
						deletedSurveys.deletedSurveysCount += surveyData.deletedSurveys.deletedSurveysCount || 0
						deletedSurveySubmissions.deletedSurveySubmissionsIds.push(
							...(surveyData.deletedSurveySubmissions.deletedSurveySubmissionsIds || [])
						)
						deletedSurveySubmissions.deletedSurveySubmissionsCount +=
							surveyData.deletedSurveySubmissions.deletedSurveySubmissionsCount || 0
						deletedObservations.deletedObservationsIds.push(
							...(surveyData.deletedObservations.deletedObservationsIds || [])
						)
						deletedObservations.deletedObservationsCount +=
							surveyData.deletedObservations.deletedObservationsCount || 0
						deletedObservationSubmissions.deletedObservationSubmissionsIds.push(
							...(surveyData.deletedObservationSubmissions.deletedObservationSubmissionsIds || [])
						)
						deletedObservationSubmissions.deletedObservationSubmissionsCount +=
							surveyData.deletedObservationSubmissions.deletedObservationSubmissionsCount || 0
						deletedSolutionsFromSamiksha.deletedSolutionsFromSamikshaIds.push(
							...(surveyData.deletedSolutions.deletedSolutionsIds ||
								surveyData.deletedSolutions.deletedSolutionsIds ||
								[])
						)
						deletedSolutionsFromSamiksha.deletedSolutionsFromSamikshaCount +=
							surveyData.deletedSolutions.deletedSolutionsCount ||
							surveyData.deletedSolutions.deletedSolutionsCount ||
							0
					}

					// Delete tasks and record their IDs
					await projectTemplateTaskQueries.delete(taskFilter)
					deletedProjectTemplateTasks.deletedProjectTemplateTasksIds = taskDetails.map((t) =>
						t._id.toString()
					)
					deletedProjectTemplateTasks.deletedProjectTemplateTasksCount =
						deletedProjectTemplateTasks.deletedProjectTemplateTasksIds.length
				}

				return resolve({
					success: true,
					message: 'Associated resources deleted successfully',
					result: {
						deletedProjectTemplates,
						deletedCertificateTemplates,
						deletedProjectTemplateTasks,
						deletedSurveys,
						deletedSurveySubmissions,
						deletedObservations,
						deletedObservationSubmissions,
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
				if (logs.length > 0) {
					await createDeletionLog.create(logs)
				}
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

	/**
	 * clearTenantCache  based on tenantId
	 *
	 * @param {String} tenantId - tenant id
	 * @returns {Object} returns a object.
	 */
	static async clearTenantCache(tenantId) {
		try {
			let removeTenantCache = await cacheHelper.clearCache(`tenant_${tenantId}`)
			if (removeTenantCache.success) {
				return {
					message: removeTenantCache.message,
					success: true,
				}
			}
			return {
				message: removeTenantCache.message,
				success: false,
			}
		} catch (error) {
			return {
				message: error.message,
				success: false,
			}
		}
	}
}

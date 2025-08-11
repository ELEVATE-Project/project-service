/**
 * name : helper.js
 * author : Prajwal
 * created-date : 21-July-2025
 * Description : Entities related information.
 */

// Dependencies
const entityManagementService = require(SERVICES_BASE_PATH + '/entity-management')
const userProjectQueries = require(DB_QUERY_BASE_PATH + '/projects')
const solutionsQueries = require(DB_QUERY_BASE_PATH + '/solutions')

/**
 * EntitiesHelper
 * @class
 */
module.exports = class EntitiesHelper {
	/**
	 * Searches entities based on solution.
	 * @param {Object} req - Request object with query params and user details.
	 * @returns {Promise<Object>} Promise resolving to search results and metadata.
	 */
	static fetchEntities(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let response = {
					result: {},
				}

				let userId = req.userDetails.userInformation.userId
				let result
				let projection = []

				// Ensure at least one of projectId or solutionId is provided
				if (!req.query.projectId && !req.query.solutionId) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.REQUIRED_SOLUTION_ID,
					}
				}

				// If projectId is provided, fetch the project details
				if (req.query.projectId) {
					let findObject = {
						_id: ObjectId(req.query.projectId),
						createdBy: userId,
						tenantId: req.userDetails.userInformation.tenantId,
					}
					projection.push('solutionInformation.entityType')

					// Fetch project document
					let projectInformation = await userProjectQueries.projectDocument(findObject, projection)
					result = projectInformation[0]

					// Add entityType from solutionInformation to result
					if (result.solutionInformation && result.solutionInformation.entityType) {
						result['entityType'] = result.solutionInformation.entityType
					}
				}

				// If solutionId is provided, fetch the solution details
				if (req.query.solutionId) {
					let findQuery = {
						_id: ObjectId(req.query.solutionId),
						tenantId: req.userDetails.userInformation.tenantId,
					}
					projection.push('entityType')

					// Fetch solution document
					let solutionDocument = await solutionsQueries.solutionsDocument(findQuery, projection)
					result = _.merge(solutionDocument[0])
				}

				// Fields to include while fetching entity data
				let entityProjections = ['entityType', 'metaInformation.externalId', 'metaInformation.name', 'groups']

				// If parentEntityId is given, fetch specific entity first
				if (req.query.parentEntityId) {
					let filterData = {
						_id: req.query.parentEntityId,
						tenantId: req.userDetails.userInformation.tenantId,
					}

					// Get parent entity details
					let entitiesDetails = await entityManagementService.entityDocuments(filterData, entityProjections)

					// If entity not found
					if (!entitiesDetails.success) {
						return resolve({
							message: CONSTANTS.apiResponses.ENTITY_NOT_FOUND,
							result: [
								{
									count: 0,
									data: [],
								},
							],
						})
					}

					let entitiesData = entitiesDetails.data

					// Prepare response structure for entities
					entitiesData = entitiesData.map((item) => ({
						_id: item._id,
						externalId: item.metaInformation?.externalId || null,
						name: item.metaInformation?.name || null,
						entityType: item.entityType,
						selected: false,
					}))

					response.result = []

					// If parent entity's type matches result entityType, return directly
					if (entitiesData && entitiesData[0].entityType === result.entityType) {
						response['message'] = CONSTANTS.apiResponses.ENTITY_FETCHED
						response.result.push({
							data: entitiesData[0],
							count: 1,
						})
						return resolve(response)
					} else {
						// Fetch related entities from the entity service using aggregation
						let projections = ['_id', 'entityType', 'metaInformation.externalId', 'metaInformation.name']

						entitiesDetails = await entityManagementService.entityDocuments(
							filterData, // Filter object
							[], // Empty projections array (default fields)
							req.pageNo, // Page number for pagination
							req.pageSize, // Page size
							req.searchText, // Optional search keyword
							`$groups.${result.entityType}`, // Aggregate group path
							true, // Enable aggregation staging
							false, // Disable sorting
							projections // Final fields to project
						)

						// If no related entities found
						if (!entitiesDetails.success || !(entitiesDetails.data.length > 0)) {
							return resolve({
								message: CONSTANTS.apiResponses.ENTITY_NOT_FOUND,
								result: [
									{
										count: 0,
										data: [],
									},
								],
							})
						}

						let entityDocuments = entitiesDetails.data

						// Prepare entity response structure
						entityDocuments = entityDocuments.map((entity) => ({
							_id: entity._id,
							externalId: entity.metaInformation?.externalId || null,
							name: entity.metaInformation?.name || null,
							entityType: entity.entityType,
							selected: false,
						}))

						response.result.push({
							data: entityDocuments,
							count: entityDocuments.length,
						})
						response['message'] = CONSTANTS.apiResponses.ENTITY_FETCHED
						return resolve(response)
					}
				} else {
					// When parentEntityId is not present, filter using entityType
					response.result = []

					let filterData = {
						entityType: result.entityType,
						tenantId: req.userDetails.userInformation.tenantId,
					}

					// If result contains entities, narrow down by _id
					if (result.entities && result.entities.length > 0) {
						filterData['_id'] = result.entities
					}

					// Fetch entities using filter
					let entitiesDetails = await entityManagementService.entityDocuments(
						filterData,
						entityProjections,
						req.pageNo,
						req.pageSize,
						req.searchText
					)

					// If no entities found
					if (!entitiesDetails.success) {
						return resolve({
							message: CONSTANTS.apiResponses.ENTITY_NOT_FOUND,
							result: [
								{
									count: 0,
									data: [],
								},
							],
						})
					}

					let entityDocuments = entitiesDetails.data

					// Map entities into final response format
					entityDocuments = entityDocuments.map((item) => ({
						_id: item._id,
						externalId: item.metaInformation?.externalId || null,
						name: item.metaInformation?.name || null,
						entityType: item.entityType,
						selected: false,
					}))

					response.result.push({
						data: entityDocuments,
						count: entityDocuments.length,
					})
					response['message'] = CONSTANTS.apiResponses.ENTITY_FETCHED
				}

				// Final successful response
				return resolve(response)
			} catch (error) {
				// Handle any unexpected error
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
	 * Add entities to the project.
	 * @param {Object} req - Request object with path params and entityId details.
	 * @returns {Promise<Object>} Promise resolving to search results and metadata.
	 */
	static addEntity(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const projectId = req.params._id
				const tenantId = req.userDetails.userInformation.tenantId
				const entityId = req.body.entityId
				const userId = req.userDetails.userInformation.userId

				// Check for the existence of the project
				const project = await userProjectQueries.projectDocument({
					_id: projectId,
					tenantId,
					userId,
				})
				// Throw error if the project is not found
				if (!project || !(project.length > 0)) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROJECT_NOT_FOUND,
					}
				}
				// Fetch entity details from entity-service
				const entityDetails = await entityManagementService.entityDocuments({
					_id: entityId,
					tenantId: tenantId,
				})
				// Throw error if the entity details are not fetched
				if (!entityDetails?.success || !entityDetails?.data?.length) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.ENTITY_NOT_FOUND,
					}
				}
				// Populate entityInformation to update project
				let updateProject = {}
				if (entityDetails && entityDetails?.data.length > 0) {
					updateProject['entityInformation'] = {
						..._.pick(entityDetails.data[0], ['entityType', 'entityTypeId']),
						entityId: entityDetails.data[0]._id,
						externalId: entityDetails.data[0]?.metaInformation?.externalId,
						entityName: entityDetails.data[0]?.metaInformation?.name,
					}
					updateProject.entityId = entityDetails.data[0]._id
				}
				// Update the project
				updateProject = await userProjectQueries.findOneAndUpdate(
					{
						_id: projectId,
						tenantId,
						userId,
					},
					{
						$set: updateProject,
					},
					{
						projection: { entityInformation: 1, _id: 1 },
						new: true, // ensures the returned doc is the updated one
					}
				)
				// Throw error if the project updation failed
				if (!updateProject._id) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.FAILED_TO_ADD_ENTITY,
					}
				}

				return resolve({
					success: true,
					status: HTTP_STATUS_CODE.ok.status,
					message: CONSTANTS.apiResponses.ENTITY_ADDED_TO_PROJECT_SUCCESSFULLY,
					result: {
						projectId,
						entityInformation: updateProject.entityInformation,
					},
					data: {
						projectId,
						entityInformation: updateProject.entityInformation,
					},
				})
			} catch (error) {
				// Handle any unexpected error
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}
}

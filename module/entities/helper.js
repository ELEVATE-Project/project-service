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
	static searchEntitiesHelper(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let response = {
					result: {},
				}

				let userId = req.userDetails.userInformation.userId
				let result

				let projection = []

				if (!req.query.projectId && !req.query.solutionId) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.REQUIRED_SOLUTION_ID,
					}
				}

				if (req.query.projectId) {
					let findObject = {
						_id: ObjectId(req.query.projectId),
						createdBy: userId,
						tenantId: req.userDetails.userInformation.tenantId,
					}
					projection.push('solutionInformation.entityType')
					let projectInformation = await userProjectQueries.projectDocument(findObject, projection)
					result = projectInformation[0]
					if (result.solutionInformation && result.solutionInformation.entityType) {
						result['entityType'] = result.solutionInformation.entityType
					}
				}
				if (req.query.solutionId) {
					let findQuery = {
						_id: ObjectId(req.query.solutionId),
						tenantId: req.userDetails.userInformation.tenantId,
					}
					projection.push('entityType')

					let solutionDocument = await solutionsQueries.solutionsDocument(findQuery, projection)
					result = _.merge(solutionDocument[0])
				}

				let entityProjections = ['entityType', 'metaInformation.externalId', 'metaInformation.name', 'groups']

				if (req.query.parentEntityId) {
					let filterData = {
						_id: req.query.parentEntityId,
						tenantId: req.userDetails.userInformation.tenantId,
					}

					let entitiesDetails = await entityManagementService.entityDocuments(filterData, entityProjections)
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

					entitiesData = entitiesData.map((item) => ({
						_id: item._id,
						externalId: item.metaInformation?.externalId || null,
						name: item.metaInformation?.name || null,
						entityType: item.entityType,
						selected: false,
					}))
					response.result = []
					if (entitiesData && entitiesData[0].entityType === result.entityType) {
						response['message'] = CONSTANTS.apiResponses.ENTITY_FETCHED
						response.result.push({
							data: entitiesData[0],
							count: 1,
						})
						return resolve(response)
					} else {
						// Fetch data from entity service
						let projections = ['_id', 'entityType', 'metaInformation.externalId', 'metaInformation.name']
						entitiesDetails = await entityManagementService.entityDocuments(
							filterData, // MongoDB filter criteria to find matching entities
							[], // Empty projection array default fields will be returned
							req.pageNo, // Current page number for pagination
							req.pageSize, // Number of records to fetch per page
							req.searchText, // Optional search keyword for text-based filtering (e.g., entity name)
							`$groups.${result.entityType}`, // Aggregate path to group IDs (e.g., 'groups.school' or 'groups.district')
							true, // Enable aggregation pipeline staging
							false, // Disable sorting inside aggregation pipeline
							projections // Fields to include/exclude in aggregation projection
						)

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
					response.result = []
					let filterData = {
						entityType: result.entityType,
						tenantId: req.userDetails.userInformation.tenantId,
					}
					if (result.entities && result.entities.length > 0) {
						filterData['_id'] = result.entities
					}
					let entitiesDetails = await entityManagementService.entityDocuments(
						filterData,
						entityProjections,
						req.pageNo,
						req.pageSize,
						req.searchText
					)
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

				return resolve(response)
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}
}

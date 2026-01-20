/**
 * name : programUsers.js
 * description : Program Users service
 * created-date : 19-Jan-2026
 */

const programUsersQueries = require(DB_QUERY_BASE_PATH + '/programUsers')
const userService = require(GENERICS_FILES_PATH + '/services/users')

module.exports = class ProgramUsersService {
	/**
	 * Create or update program user - handles all operations in a single update
	 * @method
	 * @name createOrUpdate
	 * @param {Object} data - request data with all parameters
	 * @returns {Object} result with status and data
	 */
	static async createOrUpdate(data) {
		try {
			const {
				tenantId,
				orgId,
				userId,
				programId,
				programExternalId,
				hierarchy = [],
				entities = [],
				status,
				metaInformation = {},
			} = data

			// Build filter based on available identifiers
			let filterData = {}
			if (userId) {
				filterData.userId = userId
			}
			if (programId) {
				filterData.programId = programId
			} else if (programExternalId) {
				filterData.programExternalId = programExternalId
			}

			// Build update data with all provided parameters
			const updateData = {
				$set: {
					updatedAt: new Date(),
					tenantId,
					orgId,
				},
				$setOnInsert: {
					createdAt: new Date(),
					overview: {},
				},
			}

			// Set base fields if provided
			if (userId) {
				updateData.$set.userId = userId
			}
			if (status) {
				updateData.$set.status = status
			}
			if (programId) {
				updateData.$set.programId = programId
			}
			if (programExternalId) {
				updateData.$set.programExternalId = programExternalId
			}

			// Handle hierarchy: replace if same level exists, else add
			if (hierarchy && hierarchy.length > 0) {
				// For new documents: just set the hierarchy
				updateData.$setOnInsert.hierarchy = hierarchy

				// For existing documents: remove old levels and push new ones
				// Split into two operations if document exists
				if (hierarchy.length > 0) {
					// Store hierarchy for special handling
					updateData._hierarchyReplacement = hierarchy
				}
			} else {
				updateData.$setOnInsert.hierarchy = []
			}

			// Handle entities: set on insert, push on update
			if (entities && entities.length > 0) {
				updateData.$setOnInsert.entities = entities
				// Store entities for special handling in query layer
				updateData._entitiesToPush = entities
			} else {
				updateData.$setOnInsert.entities = []
			}

			// Handle metaInformation: store for query layer to handle separately
			// This includes both user-provided keys and entityDetails to avoid MongoDB conflicts
			const metaInformationToSet = { ...metaInformation }
			metaInformationToSet.entityDetails = {
				service: process.env.PROGRAM_USERS_ENTITY_SERVICE,
				endPoint: process.env.PROGRAM_USERS_ENTITY_END_POINT,
			}
			updateData._metaInformationToSet = metaInformationToSet

			const result = await programUsersQueries.createOrUpdate(filterData, updateData, {
				upsert: true,
				new: true,
				lean: true,
			})
			delete result.overview // Remove overview from result
			return {
				status: result.createdAt === result.updatedAt ? 201 : 200,
				message: 'Program user created or updated successfully',
				result,
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * Update overview statistics
	 * @method
	 * @name updateOverview
	 * @param {String} docId - document _id
	 * @param {Object} operations - increment/decrement operations
	 * @returns {Object} updated document
	 */
	static async updateOverview(docId, operations) {
		try {
			const result = await programUsersQueries.updateOverview(docId, operations)
			return result
		} catch (error) {
			throw error
		}
	}

	/**
	 * Get program user entities with pagination
	 * @method
	 * @name getEntitiesWithPagination
	 * @param {String} userId - user ID
	 * @param {String} programId - program ID (optional)
	 * @param {String} programExternalId - program external ID (optional)
	 * @param {Number} page - page number
	 * @param {Number} limit - items per page
	 * @param {String} searchQuery - search text
	 * @returns {Object} entities with pagination info
	 */
	static async getEntitiesWithPagination(
		userId,
		programId,
		programExternalId,
		page = 1,
		limit = 20,
		status,
		searchQuery = '',
		userDetails
	) {
		try {
			const skip = (page - 1) * limit

			// Find document by userId and either programId or programExternalId
			const docData = await this.findByUserAndProgram(userId, programId, programExternalId)

			if (!docData) {
				return {
					status: 404,
					message: 'Program user not found',
					data: [],
				}
			}

			// Get entities from the found document
			let filteredEntities = docData.entities || []

			// Filter by status if provided
			if (status) {
				filteredEntities = filteredEntities.filter((entity) => entity.status == status)
			}

			// Filter by search query if provided
			if (searchQuery) {
				const lowerSearch = searchQuery.toLowerCase()
				filteredEntities = filteredEntities.filter((entity) => {
					// Assuming entity has a 'name' field to search against
					return entity.name && entity.name.toLowerCase().includes(lowerSearch)
				})
			}

			// Apply pagination
			const totalCount = filteredEntities.length
			const paginatedEntities = filteredEntities.slice(skip, skip + limit)

			const userIds = paginatedEntities.map((entity) => entity.userId).filter(Boolean)
			// Fetch user details from user service
			const { success, data } =
				(await userService.accountSearch(userIds, userDetails.userInformation.tenantId)) || {}

			// Throw error if no valid users returned from service
			if (!success || !data || data.count === 0) {
				throw {
					success: false,
					status: HTTP_STATUS_CODE.bad_request.status,
					message: 'No valid users found for the provided entity user IDs.',
				}
			}

			// Map accountSearch data with entity data from docData and filter by searchQuery
			const filteredData = paginatedEntities.map((entity) => {
				const userData = data.data.find((user) => user.id == entity.userId)
				return {
					...entity,
					userDetails: userData || null,
				}
			})

			return {
				status: 200,
				message: 'Entities retrieved successfully',
				data: { data: filteredData, overview: docData.overview || {} },
				result: { data: filteredData, overview: docData.overview || {} },
				count: filteredData.length,
				total: totalCount,
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * Find program user by userId and either programId or programExternalId
	 * @method
	 * @name findByUserAndProgram
	 * @param {String} userId - user ID
	 * @param {String} programId - program ID (optional)
	 * @param {String} programExternalId - program external ID (optional)
	 * @returns {Object} program user document
	 */
	static async findByUserAndProgram(userId, programId, programExternalId) {
		try {
			const result = await programUsersQueries.findByUserAndProgram(userId, programId, programExternalId)
			return result
		} catch (error) {
			throw error
		}
	}
}

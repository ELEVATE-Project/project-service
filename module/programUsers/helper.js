/**
 * name : helper.js
 * author : prajwal
 * created-date : 10-Jun-2024
 * Description : Programs users related helper functionality.
 */

// Dependencies
const programUsersQueries = require(DB_QUERY_BASE_PATH + '/programUsers')
const ObjectId = require('mongodb').ObjectID

/**
 * Status order for validation
 * Status can only progress forward, no rollback allowed
 * DROPPED_OUT can happen from any state except GRADUATED
 */
const STATUS_ORDER = ['NOT_ONBOARDED', 'ONBOARDED', 'IN_PROGRESS', 'COMPLETED', 'GRADUATED', 'DROPPED_OUT']

/**
 * ProgramUsersHelper
 * @class
 */

module.exports = class ProgramUsersHelper {
	/**
	 * Validate status transition
	 * Rules:
	 * 1. Status must follow order: NOT_ONBOARDED → ONBOARDED → IN_PROGRESS → COMPLETED → GRADUATED
	 * 2. No rollback allowed (can't go backwards)
	 * 3. Can't skip states (e.g., NOT_ONBOARDED can't go directly to COMPLETED)
	 * 4. DROPPED_OUT can happen from any state except GRADUATED and DROPPED_OUT
	 * 5. Once GRADUATED or DROPPED_OUT, no further transitions allowed
	 * @method
	 * @name validateStatusTransition
	 * @param {String} currentStatus - Current status
	 * @param {String} newStatus - New status to transition to
	 * @returns {Object} { valid: boolean, message: string }
	 */
	static validateStatusTransition(currentStatus, newStatus) {
		// If same status, no transition needed
		if (currentStatus === newStatus) {
			return { valid: true, message: 'No status change' }
		}

		const currentIndex = STATUS_ORDER.indexOf(currentStatus)
		const newIndex = STATUS_ORDER.indexOf(newStatus)

		// Invalid status values
		if (currentIndex === -1 || newIndex === -1) {
			return { valid: false, message: 'Invalid status value' }
		}

		// DROPPED_OUT and GRADUATED are terminal states - no further transitions
		if (currentStatus === 'DROPPED_OUT') {
			return { valid: false, message: 'Cannot transition from DROPPED_OUT. It is a terminal state.' }
		}

		if (currentStatus === 'GRADUATED') {
			return { valid: false, message: 'Cannot transition from GRADUATED. It is a terminal state.' }
		}

		// Allow DROPPED_OUT from any state except GRADUATED (already handled above)
		if (newStatus === 'DROPPED_OUT') {
			return { valid: true, message: 'Status transition to DROPPED_OUT is valid' }
		}

		// Cannot transition to DROPPED_OUT as it's handled above, so check normal flow
		// Exclude DROPPED_OUT from normal flow checks
		const normalFlowStatuses = STATUS_ORDER.slice(0, 5) // Exclude DROPPED_OUT
		const currentNormalIndex = normalFlowStatuses.indexOf(currentStatus)
		const newNormalIndex = normalFlowStatuses.indexOf(newStatus)

		// Rollback not allowed
		if (newNormalIndex < currentNormalIndex) {
			return {
				valid: false,
				message: `Rollback not allowed. Cannot transition from ${currentStatus} to ${newStatus}. Status must progress forward.`,
			}
		}

		// Skip not allowed - must be exactly next status
		if (newNormalIndex !== currentNormalIndex + 1) {
			const expectedNextStatus = normalFlowStatuses[currentNormalIndex + 1]
			return {
				valid: false,
				message: `Cannot skip status. Current: ${currentStatus}, Expected next: ${expectedNextStatus}, Attempted: ${newStatus}`,
			}
		}

		return { valid: true, message: 'Status transition is valid' }
	}

	/**
	 * Get valid next statuses for a given current status
	 * @method
	 * @name getValidNextStatuses
	 * @param {String} currentStatus - Current status
	 * @returns {Array} Array of valid next statuses
	 */
	static getValidNextStatuses(currentStatus) {
		const normalFlowStatuses = STATUS_ORDER.slice(0, 5) // Exclude DROPPED_OUT
		const currentIndex = normalFlowStatuses.indexOf(currentStatus)

		if (currentStatus === 'DROPPED_OUT' || currentStatus === 'GRADUATED') {
			return [] // Terminal states
		}

		const validStatuses = []

		// Next status in normal flow
		if (currentIndex < normalFlowStatuses.length - 1) {
			validStatuses.push(normalFlowStatuses[currentIndex + 1])
		}

		// DROPPED_OUT is always valid (except from GRADUATED which is handled above)
		validStatuses.push('DROPPED_OUT')

		return validStatuses
	}

	/**
	 * Check if user joined a program or not and consentShared
	 * @method
	 * @name checkForUserJoinedProgramAndConsentShared
	 * @param {String} programId - Program Id.
	 * @param {String} userId - User Id
	 * @returns {Object} result.
	 */
	static checkForUserJoinedProgramAndConsentShared(programId, userId) {
		return new Promise(async (resolve, reject) => {
			try {
				let result = {}
				const query = {
					userId: userId,
					programId: programId,
				}

				// Check data present in programUsers collection.
				let programUsers = await programUsersQueries.programUsersDocument(query, ['_id', 'consentShared'])
				result.joinProgram = programUsers.length > 0 ? true : false
				result.consentShared = programUsers.length > 0 ? programUsers[0].consentShared : false
				return resolve(result)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Create a new program user mapping.
	 * userId, tenantId, orgId are extracted from the decoded token (userDetails)
	 * @method
	 * @name create
	 * @param {Object} bodyData - request body data.
	 * @param {Object} userDetails - logged in user details (from decoded token).
	 * @returns {Object} created program user document.
	 */
	static create(bodyData, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				// Extract userId, tenantId, orgId from decoded token
				const tokenUserId = userDetails.userInformation.userId
				const tenantId = userDetails.userInformation.tenantId
				const orgId = userDetails.userInformation.organizationId

				// Use userId from body if provided, else use from token
				const userId = bodyData.userId || tokenUserId

				// Prepare program user data
				const programUserData = {
					programId: ObjectId(bodyData.programId),
					userId: userId,
					userProfile: bodyData.userProfile,
					userRoleInformation: bodyData.userRoleInformation || {},
					appInformation: bodyData.appInformation || {},
					consentShared: bodyData.consentShared || false,
					resourcesStarted: bodyData.resourcesStarted || false,
					status: bodyData.status || 'NOT_ONBOARDED',
					prevStatus: null,
					statusReason: bodyData.statusReason || null,
					// Metadata is optional - if passed use it, else keep empty
					metadata: bodyData.metadata || {},
					tenantId: tenantId,
					orgId: orgId,
					createdBy: tokenUserId,
					updatedBy: tokenUserId,
				}

				// Check if user already exists in this program
				const existingUser = await programUsersQueries.findOne({
					userId: userId,
					programId: ObjectId(bodyData.programId),
				})

				if (existingUser && existingUser._id) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_USER_ALREADY_EXISTS,
					})
				}

				// Create the program user document
				const createdProgramUser = await programUsersQueries.create(programUserData)

				if (!createdProgramUser || !createdProgramUser._id) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_USER_NOT_CREATED,
					})
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAM_USER_CREATED,
					data: createdProgramUser,
					result: createdProgramUser,
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					status: HTTP_STATUS_CODE.internal_server_error.status,
				})
			}
		})
	}

	/**
	 * Update a program user mapping.
	 * @method
	 * @name update
	 * @param {String} _id - program user id.
	 * @param {Object} bodyData - request body data.
	 * @param {Object} userDetails - logged in user details (from decoded token).
	 * @returns {Object} updated program user document.
	 */
	static update(_id, bodyData, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				// Validate _id field
				_id = _id === ':_id' ? null : _id

				if (!_id) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_USER_ID_REQUIRED,
					})
				}

				// Extract from decoded token
				const tokenUserId = userDetails.userInformation.userId
				const tenantId = userDetails.userInformation.tenantId

				// Build filter
				const filter = {
					_id: ObjectId(_id),
					tenantId: tenantId,
				}

				// Get current program user for status transition tracking
				const currentProgramUser = await programUsersQueries.findOne(filter)

				if (!currentProgramUser || !currentProgramUser._id) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.not_found.status,
						message: CONSTANTS.apiResponses.PROGRAM_USER_NOT_FOUND,
					})
				}

				// Validate status transition if status is being changed
				if (bodyData.status && bodyData.status !== currentProgramUser.status) {
					const validation = this.validateStatusTransition(currentProgramUser.status, bodyData.status)
					if (!validation.valid) {
						const validNextStatuses = this.getValidNextStatuses(currentProgramUser.status)
						return resolve({
							success: false,
							status: HTTP_STATUS_CODE.bad_request.status,
							message: validation.message,
							data: {
								currentStatus: currentProgramUser.status,
								attemptedStatus: bodyData.status,
								validNextStatuses: validNextStatuses,
							},
						})
					}
				}

				// Prepare update data
				const updateData = { $set: {} }

				// Prevent updating protected fields
				delete bodyData.tenantId
				delete bodyData.orgId
				delete bodyData.createdBy
				delete bodyData.programId
				delete bodyData.userId

				// If status is being changed, track the previous status
				if (bodyData.status && bodyData.status !== currentProgramUser.status) {
					updateData.$set.prevStatus = currentProgramUser.status
				}

				// Set updatedBy from token
				updateData.$set.updatedBy = tokenUserId

				// Add remaining fields to update
				Object.keys(bodyData).forEach((key) => {
					updateData.$set[key] = bodyData[key]
				})

				const updatedProgramUser = await programUsersQueries.findOneAndUpdate(filter, updateData, { new: true })

				if (!updatedProgramUser || !updatedProgramUser._id) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_USER_NOT_UPDATED,
					})
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAM_USER_UPDATED,
					data: updatedProgramUser,
					result: updatedProgramUser,
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					status: HTTP_STATUS_CODE.internal_server_error.status,
				})
			}
		})
	}

	/**
	 * Get program user details by ID.
	 * @method
	 * @name read
	 * @param {String} _id - program user id.
	 * @param {Object} userDetails - logged in user details (from decoded token).
	 * @returns {Object} program user document.
	 */
	static read(_id, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				// Validate _id field
				_id = _id === ':_id' ? null : _id

				if (!_id) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_USER_ID_REQUIRED,
					})
				}

				const tenantId = userDetails.userInformation.tenantId

				const filter = {
					_id: ObjectId(_id),
					tenantId: tenantId,
				}

				const programUser = await programUsersQueries.findOne(filter)

				if (!programUser || !programUser._id) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.not_found.status,
						message: CONSTANTS.apiResponses.PROGRAM_USER_NOT_FOUND,
					})
				}

				// Add valid next statuses to response
				programUser.validNextStatuses = this.getValidNextStatuses(programUser.status)

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAM_USER_FETCHED,
					data: programUser,
					result: programUser,
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					status: HTTP_STATUS_CODE.internal_server_error.status,
				})
			}
		})
	}

	/**
	 * List program users with filters and pagination.
	 * @method
	 * @name list
	 * @param {Object} queryParams - query parameters for filtering.
	 * @param {Object} bodyData - request body data for additional filters.
	 * @param {Object} userDetails - logged in user details (from decoded token).
	 * @returns {Object} paginated list of program users.
	 */
	static list(queryParams, bodyData, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				const tenantId = userDetails.userInformation.tenantId

				// Build filter query
				const filter = {
					tenantId: tenantId,
				}

				// Add optional filters from query params
				if (queryParams.programId) {
					filter.programId = ObjectId(queryParams.programId)
				}

				if (queryParams.userId) {
					filter.userId = queryParams.userId
				}

				if (queryParams.status) {
					filter.status = queryParams.status
				}

				if (queryParams.createdBy) {
					filter.createdBy = queryParams.createdBy
				}

				if (queryParams.orgId) {
					filter.orgId = queryParams.orgId
				}

				// Add filters from body if provided
				if (bodyData && Object.keys(bodyData).length > 0) {
					Object.keys(bodyData).forEach((key) => {
						if (key === 'programId') {
							filter.programId = ObjectId(bodyData.programId)
						} else if (!['page', 'limit'].includes(key)) {
							filter[key] = bodyData[key]
						}
					})
				}

				// Pagination - support both page/limit and offset/limit formats
				let page, limit, offset

				// Get limit (required for both formats)
				limit = parseInt(queryParams.limit) || parseInt(bodyData?.limit) || 10

				// Check if offset is provided (offset/limit format)
				if (queryParams.offset !== undefined || bodyData?.offset !== undefined) {
					offset = parseInt(queryParams.offset) || parseInt(bodyData?.offset) || 0
					page = Math.floor(offset / limit) + 1
				} else {
					// Use page/limit format (default)
					page = parseInt(queryParams.page) || parseInt(bodyData?.page) || 1
					offset = (page - 1) * limit
				}

				// Sort
				const sortData = { createdAt: -1 }

				// Get paginated results using offset-based pagination
				const result = await programUsersQueries.listWithOffset(filter, 'all', 'none', offset, limit, sortData)

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAM_USERS_FETCHED,
					data: result.data,
					result: result.data,
					count: result.totalCount,
					totalCount: result.totalCount,
					page: result.page,
					limit: result.limit,
					totalPages: result.totalPages,
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					status: HTTP_STATUS_CODE.internal_server_error.status,
				})
			}
		})
	}

	/**
	 * Delete a program user mapping.
	 * @method
	 * @name delete
	 * @param {String} _id - program user id.
	 * @param {Object} userDetails - logged in user details (from decoded token).
	 * @returns {Object} deletion result.
	 */
	static delete(_id, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				// Validate _id field
				_id = _id === ':_id' ? null : _id

				if (!_id) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_USER_ID_REQUIRED,
					})
				}

				const tenantId = userDetails.userInformation.tenantId

				const filter = {
					_id: ObjectId(_id),
					tenantId: tenantId,
				}

				// Check if the program user exists
				const programUser = await programUsersQueries.findOne(filter)

				if (!programUser || !programUser._id) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.not_found.status,
						message: CONSTANTS.apiResponses.PROGRAM_USER_NOT_FOUND,
					})
				}

				// Delete the program user
				const deleteResult = await programUsersQueries.deleteOne(filter)

				if (deleteResult.deletedCount === 0) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_USER_NOT_DELETED,
					})
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAM_USER_DELETED,
					data: { _id: _id },
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					status: HTTP_STATUS_CODE.internal_server_error.status,
				})
			}
		})
	}

	/**
	 * Update program user status with validation.
	 * Status must follow order: NOT_ONBOARDED → ONBOARDED → IN_PROGRESS → COMPLETED → GRADUATED
	 * DROPPED_OUT can happen from any state except GRADUATED
	 * No rollback allowed
	 * @method
	 * @name updateStatus
	 * @param {String} _id - program user id.
	 * @param {Object} bodyData - request body with new status.
	 * @param {Object} userDetails - logged in user details (from decoded token).
	 * @returns {Object} updated program user document.
	 */
	static updateStatus(_id, bodyData, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				// Validate _id field
				_id = _id === ':_id' ? null : _id

				if (!_id) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_USER_ID_REQUIRED,
					})
				}

				if (!bodyData.status) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.STATUS_REQUIRED,
					})
				}

				const tokenUserId = userDetails.userInformation.userId
				const tenantId = userDetails.userInformation.tenantId

				const filter = {
					_id: ObjectId(_id),
					tenantId: tenantId,
				}

				// Get current program user
				const currentProgramUser = await programUsersQueries.findOne(filter)

				if (!currentProgramUser || !currentProgramUser._id) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.not_found.status,
						message: CONSTANTS.apiResponses.PROGRAM_USER_NOT_FOUND,
					})
				}

				// Validate status transition
				const validation = this.validateStatusTransition(currentProgramUser.status, bodyData.status)
				if (!validation.valid) {
					const validNextStatuses = this.getValidNextStatuses(currentProgramUser.status)
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: validation.message,
						data: {
							currentStatus: currentProgramUser.status,
							attemptedStatus: bodyData.status,
							validNextStatuses: validNextStatuses,
							statusFlow:
								STATUS_ORDER.slice(0, 5).join(' → ') + ' (DROPPED_OUT from any except GRADUATED)',
						},
					})
				}

				// Prepare update data
				const updateData = {
					$set: {
						prevStatus: currentProgramUser.status,
						status: bodyData.status,
						statusReason: bodyData.statusReason || null,
						updatedBy: tokenUserId,
					},
				}

				const updatedProgramUser = await programUsersQueries.findOneAndUpdate(filter, updateData, { new: true })

				if (!updatedProgramUser || !updatedProgramUser._id) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_USER_STATUS_NOT_UPDATED,
					})
				}

				// Add valid next statuses to response
				updatedProgramUser.validNextStatuses = this.getValidNextStatuses(updatedProgramUser.status)

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAM_USER_STATUS_UPDATED,
					data: updatedProgramUser,
					result: updatedProgramUser,
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					status: HTTP_STATUS_CODE.internal_server_error.status,
				})
			}
		})
	}

	/**
	 * Update program user metadata.
	 * @method
	 * @name updateMetadata
	 * @param {String} _id - program user id.
	 * @param {Object} bodyData - request body with metadata updates.
	 * @param {Object} userDetails - logged in user details (from decoded token).
	 * @returns {Object} updated program user document.
	 */
	static updateMetadata(_id, bodyData, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				// Validate _id field
				_id = _id === ':_id' ? null : _id

				if (!_id) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_USER_ID_REQUIRED,
					})
				}

				if (!bodyData.metadata) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.METADATA_REQUIRED,
					})
				}

				const tokenUserId = userDetails.userInformation.userId
				const tenantId = userDetails.userInformation.tenantId

				const filter = {
					_id: ObjectId(_id),
					tenantId: tenantId,
				}

				// Check if program user exists
				const programUser = await programUsersQueries.findOne(filter)

				if (!programUser || !programUser._id) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.not_found.status,
						message: CONSTANTS.apiResponses.PROGRAM_USER_NOT_FOUND,
					})
				}

				// Merge metadata with existing metadata
				const updatedMetadata = {
					...programUser.metadata,
					...bodyData.metadata,
				}

				const updateData = {
					$set: {
						metadata: updatedMetadata,
						updatedBy: tokenUserId,
					},
				}

				const updatedProgramUser = await programUsersQueries.findOneAndUpdate(filter, updateData, { new: true })

				if (!updatedProgramUser || !updatedProgramUser._id) {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_USER_METADATA_NOT_UPDATED,
					})
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAM_USER_METADATA_UPDATED,
					data: updatedProgramUser,
					result: updatedProgramUser,
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					status: HTTP_STATUS_CODE.internal_server_error.status,
				})
			}
		})
	}

	/**
	 * Get program users by program ID.
	 * @method
	 * @name getByProgramId
	 * @param {String} programId - program id.
	 * @param {Object} queryParams - query parameters.
	 * @param {Object} userDetails - logged in user details (from decoded token).
	 * @returns {Object} list of program users.
	 */
	static getByProgramId(programId, queryParams, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				if (!programId || programId === ':_id') {
					return resolve({
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_ID_REQUIRED,
					})
				}

				const tenantId = userDetails.userInformation.tenantId

				const filter = {
					programId: ObjectId(programId),
					tenantId: tenantId,
				}

				// Add optional status filter
				if (queryParams.status) {
					filter.status = queryParams.status
				}

				// Pagination
				const page = parseInt(queryParams.page) || 1
				const limit = parseInt(queryParams.limit) || 10

				const result = await programUsersQueries.list(filter, 'all', 'none', page, limit, { createdAt: -1 })

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAM_USERS_FETCHED,
					data: result.data,
					result: result.data,
					count: result.totalCount,
					totalCount: result.totalCount,
					page: result.page,
					limit: result.limit,
					totalPages: result.totalPages,
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					status: HTTP_STATUS_CODE.internal_server_error.status,
				})
			}
		})
	}

	/**
	 * Read a program user by program ID and user ID
	 * @method
	 * @name readByProgramAndUserId
	 * @param {String} programId - Program ID
	 * @param {String} userId - User ID
	 * @param {Object} userDetails - logged in user details
	 * @returns {JSON} - program user details
	 */
	static readByProgramAndUserId(programId, userId, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				if (!programId) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: 'Program ID is required',
					}
				}

				if (!userId) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: 'User ID is required',
					}
				}

				let filterData = {
					programId: new ObjectId(programId),
					userId: userId,
					tenantId: userDetails.userInformation.tenantId,
					orgId: userDetails.userInformation.organizationId,
				}

				let programUser = await programUsersQueries.findOne(filterData)

				if (!programUser || !programUser._id) {
					throw {
						status: HTTP_STATUS_CODE.not_found.status,
						message: 'Program user not found',
					}
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAM_USER_FETCHED,
					data: programUser,
					result: programUser,
				})
			} catch (error) {
				return resolve({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
	 * Delete a program user resource
	 * @method
	 * @name deleteResource
	 * @param {String} _id - Program user ID to delete
	 * @param {Object} userDetails - logged in user details
	 * @returns {JSON} - deletion response
	 */
	static deleteResource(_id, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				if (!_id) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: 'Program user ID is required',
					}
				}

				let filterData = {
					_id: new ObjectId(_id),
					tenantId: userDetails.userInformation.tenantId,
					orgId: userDetails.userInformation.organizationId,
				}

				let programUser = await programUsersQueries.findOne(filterData)

				if (!programUser || !programUser._id) {
					throw {
						status: HTTP_STATUS_CODE.not_found.status,
						message: 'Program user not found',
					}
				}

				let deleteResult = await programUsersQueries.deleteOne(filterData)

				if (deleteResult.deletedCount === 0) {
					throw {
						status: HTTP_STATUS_CODE.not_found.status,
						message: 'Program user not found or already deleted',
					}
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAM_USER_DELETED,
					data: {
						_id: _id,
						deletedAt: new Date().toISOString(),
					},
					result: {
						_id: _id,
						deletedAt: new Date().toISOString(),
					},
				})
			} catch (error) {
				return resolve({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}
}

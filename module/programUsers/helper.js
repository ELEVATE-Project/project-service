/**
 * name : helper.js
 * author : prajwal
 * created-date : 10-Jun-2024
 * Description : Programs users related helper functionality.
 */

const { resolveLevel } = require('bunyan')

// Dependencies
const programUsersQueries = require(DB_QUERY_BASE_PATH + '/programUsers')
const programUsersService = require(SERVICES_BASE_PATH + '/programUsers')
const programQueries = require(DB_QUERY_BASE_PATH + '/programs')

/**
 * ProgramUsersHelper
 * @class
 */
module.exports = class ProgramUsersHelper {
	/**
	 * check if user joined a program or not and consentShared
	 * @methodcreateRecord
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

				//Check data present in programUsers collection.
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
	 * Create or update program user
	 * Handles all operations: create user, add entity, create record, update status
	 * @method
	 * @name createOrUpdate
	 * @param {Object} data - request body data containing all parameters
	 * @param {Object} userDetails - logged in user details
	 * @returns {Object} result with status and data
	 */
	static async createOrUpdate(data, userDetails) {
		try {
			const {
				userId,
				programId,
				programExternalId,
				entities,
				hierarchy,
				status,
				metaInformation,
				referenceFrom,
			} = data
			const loggedInUserId = userDetails.userInformation?.userId
			const tenantId = userDetails.userInformation?.tenantId
			const orgId = userDetails.userInformation?.organizationId

			// Validate required fields
			if (!userId || (!programId && !programExternalId)) {
				return {
					success: false,
					status: HTTP_STATUS_CODE.bad_request.status,
					message: 'userId and either programId or programExternalId are required',
				}
			}

			// Check if program exists for given programId or programExternalId
			const programExists = await this.checkProgramExists(tenantId, programId, programExternalId)
			if (!programExists) {
				return {
					success: false,
					status: HTTP_STATUS_CODE.not_found.status,
					message: 'Program not found',
				}
			}

			// Validate referenceFrom if provided
			if (referenceFrom) {
				const referenceProgramExists = await this.checkProgramExists(tenantId, referenceFrom, null)
				if (!referenceProgramExists || referenceProgramExists?.isAPrivateProgram) {
					return {
						success: false,
						status: HTTP_STATUS_CODE.not_found.status,
						message: 'Reference program not found OR is a private program',
					}
				}

				servicePayload.referenceFrom = referenceFrom
			}

			// Prepare service payload with all parameters
			const servicePayload = {
				tenantId,
				orgId,
				userId,
				programId,
				programExternalId,
				status,
				metaInformation,
				createdBy: loggedInUserId,
				updatedBy: loggedInUserId,
			}

			// Add entities if provided
			if (entities && entities.length > 0) {
				servicePayload.entities = entities
			}

			// Add hierarchy if provided
			if (hierarchy && Array.isArray(hierarchy) && hierarchy.length > 0) {
				servicePayload.hierarchy = hierarchy
			}

			// Call service with all parameters in single operation
			const result = await programUsersService.createOrUpdate(servicePayload)

			// // Determine activity type for logging
			// let activityType = 'STATUS_CHANGED';
			// if (entity) {
			// 	activityType = 'ENTITY_ADDED';
			// } else if (referenceFrom) {
			// 	activityType = 'RECORD_CREATED';
			// } else if (hierarchy && hierarchy.length > 0) {
			// 	activityType = 'USER_CREATED';
			// }

			// // Log activity asynchronously (non-blocking)
			// this.logActivity(activityType, result.result._id, {
			// 	userId,
			// 	programId,
			// 	...(entity && { entityId: entity.entityId, parentUserId: userId }),
			// 	...(referenceFrom && { parentProgramUsersId: referenceFrom }),
			// 	...(hierarchy && { hierarchyAdded: hierarchy.length }),
			// 	...(status && { newStatus: status })
			// }, loggedInUserId).catch(err => console.error('Activity logging error:', err));

			// // Publish event asynchronously (non-blocking)
			// this.publishEvent(activityType, {
			// 	userId,
			// 	programId,
			// 	...(entity && { entityUserId: entity.userId, entityId: entity.entityId }),
			// 	...(referenceFrom && { parentProgramUsersId: referenceFrom }),
			// 	...(status && { newStatus: status }),
			// 	timestamp: new Date()
			// }).catch(err => console.error('Event publishing error:', err));

			// Update overview asynchronously (non-blocking)
			if (result.result && result.result._id) {
				setImmediate(async () => {
					try {
						const entities = result.result.entities || []
						// Count entities by status
						const statusCounts = {
							onboarded: 0,
							inprogress: 0,
							completed: 0,
							graduated: 0,
							droppedout: 0,
							total: entities.length,
						}

						entities.forEach((entity) => {
							switch (entity.status) {
								case 'ONBOARDED':
									statusCounts.onboarded++
									break
								case 'IN_PROGRESS':
									statusCounts.inprogress++
									break
								case 'COMPLETED':
									statusCounts.completed++
									break
								case 'GRADUATED':
									statusCounts.graduated++
									break
								case 'DROP_OUT':
									statusCounts.droppedout++
									break
							}
						})

						// Update overview with status counts
						programUsersService
							.updateOverview(result.result._id, {
								$set: {
									'overview.assigned': statusCounts.total,
									'overview.onboarded': statusCounts.onboarded,
									'overview.inprogress': statusCounts.inprogress,
									'overview.completed': statusCounts.completed,
									'overview.graduated': statusCounts.graduated,
									'overview.droppedout': statusCounts.droppedout,
									'overview.lastModified': new Date(),
								},
							})
							.catch((err) => console.error('Overview update error:', err))
					} catch (err) {
						console.error('Error calculating entity counts:', err)
					}
				})
			}

			return {
				success: true,
				status: result.status,
				message: result.message,
				data: result.result,
				result: result.result,
			}
		} catch (error) {
			return {
				success: false,
				status: HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || 'Internal server error',
			}
		}
	}

	/**
	 * Get entities with pagination
	 * @method
	 * @name getEntitiesWithPagination
	 * @param {String} userId - user id
	 * @param {String} programId - program id
	 * @param {String} programExternalId - program external id
	 * @param {Number} page - page number
	 * @param {Number} limit - items per page
	 * @param {String} search - search query
	 * @returns {Object} result
	 */
	static async getEntitiesWithPagination(
		userId,
		programId,
		programExternalId,
		page = 1,
		limit = 20,
		search = '',
		userDetails
	) {
		try {
			// Call service
			const result = await programUsersService.getEntitiesWithPagination(
				userId,
				programId,
				programExternalId,
				page,
				limit,
				search,
				userDetails
			)

			return {
				success: true,
				status: result.status,
				message: result.message,
				data: result.data,
				result: result.data,
				count: result.count,
				total: result.total,
				overview: result.overview,
			}
		} catch (error) {
			return {
				success: false,
				status: HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || 'Internal server error',
			}
		}
	}

	/**
	 * Find program user
	 * @method
	 * @name findByUserAndProgram
	 * @param {String} userId - user id
	 * @param {String} programId - program id
	 * @param {String} programExternalId - program external id
	 * @returns {Object} program user document
	 */
	static async findByUserAndProgram(userId, programId, programExternalId) {
		try {
			return await programUsersService.findByUserAndProgram(userId, programId, programExternalId)
		} catch (error) {
			throw error
		}
	}

	/**
	 * Log activity to activity collection
	 * @method
	 * @name logActivity
	 * @param {String} activityType - type of activity (CREATE, UPDATE, ADD_ENTITY, etc)
	 * @param {String} programUsersRef - reference to programUsers document ID
	 * @param {Object} activityDetails - details of activity
	 * @param {String} createdBy - user who triggered activity
	 * @returns {Promise} void
	 */
	static async logActivity(activityType, programUsersRef, activityDetails, createdBy) {
		try {
			// Check if activity logging is enabled in config
			const activityConfig = global.config?.activityConfig?.[activityType]

			if (!activityConfig?.enabled) {
				return // Activity logging disabled for this type
			}

			// Create activity log entry
			const activity = {
				programUsersRef,
				activityType,
				activityDetails,
				createdBy,
				createdAt: new Date(),
			}

			// Insert into activity collection
			// Uncomment when programUsersActivities model is available
			// await database.models.programUsersActivities.create(activity);

			console.log('[ProgramUsers Activity]', activityType, activity)
		} catch (error) {
			// Don't throw - activity logging should not block main flow
			console.error('[ProgramUsers Activity Error]', error.message)
		}
	}

	/**
	 * Publish event to Kafka message queue
	 * @method
	 * @name publishEvent
	 * @param {String} eventType - type of event
	 * @param {Object} eventData - event data payload
	 * @returns {Promise} void
	 */
	static async publishEvent(eventType, eventData) {
		try {
			// Get kafka producer from global or environment
			const kafkaProducer = global.kafkaProducer || global.kafkaClient?.producer

			if (!kafkaProducer) {
				console.log('[ProgramUsers Event] Kafka producer not available, skipping event:', eventType)
				return
			}

			// Determine topic from environment or event type
			const topicName = process.env[`PROGRAMUSERS_${eventType}_TOPIC`] || 'program-users-events'

			const kafkaMessage = {
				key: eventData.userId || eventData.programId,
				value: JSON.stringify({
					eventType,
					eventData,
					timestamp: new Date().toISOString(),
					service: 'project-service',
				}),
			}

			// Send to Kafka (implementation depends on kafka client version)
			await kafkaProducer.send({
				topic: topicName,
				messages: [kafkaMessage],
			})

			console.log('[ProgramUsers Event Published]', eventType, 'to', topicName)
		} catch (error) {
			// Don't throw - event publishing should not block main flow
			console.error('[ProgramUsers Event Error]', eventType, error.message)
		}
	}

	/**
	 * Check if program exists by programId or programExternalId
	 * @method
	 * @name checkProgramExists
	 * @param {String} programId - program ID
	 * @param {String} programExternalId - program external ID
	 * @returns {Boolean} true if program exists, false otherwise
	 */
	static checkProgramExists(tenantId, programId, programExternalId) {
		return new Promise(async (resolve, reject) => {
			try {
				let programMatchQuery = {}
				programMatchQuery['tenantId'] = tenantId

				if (programId) {
					programMatchQuery['_id'] = programId
				} else {
					programMatchQuery['externalId'] = programExternalId
				}

				let programData = await programQueries.programsDocument(programMatchQuery, [
					'name',
					'externalId',
					'isAPrivateProgram',
				])
				if (programData && programData.length > 0) {
					return resolve(programData[0])
				} else {
					return resolve(false)
				}
			} catch (error) {
				return reject(error)
			}
		})
	}
}

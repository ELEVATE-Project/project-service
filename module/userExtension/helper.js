const programsHelper = require(MODULES_BASE_PATH + '/programs/helper')
const userService = require(GENERICS_FILES_PATH + '/services/users')
const userExtensionsQueries = require(DB_QUERY_BASE_PATH + '/userExtension')
const kafkaProducersHelper = require(GENERICS_FILES_PATH + '/kafka/producers')
/**
 * UserExtensionHelper
 * @class
 */

module.exports = class UserExtensionHelper {
	/**
	 * Bulk create or update user.
	 * @method
	 * @name bulkCreateOrUpdate
	 * @param {Array} userRolesCSVData
	 * @param {Object} userDetails -logged in user details.
	 * @param {String} userDetails.id -logged in user id.
	 * @param {Object} tenantAndOrgInfo -tenant and organization information.
	 * @returns {Array}
	 */
	static bulkCreateOrUpdate(userRolesCSVData, userDetails, tenantAndOrgInfo) {
		return new Promise(async (resolve, reject) => {
			try {
				let userRoleMap = {}
				let userRolesUploadedData = new Array()
				let aggregateKafkaEventPayloads = []
				// Pre-fetch all required data
				const allProgramIds = new Set()
				const allUserIds = new Set()

				//iterating through userRolesCSVData to collect all programIds and userIds
				for (const csvRow of userRolesCSVData) {
					const userRole = UTILS.valueParser(csvRow)

					if (userRole.programs && userRole.programs.length > 0) {
						userRole.programs.forEach((programId) => allProgramIds.add(programId))
					}

					if (userRole.user) {
						allUserIds.add(userRole.user)
					}
				}

				// Fetch program data
				/*
			arguments passed to programsHelper.list() are:
			- filter: { externalId: { $in: Array.from(allProgramIds) } }
			- projection: ['_id', 'externalId']
			- sort: ''
			- skip: ''
			- limit: ''
			- tenantAndOrgInfo: tenant and organization information passed from req.headers
			*/
				//fetching all programs data based on externalId
				// this is done to avoid multiple database calls for each program
				const allProgramsData = await programsHelper.list(
					'',
					'',
					'',
					{
						userInformation: {
							tenantId: tenantAndOrgInfo.tenantId,
							organizationId: tenantAndOrgInfo.organizationId,
						},
					},
					false,
					{ externalId: { $in: Array.from(allProgramIds) } }
				)

				// Create maps for program IDs and program information
				//programIdMap will map external program IDs to internal MongoDB ObjectIDs
				//programInfoMap will map internal MongoDB ObjectIDs to program information
				//this is made to avoid multiple database calls for each program
				const programIdMap = {}
				const programInfoMap = {}
				const programs = allProgramsData?.data?.data || []
				for (const program of programs) {
					programIdMap[program.externalId] = program._id
					programInfoMap[program._id.toString()] = program
				}

				// Fetch user profiles
				const userProfileMap = {}
				const userProfileResults = await Promise.allSettled(
					Array.from(allUserIds).map((userId) =>
						userService
							.fetchProfileBasedOnUserIdOrName(tenantAndOrgInfo.tenantId, null, userId)
							.then((result) => ({ userId, ...result }))
					)
				)

				for (const result of userProfileResults) {
					if (result.status === CONSTANTS.common.PROMISE_FULFILLED && result.value.success) {
						userProfileMap[result.value.userId] = result.value.data
					}
				}

				// Check if any user profiles were found
				// if no user profiles were found, throw an error
				if (Object.keys(userProfileMap).length === 0) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.USER_NOT_FOUND,
					}
				}

				// Fetch user extensions

				const userExtensionDocs = await userExtensionsQueries.userExtensionDocument(
					{
						userId: { $in: Object.values(userProfileMap).map((u) => u.id) },
						tenantId: tenantAndOrgInfo.tenantId,
					},
					['userId', 'programRoleMapping']
				)

				const userExtensionMap = {}
				for (const doc of userExtensionDocs) {
					userExtensionMap[doc.userId] = doc
				}

				// Process each CSV row
				// iterating through userRolesCSVData to process each user role
				outerloop: for (const csvRow of userRolesCSVData) {
					let userRole = UTILS.valueParser(csvRow)
					userRole['_SYSTEM_ID'] = ''

					try {
						// Validate programs exist
						if (userRole.programs && userRole.programs.length > 0) {
							const programDocumentsArray = userRole.programs.map((p) => programIdMap[p]).filter(Boolean)

							if (programDocumentsArray.length === 0) {
								userRole['_SYSTEM_ID'] = ''
								userRole.status = CONSTANTS.apiResponses.PROGRAM_NOT_FOUND
								userRolesUploadedData.push(userRole)
								continue
							}
						}

						// Validate user exists
						const userProfile = userProfileMap[userRole.user]
						if (!userProfile) {
							userRole['_SYSTEM_ID'] = ''
							userRole.status = CONSTANTS.apiResponses.USER_NOT_FOUND
							userRolesUploadedData.push(userRole)
							continue outerloop
						}

						// Validate platform roles
						const platform_role_array = userRole.platform_role?.split(',').map((r) => r.trim()) || []
						const orgRoles = userProfile.organizations.flatMap(
							(org) => org.roles?.map((r) => r.title) || []
						)
						if (platform_role_array.some((role) => !orgRoles.includes(role))) {
							userRole.status = CONSTANTS.apiResponses.INVALID_ROLE_CODE
							userRolesUploadedData.push(userRole)
							continue outerloop
						}

						let existingUser = userExtensionMap[userProfile.id.toString()]
						let user = ''
						const kafkaEventPayloads = []

						if (!existingUser) {
							// Create new user extension
							const userInformation = {
								userId: userProfile.id,
								externalId: userRole.user,
								status: CONSTANTS.common.ACTIVE_STATUS,
								updatedBy: userDetails.userId,
								createdBy: userDetails.userId,
								programRoleMapping: [],
								tenantId: tenantAndOrgInfo.tenantId,
								orgIds: Array.isArray(userProfile.organizations)
									? userProfile.organizations
											.filter((org) => org && typeof org.code === 'string')
											.map((org) => org.code)
									: [],
							}

							//if both programOperation and programs are present, we will process the roles for each program
							if (userRole.programOperation && userRole.programs) {
								// Check if programs exist in the programIdMap
								for (const program of userRole.programs) {
									const programId = programIdMap[program]

									if (!programId) {
										userRole.status = CONSTANTS.apiResponses.PROGRAM_NOT_FOUND
										userRolesUploadedData.push(userRole)
										continue outerloop
									}

									const roles = platform_role_array
									let entry = userInformation.programRoleMapping.find(
										(pr) => pr.programId.toString() === programId.toString()
									)

									if (!entry) {
										entry = { programId: programId, roles: [] }
										userInformation.programRoleMapping.push(entry)
									}

									for (const role of roles) {
										if (!entry.roles.includes(role)) {
											entry.roles.push(role)
											// Emit create event for new role
											kafkaEventPayloads.push({
												userId: userProfile.id,
												username: userProfile.username,
												programId: programId,
												role,
												eventType: CONSTANTS.common.CREATE_EVENT_TYPE,
											})
										}
									}
								}
							}

							user = await userExtensionsQueries.createUserExtension(userInformation)
							userExtensionMap[user.userId.toString()] = user

							userRole['_SYSTEM_ID'] = user?._id || ''
							userRole.status = user ? 'Success' : 'Failed to create the user role.'
							userRole._kafkaEventPayloads = kafkaEventPayloads
							aggregateKafkaEventPayloads.push(...kafkaEventPayloads)
						} else {
							// Update existing user
							let existingUserProgramRoleMapping = [...(existingUser.programRoleMapping || [])]

							if (userRole.programOperation && userRole.programs) {
								for (const program of userRole.programs) {
									const programId = programIdMap[program]

									if (!programId) {
										userRole.status = CONSTANTS.apiResponses.PROGRAM_NOT_FOUND
										userRolesUploadedData.push(userRole)
										continue outerloop
									}

									const currentRoleInfoIndex = existingUserProgramRoleMapping.findIndex(
										(pr) => pr.programId.toString() === programId.toString()
									)

									const newRoles = platform_role_array

									if (userRole.programOperation === CONSTANTS.common.OVERRIDE_OPERATION) {
										if (currentRoleInfoIndex !== -1) {
											const currentRoles =
												existingUserProgramRoleMapping[currentRoleInfoIndex].roles

											// Find roles to remove (exist in current but not in new)
											const rolesToRemove = currentRoles.filter(
												(role) => !newRoles.includes(role)
											)
											for (const role of rolesToRemove) {
												kafkaEventPayloads.push({
													userId: userProfile.id,
													username: userProfile.username,
													programId: programId,
													role,
													eventType: CONSTANTS.common.DELETE_EVENT_TYPE,
												})
											}

											// Find roles to add (exist in new but not in current)
											const rolesToAdd = newRoles.filter((role) => !currentRoles.includes(role))
											for (const role of rolesToAdd) {
												kafkaEventPayloads.push({
													userId: userProfile.id,
													username: userProfile.username,
													programId: programId,
													role,
													eventType: CONSTANTS.common.CREATE_EVENT_TYPE,
												})
											}

											// Override the roles
											existingUserProgramRoleMapping[currentRoleInfoIndex].roles = [...newRoles]
										} else {
											// Create new program entry
											existingUserProgramRoleMapping.push({
												programId: programId,
												roles: [...newRoles],
											})

											// All roles are new, emit create events
											for (const role of newRoles) {
												kafkaEventPayloads.push({
													userId: userProfile.id,
													username: userProfile.username,
													programId: programId,
													role,
													eventType: CONSTANTS.common.CREATE_EVENT_TYPE,
												})
											}
										}
									} else if (
										userRole.programOperation === CONSTANTS.common.ADD_OPERATION ||
										userRole.programOperation === CONSTANTS.common.APPEND_OPERATION
									) {
										if (currentRoleInfoIndex !== -1) {
											// Add roles to existing program entry
											const currentRoles =
												existingUserProgramRoleMapping[currentRoleInfoIndex].roles

											for (const role of newRoles) {
												if (!currentRoles.includes(role)) {
													existingUserProgramRoleMapping[currentRoleInfoIndex].roles.push(
														role
													)
													kafkaEventPayloads.push({
														userId: userProfile.id,
														username: userProfile.username,
														programId: programId,
														role,
														eventType: CONSTANTS.common.CREATE_EVENT_TYPE,
													})
												}
											}
										} else {
											// Create new program entry
											existingUserProgramRoleMapping.push({
												programId: programId,
												roles: [...newRoles],
											})

											// All roles are new, emit create events
											for (const role of newRoles) {
												kafkaEventPayloads.push({
													userId: userProfile.id,
													username: userProfile.username,
													programId: programId,
													role,
													eventType: CONSTANTS.common.CREATE_EVENT_TYPE,
												})
											}
										}
									} else if (userRole.programOperation === CONSTANTS.common.REMOVE_OPERATION) {
										if (currentRoleInfoIndex !== -1) {
											const currentRoles =
												existingUserProgramRoleMapping[currentRoleInfoIndex].roles

											// Remove specified roles
											const rolesToKeep = currentRoles.filter((role) => !newRoles.includes(role))

											// Emit delete events for removed roles
											const rolesToRemove = currentRoles.filter((role) => newRoles.includes(role))
											for (const role of rolesToRemove) {
												kafkaEventPayloads.push({
													userId: userProfile.id,
													username: userProfile.username,
													programId: programId,
													role,
													eventType: CONSTANTS.common.DELETE_EVENT_TYPE,
												})
											}

											if (rolesToKeep.length === 0) {
												// Remove entire program entry if no roles left
												existingUserProgramRoleMapping.splice(currentRoleInfoIndex, 1)
											} else {
												// Update with remaining roles
												existingUserProgramRoleMapping[currentRoleInfoIndex].roles = rolesToKeep
											}
										}
										// If program doesn't exist, nothing to remove - no error needed
									}
								}
							}

							// Update user extension document
							const updateQuery = { programRoleMapping: existingUserProgramRoleMapping }
							user = await userExtensionsQueries.findAndUpdate(
								{ _id: existingUser._id, tenantId: tenantAndOrgInfo.tenantId },
								updateQuery,
								{
									new: true,
									returnNewDocument: true,
								}
							)
							userExtensionMap[user.userId.toString()] = user

							userRole['_SYSTEM_ID'] = existingUser._id
							userRole.status = 'Success'

							userRole._kafkaEventPayloads = kafkaEventPayloads
							aggregateKafkaEventPayloads.push(...kafkaEventPayloads)
						}
					} catch (error) {
						userRole.status = error && error.message ? error.message : error
					}

					userRolesUploadedData.push(userRole)
				}

				for (let kafkaEventPayload of aggregateKafkaEventPayloads) {
					let eventObj = {
						entity: 'program',
						eventType: kafkaEventPayload.eventType,
						username: kafkaEventPayload.username,
						userId: kafkaEventPayload.userId,
						role: kafkaEventPayload.role,
						meta: {
							programInformation: {
								name: programInfoMap[kafkaEventPayload.programId].externalId,
								externalId: programInfoMap[kafkaEventPayload.programId].externalId,
								id: kafkaEventPayload.programId.toString(),
							},
						},
					}

					kafkaProducersHelper.pushProgramOperationEvent(eventObj)
				}

				return resolve(userRolesUploadedData)
			} catch (error) {
				return reject(error)
			}
		})
	}
	/**
	 * find userExtensions
	 * @method
	 * @name userExtensionDocuments
	 * @param {Array} [userExtensionFilter = "all"] - userId ids.
	 * @param {Array} [fieldsArray = "all"] - projected fields.
	 * @param {Array} [skipFields = "none"] - field not to include
	 * @returns {Array} List of Users.
	 */

	static userExtensionDocuments(userExtensionFilter = 'all', fieldsArray = 'all', skipFields = 'none') {
		return new Promise(async (resolve, reject) => {
			try {
				let queryObject = userExtensionFilter != 'all' ? userExtensionFilter : {}

				let projection = {}

				if (fieldsArray != 'all') {
					fieldsArray.forEach((field) => {
						projection[field] = 1
					})
				}

				if (skipFields !== 'none') {
					skipFields.forEach((field) => {
						projection[field] = 0
					})
				}

				let userDocuments = await database.models.userExtension.find(queryObject, projection).lean()

				return resolve(userDocuments)
			} catch (error) {
				return reject(error)
			}
		})
	}
}

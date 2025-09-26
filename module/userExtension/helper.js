const programsHelper = require(MODULES_BASE_PATH + '/programs/helper')
const userService = require(GENERICS_FILES_PATH + '/services/users')
const userExtensionsQueries = require(DB_QUERY_BASE_PATH + '/userExtension')
const kafkaProducersHelper = require(GENERICS_FILES_PATH + '/kafka/producers')
const programQueries = require(DB_QUERY_BASE_PATH + '/programs')
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

				if (Array.from(allProgramIds).length == 0) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
					}
				}

				if (Array.from(allUserIds).length === 0) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.USER_PROFILE_NOT_FOUND,
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
					{ externalId: { $in: Array.from(allProgramIds) } },
					['_id', 'externalId', 'name']
				)

				// Create maps for program IDs and program information
				//programIdMap will map external program IDs to internal MongoDB ObjectIDs
				//programInfoMap will map internal MongoDB ObjectIDs to program information
				//this is made to avoid multiple database calls for each program
				const programIdMap = {}
				const programInfoMap = {}
				const programs = allProgramsData?.data?.data || []

				if (programs.length === 0) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
					}
				}

				for (const program of programs) {
					programIdMap[program.externalId] = program._id
					programInfoMap[program._id.toString()] = program
				}

				// Fetch user profiles
				const userProfileMap = {}
				const userProfileResults = await Promise.allSettled(
					Array.from(allUserIds).map((userId) =>
						userService
							.getUserProfileByIdentifier(tenantAndOrgInfo.tenantId, null, userId)
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
						message: CONSTANTS.apiResponses.USER_PROFILE_NOT_FOUND,
					}
				}

				// Fetch user extensions

				const userExtensionDocs = await userExtensionsQueries.userExtensionDocument(
					{
						userId: { $in: Object.values(userProfileMap).map((user) => user.id) },
						tenantId: tenantAndOrgInfo.tenantId,
					},
					['userId', 'programRoleMapping']
				)

				const userExtensionMap = {}
				for (const userExtension of userExtensionDocs) {
					userExtensionMap[userExtension.userId] = userExtension
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
							userRole.status = CONSTANTS.apiResponses.USER_PROFILE_NOT_FOUND
							userRolesUploadedData.push(userRole)
							continue outerloop
						}

						// Validate platform roles
						const platform_role_array = userRole.platform_role?.split(',').map((role) => role.trim()) || []
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
							if (
								[
									CONSTANTS.common.OVERRIDE_OPERATION,
									CONSTANTS.common.ADD_OPERATION,
									CONSTANTS.common.APPEND_OPERATION,
								].includes(userRole.programOperation)
							) {
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
												kafkaEventPayloads.push(
													createKafkaPayload(
														userProfile,
														programId,
														role,
														CONSTANTS.common.CREATE_EVENT_TYPE,
														programInfoMap
													)
												)
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
							}
						} else {
							// Update existing user
							let existingUserProgramRoleMapping = [...(existingUser.programRoleMapping || [])]

							if (userRole.programOperation && userRole.programs) {
								//iterating through userRole.programs to process each program
								for (const program of userRole.programs) {
									const programId = programIdMap[program]
									// Check if program exists in the programIdMap, if not continue to next iteration
									if (!programId) {
										userRole.status = CONSTANTS.apiResponses.PROGRAM_NOT_FOUND
										userRolesUploadedData.push(userRole)
										continue outerloop
									}

									// Check if program already exists in user's programRoleMapping
									// Find the index of the program in existingUserProgramRoleMapping
									// This will help us determine if we need to add, remove, or update roles
									const currentRoleInfoIndex = existingUserProgramRoleMapping.findIndex(
										(pr) => pr.programId.toString() === programId.toString()
									)

									const newRoles = platform_role_array
									// Check if the userRole.programOperation is valid
									if (userRole.programOperation === CONSTANTS.common.OVERRIDE_OPERATION) {
										// If program exists, update roles
										if (currentRoleInfoIndex !== -1) {
											const currentRoles =
												existingUserProgramRoleMapping[currentRoleInfoIndex].roles

											// Find roles to remove (exist in current but not in new)
											const rolesToRemove = currentRoles.filter(
												(role) => !newRoles.includes(role)
											)
											for (const role of rolesToRemove) {
												kafkaEventPayloads.push(
													createKafkaPayload(
														userProfile,
														programId,
														role,
														CONSTANTS.common.DELETE_EVENT_TYPE,
														programInfoMap
													)
												)
											}

											// Find roles to add (exist in new but not in current)
											const rolesToAdd = newRoles.filter((role) => !currentRoles.includes(role))
											for (const role of rolesToAdd) {
												kafkaEventPayloads.push(
													createKafkaPayload(
														userProfile,
														programId,
														role,
														CONSTANTS.common.CREATE_EVENT_TYPE,
														programInfoMap
													)
												)
											}

											// Override the roles
											existingUserProgramRoleMapping[currentRoleInfoIndex].roles = [...newRoles]
										} else {
											// Create new program entry
											addNewProgramEntry(
												userProfile,
												programId,
												newRoles,
												existingUserProgramRoleMapping,
												kafkaEventPayloads,
												programInfoMap
											)
										}
									} else if (
										userRole.programOperation === CONSTANTS.common.ADD_OPERATION ||
										userRole.programOperation === CONSTANTS.common.APPEND_OPERATION
									) {
										if (currentRoleInfoIndex !== -1) {
											// Add roles to existing program entry
											const currentRoles =
												existingUserProgramRoleMapping[currentRoleInfoIndex].roles
											//iterates through newRoles to add them to existing roles
											// Check if new roles are already present
											// If not, add them
											// If they are present, do nothing
											for (const role of newRoles) {
												if (!currentRoles.includes(role)) {
													existingUserProgramRoleMapping[currentRoleInfoIndex].roles.push(
														role
													)
													kafkaEventPayloads.push(
														createKafkaPayload(
															userProfile,
															programId,
															role,
															CONSTANTS.common.CREATE_EVENT_TYPE,
															programInfoMap
														)
													)
												}
											}
										} else {
											// Create new program entry
											addNewProgramEntry(
												userProfile,
												programId,
												newRoles,
												existingUserProgramRoleMapping,
												kafkaEventPayloads,
												programInfoMap
											)
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
												kafkaEventPayloads.push(
													createKafkaPayload(
														userProfile,
														programId,
														role,
														CONSTANTS.common.DELETE_EVENT_TYPE,
														programInfoMap
													)
												)
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
					kafkaProducersHelper.pushProgramOperationEvent(kafkaEventPayload)
				}

				return resolve(userRolesUploadedData)
			} catch (error) {
				return reject(error)
			}
		})
	}

	static update(bodyData, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				// Extract userIds from incoming body data
				const userIds = bodyData.map((user) => user.userId)

				// Extract tenant & user information
				const tenantId = userDetails.tenantAndOrgInfo.tenantId
				const userName = userDetails.userInformation.userName

				// Fetch user details from user service
				const { success, data } = (await userService.accountSearch(userIds, tenantId)) || {}

				// Throw error if no valid users returned from service
				if (!success || !data || data.count === 0) {
					throw {
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.USER_EXTENSION_UPDATE_FAILED,
					}
				}

				// Map returned users into simplified objects
				let validUsers = data.data.map((user) => {
					return {
						id: user.id,
						username: user.name,
						orgId: user.user_organizations[0].organization_code,
						roles: user.user_organizations[0].roles.map((role) => role.role.title),
					}
				})

				// Create a map for quick user lookups by id
				const usersMap = new Map()
				validUsers.forEach((user) => {
					usersMap.set(user.id, user)
				})

				// Filter body data to only include valid users
				let validUserIds = validUsers.map((user) => user.id)
				let filteredBodyData = bodyData.filter((data) => validUserIds.includes(data.userId))

				// Extract all programIds from filtered body data
				const allProgramIds = filteredBodyData.map((data) => data.programId)

				// Fetch program details for all programIds
				const allProgramsData = await programQueries.programsDocument(
					{
						_id: { $in: allProgramIds },
					},
					['name', 'externalId']
				)

				// Create a map of programId to program data
				const programsMap = {}
				allProgramsData.map((program) => {
					programsMap[program._id] = program
				})
				let responses = []
				let kafkaMessages = []

				// Loop over each filtered body data entry
				for (const data of filteredBodyData) {
					let orgId

					// Find the user’s orgId and intersect roles between request and user
					for (const user of validUsers) {
						if (user.id == data.userId) {
							orgId = user.orgId
							let validUserRoles = user.roles.filter((role) => data.roles.includes(role))
							data.roles = validUserRoles
							break
						}
					}
					const operation = data.operation.toUpperCase()

					// Fetch existing userExtension doc if any
					let userExtension = await userExtensionsQueries.userExtensionDocument({
						userId: data.userId,
						tenantId,
					})
					const userExtensionDoc =
						Array.isArray(userExtension) && userExtension.length > 0 ? userExtension[0] : null

					// Early failure condition
					if (!userExtensionDoc && operation === CONSTANTS.common.REMOVE_OPERATION) {
						responses.push(buildResponse(false, data))
						continue
					}

					// =================== REMOVE OPERATION ===================
					if (operation === CONSTANTS.common.REMOVE_OPERATION) {
						if (!userExtensionDoc?.programRoleMapping) {
							responses.push(buildResponse(false, data, userExtensionDoc?._id))
							continue
						}

						try {
							// Pull programRoleMapping by programId
							await userExtensionsQueries.findAndUpdate(
								{ _id: userExtensionDoc._id, tenantId },
								{
									$pull: { programRoleMapping: { programId: ObjectId(data.programId) } },
									updatedBy: userName,
								}
							)

							// Mark success and push Kafka delete event
							responses.push(buildResponse(true, data, userExtensionDoc._id))
							data.roles.map((role) => {
								kafkaMessages.push(
									createKafkaPayload(
										usersMap.get(data.userId),
										data.programId,
										role,
										CONSTANTS.common.DELETE_EVENT_TYPE,
										programsMap
									)
								)
							})
						} catch (err) {
							responses.push(buildResponse(false, data, userExtensionDoc._id))
						}
						continue
					}

					// =================== APPEND OPERATION ===================
					if (operation === CONSTANTS.common.APPEND_OPERATION) {
						if (userExtensionDoc) {
							// If userExtension already exists, add new programRoleMapping if not present
							try {
								await userExtensionsQueries.findAndUpdate(
									{
										_id: ObjectId(userExtensionDoc._id),
										userId: data.userId,
										tenantId,
										'programRoleMapping.programId': { $ne: ObjectId(data.programId) },
									},
									{
										$addToSet: {
											programRoleMapping: {
												programId: ObjectId(data.programId),
												roles: data.roles,
											},
										},
										updatedBy: userName,
									}
								)
								// Mark success and push Kafka create event
								responses.push(buildResponse(true, data, userExtensionDoc._id))
								data.roles.map((role) => {
									kafkaMessages.push(
										createKafkaPayload(
											usersMap.get(data.userId),
											data.programId,
											role,
											CONSTANTS.common.CREATE_EVENT_TYPE,
											programsMap
										)
									)
								})
							} catch (err) {
								responses.push(buildResponse(false, data, userExtensionDoc._id))
							}
						} else {
							// If userExtension does not exist, create new userExtension record
							try {
								const newUserExtension = await userExtensionsQueries.createUserExtension({
									userId: data.userId.toString(),
									tenantId,
									orgIds: [orgId],
									externalId: `${tenantId}-${orgId}-${data.userId}`,
									programRoleMapping: [
										{
											programId: ObjectId(data.programId),
											roles: data.roles,
										},
									],
									createdBy: userName,
									updatedBy: userName,
								})
								// Mark success and push Kafka create event
								responses.push(buildResponse(true, data, newUserExtension._id))
								data.roles.map((role) => {
									kafkaMessages.push(
										createKafkaPayload(
											usersMap.get(data.userId),
											data.programId,
											role,
											CONSTANTS.common.CREATE_EVENT_TYPE,
											programsMap
										)
									)
								})
							} catch (err) {
								responses.push(buildResponse(false, data))
							}
						}
					}
				}
				// Push all Kafka messages at the end
				for (let message of kafkaMessages) {
					kafkaProducersHelper.pushProgramOperationEvent(message)
				}
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.USER_EXTENSION_UPDATED,
					data: responses,
					result: responses,
				})
			} catch (error) {
				return reject(error)
			}
		})
	}
}

/**
 * Create a Kafka event payload for a user-program-role mapping operation.
 * @method
 * @name createKafkaPayload
 * @param {Object} userProfile - The user profile object containing `id` and `username`.
 * @param {String} programId - The ID of the program being mapped.
 * @param {String} role - The role being assigned or removed.
 * @param {String} eventType - The type of event ('create' or 'delete').
 * @param {Object} programInfoMap - stores aggregated program info
 * @returns {Object} - Kafka event payload.
 */
function createKafkaPayload(userProfile, programId, role, eventType, programInfoMap) {
	return {
		userId: userProfile.id,
		username: userProfile.username,
		role,
		eventType,
		entity: CONSTANTS.common.PROGRAM,
		meta: {
			programInformation: {
				name: programInfoMap[programId].name,
				externalId: programInfoMap[programId].externalId,
				id: programId.toString(),
			},
		},
	}
}
/**
 * Add a new program-role mapping to a user's profile and populate Kafka events.
 * @method
 * @name addNewProgramEntry
 * @param {Object} userProfile - The user profile object containing `id` and `username`.
 * @param {String} programId - The ID of the new program being added.
 * @param {Array<String>} newRoles - The list of roles to assign under the new program.
 * @param {Array<Object>} existingUserProgramRoleMapping - Current program-role mappings to be updated.
 * @param {Array<Object>} kafkaEventPayloads - Array to which Kafka event payloads will be pushed.
 * @param {Object} programInfoMap - Map containing program information for the new program.
 * @returns {void}
 */
function addNewProgramEntry(
	userProfile,
	programId,
	newRoles,
	existingUserProgramRoleMapping,
	kafkaEventPayloads,
	programInfoMap
) {
	existingUserProgramRoleMapping.push({
		programId: programId,
		roles: [...newRoles],
	})
	// All roles are new, emit create events
	for (const role of newRoles) {
		kafkaEventPayloads.push(
			createKafkaPayload(userProfile, programId, role, CONSTANTS.common.CREATE_EVENT_TYPE, programInfoMap)
		)
	}
}

/**
 *
 * @param {String} success - success response [ true / false ]
 * @param {Object} data - program data
 * @param {String} id - userExtension id
 * @returns {Object}
 */

function buildResponse(success, data, id = null) {
	return {
		success,
		message: success
			? CONSTANTS.apiResponses.USER_EXTENSION_UPDATED
			: CONSTANTS.apiResponses.USER_EXTENSION_UPDATE_FAILED,
		userId: data.userId,
		_id: id,
		programId: data.programId,
		roles: data.roles,
	}
}

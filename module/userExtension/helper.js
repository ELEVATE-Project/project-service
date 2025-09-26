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

				//delete invalid program operations from csv data
				for (let index = userRolesCSVData.length - 1; index >= 0; index--) {
					const userRole = UTILS.valueParser(userRolesCSVData[index])

					// Safely handle missing/null/undefined programOperation
					const programOperation = userRole.programOperation
						? UTILS.upperCase(userRole.programOperation)
						: null

					if (
						programOperation === CONSTANTS.common.REMOVE_OPERATION ||
						programOperation === CONSTANTS.common.ADD_OPERATION
					) {
						userRolesCSVData[index].programOperation = programOperation
					} else {
						userRolesCSVData.splice(index, 1)
					}
				}

				if (userRolesCSVData.length === 0) {
					throw {
						status: httpStatusCode.bad_request.status,
						message: CONSTANTS.apiResponses.INVALID_MAPPING_DATA,
					}
				}

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
					{
						externalId: { $in: Array.from(allProgramIds) },
						tenantId: tenantAndOrgInfo.tenantId,
						orgId: tenantAndOrgInfo.orgId[0],
					},
					['_id', 'externalId', 'name', 'orgId']
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

				//iterating through userProfileMap to check if user belongs to same org
				for (let userId in userProfileMap) {
					const user = userProfileMap[userId]
					if (
						!user.organizations ||
						!Array.isArray(user.organizations) ||
						user.organizations.length === 0 ||
						!user.organizations.find((org) => org.code === tenantAndOrgInfo.orgId[0])
					) {
						delete userProfileMap[userId]
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

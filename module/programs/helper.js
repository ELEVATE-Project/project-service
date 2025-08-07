/**
 * name : helper.js
 * author : Aman
 * created-date : 03-sep-2020
 * Description : Programs related helper functionality.
 */

// Dependencies

const timeZoneDifference = process.env.TIMEZONE_DIFFRENECE_BETWEEN_LOCAL_TIME_AND_UTC
const programsQueries = require(DB_QUERY_BASE_PATH + '/programs')
const projectQueries = require(DB_QUERY_BASE_PATH + '/projects')
const entitiesService = require(GENERICS_FILES_PATH + '/services/entity-management')
const validateEntity = process.env.VALIDATE_ENTITIES
const userService = require(GENERICS_FILES_PATH + '/services/users')
const programSolutionUtility = require(GENERICS_FILES_PATH + '/helpers/programSolutionUtilities')
/**
 * ProgramsHelper
 * @class
 */
module.exports = class ProgramsHelper {
	/**
	 * Set scope in programs
	 * @method
	 * @name setScope
	 * @param {String} programId - program id.
	 * @param {Object} scopeData - scope data.
	 * @param {Object} userDetails - loggedin user info
	 * @returns {JSON} - scope in programs.
	 */

	static setScope(programId, scopeData, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				let programData = await programsQueries.programsDocument({ _id: programId }, ['_id'])

				if (!programData.length > 0) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
					})
				}
				// populate scopeData.organizations data
				if (
					scopeData.organizations &&
					scopeData.organizations.length > 0 &&
					userDetails.userInformation.roles.includes(CONSTANTS.common.ADMIN_ROLE)
				) {
					// call user-service to fetch related orgs
					let validOrgs = await userService.fetchTenantDetails(
						userDetails.tenantAndOrgInfo.tenantId,
						userDetails.userToken,
						true
					)
					if (!validOrgs.success) {
						throw {
							success: false,
							status: HTTP_STATUS_CODE['bad_request'].status,
							message: CONSTANTS.apiResponses.ORG_DETAILS_FETCH_UNSUCCESSFUL_MESSAGE,
						}
					}
					validOrgs = validOrgs.data

					// filter valid orgs
					scopeData.organizations = scopeData.organizations.filter(
						(id) => validOrgs.includes(id) || id.toLowerCase() == CONSTANTS.common.ALL
					)
				} else {
					scopeData['organizations'] = userDetails.tenantAndOrgInfo.orgId
				}

				if (Array.isArray(scopeData.organizations)) {
					scopeData.organizations = scopeData.organizations.map((orgId) =>
						orgId === CONSTANTS.common.ALL ? 'ALL' : orgId
					)
				}

				let scopeKeys = Object.keys(scopeData).map((key) => {
					return `scope.${key}`
				})

				let programIndexedKeys = await programsQueries.listIndexes()
				let indexes = programIndexedKeys.map((indexedKeys) => {
					return Object.keys(indexedKeys.key)[0]
				})
				let keysNotIndexed = _.differenceWith(scopeKeys, indexes)
				// if (Object.keys(scopeData).length > 0) {
				//   if (scopeData.entityType) {
				//     let bodyData = { name: scopeData.entityType };
				//     let entityTypeData = await entityTypesHelper.list(bodyData);
				//     if (entityTypeData.length > 0) {
				//       currentSolutionScope.entityType = entityTypeData[0].name;
				//     }
				//   }

				//   if (scopeData.entities && scopeData.entities.length > 0) {
				//     //call learners api for search
				//     let entityIds = [];
				//     let locationData = gen.utils.filterLocationIdandCode(scopeData.entities);

				//     if (locationData.codes.length > 0) {
				//       let filterData = {
				//         'registryDetails.code': locationData.codes,
				//         entityType: currentSolutionScope.entityType,
				//       };
				//       let entityDetails = await entitiesHelper.entitiesDocument(filterData);

				//       if (entityDetails.success) {
				//         entityDetails.data.forEach((entity) => {
				//           entityIds.push(entity.id);
				//         });
				//       }
				//     }
				//     entityIds = [...locationData.ids, ...locationData.codes];

				//     if (!entityIds.length > 0) {
				//       return resolve({
				//         status: HTTP_STATUS_CODE.bad_request.status,
				//         message: CONSTANTS.apiResponses.ENTITIES_NOT_FOUND,
				//       });
				//     }

				//     let entitiesData = [];

				//     // if( currentSolutionScope.entityType !== programData[0].scope.entityType ) {
				//     //   let result = [];
				//     //   let childEntities = await userService.getSubEntitiesBasedOnEntityType(currentSolutionScope.entities, currentSolutionScope.entityType, result);
				//     //   if( childEntities.length > 0 ) {
				//     //     entitiesData = entityIds.filter(element => childEntities.includes(element));
				//     //   }
				//     // } else {
				//     entitiesData = entityIds;
				//     // }

				//     if (!entitiesData.length > 0) {
				//       return resolve({
				//         status: HTTP_STATUS_CODE.bad_request.status,
				//         message: CONSTANTS.apiResponses.SCOPE_ENTITY_INVALID,
				//       });
				//     }

				//     currentSolutionScope.entities = entitiesData;
				//   }

				//   // currentSolutionScope.recommendedFor = scopeData.recommendedFor;

				//   // if (scopeData.roles) {
				//   //   if (Array.isArray(scopeData.roles) && scopeData.roles.length > 0) {
				//   //     let userRoles = await userRolesHelper.list(
				//   //       {
				//   //         code: { $in: scopeData.roles },
				//   //       },
				//   //       ['_id', 'code'],
				//   //     );

				//   //     if (!userRoles.length > 0) {
				//   //       return resolve({
				//   //         status: HTTP_STATUS_CODE.bad_request.status,
				//   //         message: CONSTANTS.apiResponses.INVALID_ROLE_CODE,
				//   //       });
				//   //     }

				//   //     currentSolutionScope['roles'] = userRoles;
				//   //   } else {
				//   //     if (scopeData.roles === CONSTANTS.common.ALL_ROLES) {
				//   //       currentSolutionScope['roles'] = [
				//   //         {
				//   //           code: CONSTANTS.common.ALL_ROLES,
				//   //         },
				//   //       ];
				//   //     }
				//   //   }
				//   // }
				// }

				if (keysNotIndexed.length > 0) {
					// Map over keysNotIndexed to extract the part after the first dot
					let keysCannotBeAdded = keysNotIndexed.map((keys) => {
						return keys.split('.')[1]
					})
					scopeData = _.omit(scopeData, keysCannotBeAdded)
				}

				let tenantDetails = await userService.fetchPublicTenantDetails(userDetails.tenantAndOrgInfo.tenantId)
				if (!tenantDetails?.success || !tenantDetails?.data?.meta) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.FAILED_TO_FETCH_TENANT_DETAILS,
					}
				}
				let tenantPublicDetailsMetaField = tenantDetails.data.meta

				let filteredScope = UTILS.getFilteredScope(scopeData, tenantPublicDetailsMetaField)

				const updateObject = {
					$set: {},
				}

				// Set the scope in updateObject to the updated scopeData
				updateObject['$set']['scope'] = filteredScope

				// Find and update the program with the specified programId
				let updateProgram = await programsQueries.findAndUpdate(
					{
						_id: programId,
					},
					updateObject,
					{ new: true }
				)

				// Check if the update was successful by verifying the presence of an _id
				if (!updateProgram._id) {
					// If the update was not successful, throw an error with the appropriate status
					throw {
						status: CONSTANTS.apiResponses.PROGRAM_SCOPE_NOT_ADDED,
					}
				}
				programData = updateProgram

				// Prepare the result object with the updated scope and programId
				let result = { _id: programId, scope: updateProgram.scope }

				// Resolve the promise with a success message and the result
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAM_UPDATED,
					result: result,
				})
			} catch (error) {
				return resolve({
					message: error.message,
					success: false,
				})
			}
		})
	}

	/**
	 * Create program
	 * @method
	 * @name create
	 * @param {Object} data - request body data
	 * @param {String} user - user id
	 * @param {Boolean} checkDate - this is true for when its called via API calls
	 * @param {Object} userDetails - user related info
	 * @returns {JSON} - create program.
	 */

	static create(data, userId = '', checkDate = false, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				let programData = {
					isDeleted: false,
					status: CONSTANTS.common.ACTIVE_STATUS,
					components: [],
					isAPrivateProgram: data.isAPrivateProgram ? data.isAPrivateProgram : false,
					owner: userId == '' ? data.userId : userId,
					createdBy: userId == '' ? data.userId : userId,
					updatedBy: userId == '' ? data.userId : userId,
				}

				// avoid adding manupulative data
				delete data.tenantId
				delete data.orgId

				if (checkDate) {
					if (data.hasOwnProperty(CONSTANTS.common.END_DATE)) {
						data.endDate = UTILS.getEndDate(data.endDate, timeZoneDifference)
					}
					if (data.hasOwnProperty(CONSTANTS.common.START_DATE)) {
						data.startDate = UTILS.getStartDate(data.startDate, timeZoneDifference)
					}
				}

				_.assign(programData, {
					...data,
				})

				// add tenantId and orgId
				programData['tenantId'] = userDetails.tenantAndOrgInfo.tenantId
				programData['orgId'] = userDetails.tenantAndOrgInfo.orgId[0]

				programData = _.omit(programData, ['scope', 'userId'])
				let program = await programsQueries.createProgram(programData)

				if (!program._id) {
					throw {
						message: CONSTANTS.apiResponses.PROGRAM_NOT_CREATED,
					}
				}

				if (data.scope) {
					let programScopeUpdated = await this.setScope(program._id, data.scope, userDetails)

					if (!programScopeUpdated.success) {
						throw {
							message: CONSTANTS.apiResponses.SCOPE_NOT_UPDATED_IN_PROGRAM,
						}
					}
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAMS_CREATED,
					data: program,
					result: program,
				})
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Update program
	 * @method
	 * @name update
	 * @param {String} programId - program id.
	 * @param {Array} data
	 * @param {String} userId
	 * @param {Boolean} checkDate this is true for when its called via API calls
	 * @returns {JSON} - update program.
	 */

	static update(programId, data, userDetails, checkDate = false) {
		return new Promise(async (resolve, reject) => {
			try {
				data.updatedBy = userDetails.userInformation.userId
				data.updatedAt = new Date()
				//convert components to objectedIds
				if (data.components && data.components.length > 0) {
					data.components = data.components.map((component) => UTILS.convertStringToObjectId(component))
				}

				if (checkDate) {
					if (data.hasOwnProperty(CONSTANTS.common.END_DATE)) {
						data.endDate = UTILS.getEndDate(data.endDate, timeZoneDifference)
					}
					if (data.hasOwnProperty(CONSTANTS.common.START_DATE)) {
						data.startDate = UTILS.getStartDate(data.startDate, timeZoneDifference)
					}
				}

				// delete tenantId & orgId attached in req.body to avoid adding manupulative data
				delete data.tenantId
				delete data.orgId

				let programMatchQuery = {}
				programMatchQuery['_id'] = programId
				programMatchQuery['tenantId'] = userDetails.tenantAndOrgInfo.tenantId
				let program = await programsQueries.findAndUpdate(
					programMatchQuery,
					{ $set: _.omit(data, ['scope']) },
					{ new: true }
				)

				if (!program || !program._id) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_NOT_UPDATED,
					}
				}

				if (data.scope) {
					let programScopeUpdated = await this.setScope(programId, data.scope, userDetails)

					if (!programScopeUpdated.success) {
						throw {
							message: CONSTANTS.apiResponses.SCOPE_NOT_UPDATED_IN_PROGRAM,
						}
					}
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAMS_UPDATED,
					data: {
						_id: programId,
					},
					result: {
						_id: programId,
					},
				})
			} catch (error) {
				return resolve({
					status: error.status || 400,
					success: false,
					message: error.message,
					data: {},
				})
			}
		})
	}

	/**
	 * Program details.
	 * @method
	 * @name details
	 * @param {String} programId - Program Id.
	 * @param {Array} projections - Projections.
	 * @param {Array} skipFields - Skip fields
	 * @param {Object} userDetails - loggedin user's info
	 * @returns {Object} - Details of the program.
	 */

	static details(programId, projections = 'all', skipFields = 'none', userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				let tenantId = userDetails.userInformation.tenantId
				let orgId = userDetails.userInformation.organizationId
				let programData = await programsQueries.programsDocument(
					{
						_id: programId,
						tenantId: tenantId,
					},
					projections,
					skipFields
				)

				if (!programData.length > 0) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
					})
				}

				return resolve({
					message: CONSTANTS.apiResponses.PROGRAMS_FETCHED,
					success: true,
					data: programData[0],
					result: programData[0],
				})
			} catch (error) {
				return resolve({
					success: false,
					status: error.status ? error.status : HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message,
				})
			}
		})
	}
	/**
	 * Program details.
	 * @method
	 * @name read
	 * @param {String} programId - Program Id.
	 * @param {Array} projections - Projections.
	 * @param {Array} skipFields - Skip fields
	 * @param {Object} tenantId -  tenantId of the user
	 * @returns {Object} - Details of the program.
	 */

	static read(programId, projections = 'all', skipFields = 'none', tenantId) {
		return new Promise(async (resolve, reject) => {
			try {
				let programData = await programsQueries.programsDocument(
					{
						_id: programId,
						tenantId: tenantId,
					},
					projections,
					skipFields
				)

				if (!programData.length > 0) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
					})
				}

				return resolve({
					message: CONSTANTS.apiResponses.PROGRAMS_FETCHED,
					success: true,
					data: programData[0],
					result: programData[0],
				})
			} catch (error) {
				return resolve({
					success: false,
					status: error.status ? error.status : HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message,
				})
			}
		})
	}
	/**
	 * Add roles in program.
	 * @method
	 * @name addRolesInScope
	 * @param {String} programId - Program Id.
	 * @param {Array} roles - roles data.
	 * @param {Object} userDetails - User Details
	 * @returns {JSON} - Added roles data.
	 */

	// Role-based logic has been removed from the current implementation, so this API is currently not in use.
	//  It may be revisited in the future based on requirements.
	static addRolesInScope(programId, roles, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				let tenantId = userDetails.tenantAndOrgInfo.tenantId
				let orgId = userDetails.tenantAndOrgInfo.orgId[0]
				let programData = await programsQueries.programsDocument(
					{
						_id: programId,
						scope: { $exists: true },
						isAPrivateProgram: false,
						tenantId: tenantId,
						orgId: orgId,
					},
					['_id', 'scope.roles']
				)

				if (!programData.length > 0) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
					})
				}

				let updateQuery = {}

				if (Array.isArray(roles) && roles.length > 0) {
					let currentRoles = programData[0].scope.roles

					let currentRolesSet = new Set(currentRoles)
					let rolesSet = new Set(roles)

					rolesSet.forEach((role) => {
						if (role != '' && role != 'all') currentRolesSet.add(role)
					})

					currentRoles = Array.from(currentRolesSet)
					updateQuery['$set'] = {
						'scope.roles': currentRoles,
					}
				} else {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.INVALID_ROLE_CODE,
					})
				}

				let updateProgram = await programsQueries.findAndUpdate(
					{
						_id: programId,
					},
					updateQuery,
					{ new: true }
				)

				if (!updateProgram || !updateProgram._id) {
					throw {
						message: CONSTANTS.apiResponses.PROGRAM_NOT_UPDATED,
					}
				}

				return resolve({
					message: CONSTANTS.apiResponses.ROLES_ADDED_IN_PROGRAM,
					success: true,
				})
			} catch (error) {
				return resolve({
					success: false,
					status: error.status ? error.status : HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message,
				})
			}
		})
	}

	/**
	 * Add entities in program.
	 * @method
	 * @name addEntitiesInScope
	 * @param {String} programId - Program Id.
	 * @param {Object} bodyData - body data.
	 * @param {Object} userDetails - User Details
	 * @returns {JSON} - Added scope data.
	 */

	static addEntitiesInScope(programId, bodyData, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				// Extract tenant and org IDs from user details
				let tenantId = userDetails.tenantAndOrgInfo.tenantId
				let orgId = userDetails.tenantAndOrgInfo.orgId[0]

				// Fetch the program document to ensure it exists and has a scope
				let programData = await programsQueries.programsDocument(
					{
						_id: programId,
						scope: { $exists: true },
						isAPrivateProgram: false,
						tenantId: tenantId,
						orgId: orgId,
					},
					['_id', 'scope']
				)

				if (!programData.length > 0) {
					throw {
						message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
						status: HTTP_STATUS_CODE.bad_request.status,
					}
				}

				let updateObjectData = await programSolutionUtility.getUpdateObjectTOAddScope(
					bodyData,
					tenantId,
					orgId,
					userDetails
				)
				if (!updateObjectData?.success) {
					throw {
						message: CONSTANTS.apiResponses.UPDATE_OBJECT_FAILED,
						status: HTTP_STATUS_CODE.bad_request.status,
					}
				}
				let updateProgram = await programsQueries.findAndUpdate(
					{
						_id: programId,
					},
					updateObjectData.updateObject,
					{ new: true }
				)

				if (!updateProgram || !updateProgram._id) {
					throw {
						message: CONSTANTS.apiResponses.PROGRAM_NOT_UPDATED,
						status: HTTP_STATUS_CODE.bad_request.status,
					}
				}

				return resolve({
					message: CONSTANTS.apiResponses.ENTITIES_ADDED_IN_PROGRAM,
					success: true,
				})
			} catch (error) {
				return resolve({
					success: false,
					status: error.status ? error.status : HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message,
				})
			}
		})
	}

	/**
	 * remove roles in program.
	 * @method
	 * @name removeRolesInScope
	 * @param {String} programId - Program Id.
	 * @param {Array} roles - roles data.
	 * @param {Object} userDetails - User Details
	 * @returns {JSON} - Added roles data.
	 */

	// Role-based logic has been removed from the current implementation, so this API is currently not in use.
	//  It may be revisited in the future based on requirements.
	static removeRolesInScope(programId, roles, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				let tenantId = userDetails.tenantAndOrgInfo.tenantId
				let orgId = userDetails.tenantAndOrgInfo.orgId[0]

				let programData = await programsQueries.programsDocument(
					{
						_id: programId,
						scope: { $exists: true },
						isAPrivateProgram: false,
						tenantId: tenantId,
						orgId: orgId,
					},
					['_id']
				)

				if (!programData.length > 0) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
					})
				}

				if (Array.isArray(roles) && roles.length > 0) {
					let updateProgram = await programsQueries.findAndUpdate(
						{
							_id: programId,
						},
						{
							$pull: { 'scope.roles': { $in: roles } },
						},
						{ new: true }
					)

					if (!updateProgram || !updateProgram._id) {
						throw {
							message: CONSTANTS.apiResponses.PROGRAM_NOT_UPDATED,
						}
					}
				} else {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.INVALID_ROLE_CODE,
					})
				}

				return resolve({
					message: CONSTANTS.apiResponses.ROLES_REMOVED_IN_PROGRAM,
					success: true,
				})
			} catch (error) {
				return resolve({
					success: false,
					status: error.status ? error.status : HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message,
				})
			}
		})
	}

	/**
	 * remove entities in program scope.
	 * @method
	 * @name removeEntitiesInScope
	 * @param {Object} bodyData - body data.
	 * @param {Object} userDetails - User Details
	 * @returns {JSON} - Removed scope data.
	 */

	static removeEntitiesInScope(programId, bodyData, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				// Extract tenant and org IDs from userDetails
				let tenantId = userDetails.tenantAndOrgInfo.tenantId
				let orgId = userDetails.tenantAndOrgInfo.orgId[0]
				// Fetch the program to verify it exists and has a scope field
				let programData = await programsQueries.programsDocument(
					{
						_id: programId,
						scope: { $exists: true },
						isAPrivateProgram: false,
						tenantId: tenantId,
						orgId: orgId,
					},
					['_id', 'scope']
				)

				if (!programData.length > 0) {
					throw {
						message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
						status: HTTP_STATUS_CODE.bad_request.status,
					}
				}

				// Initialize the update object to be used in MongoDB update query
				const currentScope = programData[0].scope || {}

				let updateObjectData = await programSolutionUtility.getUpdateObjectToRemoveScope(
					currentScope,
					bodyData,
					tenantId,
					userDetails
				)
				if (!updateObjectData?.success) {
					throw {
						message: CONSTANTS.apiResponses.UPDATE_OBJECT_FAILED,
						status: HTTP_STATUS_CODE.bad_request.status,
					}
				}
				// Prepare update object
				let updateObject = {
					$set: {
						scope: updateObjectData.updatedScope,
					},
				}
				let updateProgram = await programsQueries.findAndUpdate({ _id: programId }, updateObject, { new: true })
				if (!updateProgram || !updateProgram._id) {
					throw {
						message: CONSTANTS.apiResponses.PROGRAM_NOT_UPDATED,
						status: HTTP_STATUS_CODE.bad_request.status,
					}
				}

				return resolve({
					message: CONSTANTS.apiResponses.ENTITIES_REMOVED_IN_PROGRAM,
					success: true,
				})
			} catch (error) {
				return resolve({
					success: false,
					status: error.status ? error.status : HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message,
				})
			}
		})
	}

	/**
	 * Program join.
	 * @method
	 * @name join
	 * @param {String} programId - Program Id.
	 * @param {Object} data - body data (can include isResourse flag && userRoleInformation).
	 * @param {String} userId - Logged in user id.
	 * @param {String} userToken - User token.
	 * @param {String} [appName = ""] - App Name.
	 * @param {String} [appVersion = ""] - App Version.
	 * @param {Boolean} callConsetAPIOnBehalfOfUser - required to call consent api or not
	 * @returns {Object} - Details of the program join.
	 */

	static join(
		programId,
		data,
		userId,
		userToken,
		appName = '',
		appVersion = '',
		callConsetAPIOnBehalfOfUser = false
	) {
		return new Promise(async (resolve, reject) => {
			try {
				let pushProgramUsersDetailsToKafka = false
				//Using programId fetch program details. Also checking the program status in the query.
				let programData = await programsQueries.programsDocument(
					{
						_id: programId,
						status: CONSTANTS.common.ACTIVE_STATUS,
						isDeleted: false,
					},
					['name', 'externalId', 'requestForPIIConsent', 'rootOrganisations']
				)

				if (!programData.length > 0) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
					}
				}
				let programUsersData = {}
				let update = {}

				// check if user already joined for program or not
				// const programUsersDetails =
				//   await programUsersHelper.programUsersDocuments(
				//     {
				//       userId: userId,
				//       programId: programId,
				//     },
				//     ["_id", "consentShared"]
				//   );
				// // if user not joined for program. we have add more key values to programUsersData
				// if (!programUsersDetails.length > 0) {
				//   // Fetch user profile information by calling sunbird's user read api.
				//   // !Important check specific fields of userProfile.
				//   let userProfile = await userService.profile(userToken, userId);
				//   if (
				//     !userProfile.success ||
				//     !userProfile.data ||
				//     !userProfile.data.profileUserTypes ||
				//     !userProfile.data.profileUserTypes.length > 0 ||
				//     !userProfile.data.userLocations ||
				//     !userProfile.data.userLocations.length > 0
				//   ) {
				//     throw {
				//       status: HTTP_STATUS_CODE.bad_request.status,
				//       message: CONSTANTS.apiResponses.PROGRAM_JOIN_FAILED,
				//     };
				//   }
				//   programUsersData = {
				//     programId: programId,
				//     userRoleInformation: data.userRoleInformation,
				//     userId: userId,
				//     userProfile: userProfile.data,
				//     resourcesStarted: false,
				//   };
				//   if (appName != "") {
				//     programUsersData["appInformation.appName"] = appName;
				//   }
				//   if (appVersion != "") {
				//     programUsersData["appInformation.appVersion"] = appVersion;
				//   }

				//   //For internal calls add consent using sunbird api
				//   if (
				//     callConsetAPIOnBehalfOfUser &&
				//     programData[0].hasOwnProperty("requestForPIIConsent") &&
				//     programData[0].requestForPIIConsent === true
				//   ) {
				//     if (
				//       !programData[0].rootOrganisations ||
				//       !programData[0].rootOrganisations.length > 0
				//     ) {
				//       throw {
				//         message: CONSTANTS.apiResponses.PROGRAM_JOIN_FAILED,
				//         status: HTTP_STATUS_CODE.bad_request.status,
				//       };
				//     }
				//     let userConsentRequestBody = {
				//       request: {
				//         consent: {
				//           status: CONSTANTS.common.REVOKED,
				//           userId: userProfile.data.id,
				//           consumerId: programData[0].rootOrganisations[0],
				//           objectId: programId,
				//           objectType: CONSTANTS.common.PROGRAM,
				//         },
				//       },
				//     };
				//     let consentResponse = await userService.setUserConsent(
				//       userToken,
				//       userConsentRequestBody
				//     );

				//     if (!consentResponse.success) {
				//       throw {
				//         message: CONSTANTS.apiResponses.PROGRAM_JOIN_FAILED,
				//         status: HTTP_STATUS_CODE.bad_request.status,
				//       };
				//     }
				//   }
				// }

				// if requestForPIIConsent Is false and user not joined program till now then set pushProgramUsersDetailsToKafka = true;
				// if requestForPIIConsent == true and data.consentShared value is true which means user interacted with the consent popup set pushProgramUsersDetailsToKafka = true;
				// if programUsersDetails[0].consentShared === true which means the data is already pushed to Kafka once
				if (
					(programData[0].hasOwnProperty('requestForPIIConsent') &&
						programData[0].requestForPIIConsent === false &&
						!programUsersDetails.length > 0) ||
					(programData[0].hasOwnProperty('requestForPIIConsent') &&
						programData[0].requestForPIIConsent === true &&
						data.hasOwnProperty('consentShared') &&
						data.consentShared == true &&
						((programUsersDetails.length > 0 && programUsersDetails[0].consentShared === false) ||
							!programUsersDetails.length > 0))
				) {
					pushProgramUsersDetailsToKafka = true
				}

				//create or update query
				const query = {
					_id: programId,
					owner: userId,
				}
				//if a resource is started
				if (data.isResource) {
					programUsersData.resourcesStarted = true
				}
				//if user interacted with the consent-popup
				if (data.hasOwnProperty('consentShared')) {
					programUsersData.consentShared = data.consentShared
				}
				update['$set'] = programUsersData

				// add record to programUsers collection
				let joinProgram = await programsQueries.findAndUpdate(query, update, {
					new: true,
					upsert: true,
				})

				if (!joinProgram._id) {
					throw {
						message: CONSTANTS.apiResponses.PROGRAM_JOIN_FAILED,
						status: HTTP_STATUS_CODE.bad_request.status,
					}
				}

				let joinProgramDetails = joinProgram

				if (pushProgramUsersDetailsToKafka) {
					joinProgramDetails.programName = programData[0].name
					joinProgramDetails.programExternalId = programData[0].externalId
					joinProgramDetails.requestForPIIConsent = programData[0].requestForPIIConsent
					//  push programUsers details to kafka
					// await kafkaProducersHelper.pushProgramUsersToKafka(
					//   joinProgramDetails
					// );
				}

				return resolve({
					message: CONSTANTS.apiResponses.JOINED_PROGRAM,
					success: true,
					data: {
						_id: joinProgram._id,
					},
					result: {
						_id: joinProgram._id,
					},
				})
			} catch (error) {
				return resolve({
					success: false,
					status: error.status ? error.status : HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message,
				})
			}
		})
	}

	/**
	 * List program
	 * @method
	 * @name list
	 * @param {Number} pageNo - page no.
	 * @param {Number} pageSize - page size.
	 * @param {String} searchText - text to search.
	 * @param {Object} userDetails - user related info
	 * @param {Object} filter - filter.
	 * @param {Array} projection - projection.
	 * @returns {Object} - Programs list.
	 */

	static list(pageNo = '', pageSize = '', searchText, userDetails, currentOrgOnly = false, filter = {}, projection) {
		return new Promise(async (resolve, reject) => {
			try {
				let programDocument = []
				currentOrgOnly = UTILS.convertStringToBoolean(currentOrgOnly)
				let matchQuery = { status: CONSTANTS.common.ACTIVE_STATUS }
				if (Object.keys(filter).length > 0) {
					matchQuery = _.merge(matchQuery, filter)
				}

				if (searchText !== '') {
					let searchData = [
						{
							externalId: new RegExp(searchText, 'i'),
						},
						{
							name: new RegExp(searchText, 'i'),
						},
						{
							description: new RegExp(searchText, 'i'),
						},
					]

					if (matchQuery['$and']) {
						matchQuery['$and'].push({ $or: searchData })
					} else {
						matchQuery['$or'] = searchData
					}
				}

				// modify query to fetch documents
				matchQuery['tenantId'] = userDetails.userInformation.tenantId

				// handle currentOrgOnly filter
				if (currentOrgOnly) {
					let organizationId = userDetails.userInformation.organizationId
					matchQuery['orgId'] = { $in: [organizationId] }
				}

				let sortQuery = {
					$sort: { createdAt: -1 },
				}

				let projection1 = {}

				if (projection && projection.length > 0) {
					projection.forEach((projectedData) => {
						projection1[projectedData] = 1
					})
				} else {
					projection1 = {
						description: 1,
						externalId: 1,
						isAPrivateProgram: 1,
					}
				}

				let facetQuery = {}
				facetQuery['$facet'] = {}

				facetQuery['$facet']['totalCount'] = [{ $count: 'count' }]

				if (pageSize === '' && pageNo === '') {
					facetQuery['$facet']['data'] = [{ $skip: 0 }]
				} else {
					facetQuery['$facet']['data'] = [{ $skip: pageSize * (pageNo - 1) }, { $limit: pageSize }]
				}

				let projection2 = {}
				projection2['$project'] = {
					data: 1,
					count: {
						$arrayElemAt: ['$totalCount.count', 0],
					},
				}

				programDocument.push(
					{ $match: matchQuery },
					sortQuery,
					{ $project: projection1 },
					facetQuery,
					projection2
				)
				let programDocuments = await programsQueries.getAggregate(programDocument)
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAM_LIST,
					data: programDocuments[0],
					result: programDocuments[0],
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					data: [],
				})
			}
		})
	}

	/**
	 * Remove solutions from program.
	 * @method
	 * @name removeSolutions
	 * @param {Array} programId - Program id.
	 * @param {Array} solutionIds - Program id.
	 * @returns {Array} Update program.
	 */

	static removeSolutions(userToken = '', programId, solutionIds) {
		return new Promise(async (resolve, reject) => {
			try {
				let programsData = await programQueries.programsDocument({ _id: programId }, ['_id'])

				if (!programsData.length > 0) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
					}
				}

				let updateSolutionIds = solutionIds.map((solutionId) => ObjectId(solutionId))

				let updateSolution = await programQueries.findAndUpdate(
					{
						_id: programId,
					},
					{
						$pull: {
							components: { $in: updateSolutionIds },
						},
					}
				)

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAM_UPDATED_SUCCESSFULLY,
					data: updateSolution,
				})
			} catch (error) {
				return resolve({
					status: error.status ? error.status : HTTP_STATUS_CODE.internal_server_error.status,
					success: false,
					message: error.message,
					data: false,
				})
			}
		})
	}

	/**
	 * List of user created programs
	 * @method
	 * @name userPrivatePrograms
	 * @param {String} userId
	 * @param {String} language -languageCode
	 * @param {Boolean} getProjectsCount - get the projectsCount under that program.
	 * @param {Number} pageNo - pageNo
	 * @param {Number} pageSize - pageSize
	 * @param {Object} userDetails -loggedin user's info
	 * @returns {JSON} - List of programs that user created on app.
	 */

	static userPrivatePrograms(userId, language = '', getProjectsCount = false, pageNo, pageSize, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				let tenantId = userDetails.userInformation.tenantId
				let orgId = userDetails.userInformation.organizationId
				let programsData = await programsQueries.programsDocument(
					{
						createdBy: userId,
						isAPrivateProgram: true,
						isDeleted: false,
						tenantId: tenantId,
					},
					['name', 'externalId', 'description', '_id', 'isAPrivateProgram', 'translations'],
					'none',
					{ createdAt: -1 } // sort by 'createdAt' in descending order
				)
				//getting totalCount of users programs
				let totaluserProgramCount = programsData.length
				if (!(programsData.length > 0)) {
					return resolve({
						message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
						result: [],
					})
				}
				//pagination
				let startIndex = pageSize * (pageNo - 1)
				let endIndex = startIndex + pageSize
				programsData = programsData.slice(startIndex, endIndex)
				if (getProjectsCount) {
					//Filtering out all the program IDs
					let userProgramIds = programsData.flatMap((program) => program._id || [])
					let projectDocuments = await projectQueries.getAggregate([
						{
							$match: {
								programId: { $in: userProgramIds },
								tenantId: tenantId,
							},
						},
						{
							$group: {
								_id: '$programId', // Group by programId
								ongoingProjects: {
									$sum: {
										$cond: [
											{ $ne: ['$reflection.status', CONSTANTS.common.COMPLETED_STATUS] },
											1,
											0,
										],
									},
								},
								completedProjects: {
									$sum: {
										$cond: [
											{ $eq: ['$reflection.status', CONSTANTS.common.COMPLETED_STATUS] },
											1,
											0,
										],
									},
								},
							},
						},
					])
					//Adding projects count to the programData
					const projectCountsMap = projectDocuments.reduce((acc, project) => {
						acc[project._id.toString()] = {
							ongoingProjects: project.ongoingProjects || 0,
							completedProjects: project.completedProjects || 0,
						}
						return acc
					}, {})

					// Merge counts using the map
					programsData.forEach((program) => {
						const counts = projectCountsMap[program._id.toString()] || {
							ongoingProjects: 0,
							completedProjects: 0,
						}
						program.ongoingProjects = counts.ongoingProjects
						program.completedProjects = counts.completedProjects
					})
				}
				//handle multiligual responses
				if (language != '') {
					programsData = programsData.map((program) => ({
						name: program.translations?.[language]?.name || program.name,
						description: program.translations?.[language]?.description || program.description,
						externalId: program.externalId,
						_id: program._id,
						isAPrivateProgram: program.isAPrivateProgram,
						ongoingProjects: program.ongoingProjects ? program.ongoingProjects : 0,
						completedProjects: program.completedProjects ? program.completedProjects : 0,
					}))
				}
				return resolve({
					data: programsData,
					count: totaluserProgramCount,
				})
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Auto targeted query field.
	 * @method
	 * @name queryBasedOnRoleAndLocation
	 * @param {String} data - Requested body data.
	 * @returns {JSON} - Auto targeted programs query.
	 */

	static queryBasedOnRoleAndLocation(data, type = '') {
		return new Promise(async (resolve, reject) => {
			try {
				let registryIds = []
				let entityTypes = []
				let filterQuery = {
					isDeleted: false,
				}
				Object.keys(
					_.omit(data, ['role', 'filter', 'factors', 'type', 'tenantId', 'orgId', 'organizations'])
				).forEach((key) => {
					data[key] = data[key].split(',')
				})

				// If validate entity set to ON . strict scoping should be applied
				if (validateEntity !== CONSTANTS.common.OFF) {
					Object.keys(
						_.omit(data, ['filter', 'role', 'factors', 'type', 'tenantId', 'orgId', 'organizations'])
					).forEach((requestedDataKey) => {
						registryIds.push(...data[requestedDataKey])
						entityTypes.push(requestedDataKey)
					})
					if (!registryIds.length > 0) {
						throw {
							message: CONSTANTS.apiResponses.NO_LOCATION_ID_FOUND_IN_DATA,
						}
					}
					let userRoleInfo = _.omit(data, ['filter', 'factors', 'role', 'type', 'tenantId', 'orgId'])

					let tenantDetails = await userService.fetchPublicTenantDetails(data.tenantId)
					if (!tenantDetails.data || !tenantDetails.data.meta || tenantDetails.success !== true) {
						return resolve({
							success: false,
							message: CONSTANTS.apiResponses.FAILED_TO_FETCH_TENANT_DETAILS,
						})
					}

					let tenantPublicDetailsMetaField = tenantDetails.data.meta
					let builtQuery = UTILS.targetingQuery(
						userRoleInfo,
						tenantPublicDetailsMetaField,
						CONSTANTS.common.MANDATORY_SCOPE_FIELD,
						CONSTANTS.common.OPTIONAL_SCOPE_FIELD
					)
					filterQuery = {
						...filterQuery,
						...builtQuery,
					}
				} else {
					// Obtain userInfo
					let userRoleInfo = _.omit(data, ['filter', 'factors', 'role', 'type', 'tenantId', 'orgId'])
					let userRoleKeys = Object.keys(userRoleInfo)
					let queryFilter = []

					// factors = [ 'professional_role', 'professional_subroles' ]
					// if factors are passed or query has to be build based on the keys passed
					if (data.hasOwnProperty('factors') && data.factors.length > 0) {
						let factors = data.factors
						// Build query based on each key
						factors.forEach((factor) => {
							let scope = 'scope.' + factor
							let values = userRoleInfo[factor]
							if (factor === 'role') {
								queryFilter.push({
									['scope.roles']: { $in: [CONSTANTS.common.ALL_ROLES, ...data.role.split(',')] },
								})
							} else if (!Array.isArray(values)) {
								queryFilter.push({ [scope]: { $in: values.split(',') } })
							} else {
								queryFilter.push({ [scope]: { $in: [...values] } })
							}
						})
						// append query filter
						filterQuery['$or'] = queryFilter
					} else {
						userRoleKeys.forEach((key) => {
							let scope = 'scope.' + key
							let values = userRoleInfo[key]
							if (!Array.isArray(values)) {
								queryFilter.push({ [scope]: { $in: values.split(',') } })
							} else {
								queryFilter.push({ [scope]: { $in: [...values] } })
							}
						})

						if (data.role) {
							queryFilter.push({
								['scope.roles']: { $in: [CONSTANTS.common.ALL_ROLES, ...data.role.split(',')] },
							})
						}

						// append query filter
						filterQuery['$and'] = queryFilter
					}
				}

				filterQuery.status = CONSTANTS.common.ACTIVE_STATUS
				if (type != '') {
					filterQuery.type = type
				}
				delete filterQuery['scope.entityType']
				filterQuery.tenantId = data.tenantId
				return resolve({
					success: true,
					data: filterQuery,
				})
			} catch (error) {
				return resolve({
					success: false,
					status: error.status ? error.status : HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message,
					data: {},
				})
			}
		})
	}

	/**
	 * List of programs based on role and location.
	 * @method
	 * @name forUserRoleAndLocation
	 * @param {String} bodyData - Requested body data.
	 * @param {String} pageSize - Page size.
	 * @param {String} pageNo - Page no.
	 * @param {String} searchText - search text.
	 * @returns {JSON} - List of programs based on role and location.
	 */

	static forUserRoleAndLocation(
		bodyData,
		pageSize,
		pageNo,
		searchText = '',
		programId = '',
		projection,
		userDetails
	) {
		return new Promise(async (resolve, reject) => {
			try {
				let queryData = await this.queryBasedOnRoleAndLocation(bodyData)
				if (!queryData.success) {
					return resolve(queryData)
				}
				if (programId !== '') {
					queryData.data._id = UTILS.convertStringToObjectId(programId)
				}
				queryData.data.startDate = { $lte: new Date() }
				queryData.data.endDate = { $gte: new Date() }
				let targetedPrograms = await this.list(
					pageNo,
					pageSize,
					searchText,
					userDetails,
					false,
					queryData.data,
					projection
				)
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.TARGETED_PROGRAMS_FETCHED,
					data: targetedPrograms.data.data,
					count: targetedPrograms.data.count,
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					data: {},
				})
			}
		})
	}

	/**
	 * Helper function to remove a solution ID from all program documents that reference it.
	 *
	 * @param {String} solutionId - The string form of the solution ObjectId to be removed from programs.
	 * @returns {Promise<Object>} - Contains the number of modified documents and a success message.
	 */
	static removeSolutions(solutionId, tenantId) {
		return new Promise(async (resolve, reject) => {
			try {
				// Convert the string ID to MongoDB ObjectId
				let solutionToObjectId = UTILS.convertStringToObjectId(solutionId)

				// Call DB query to pull (remove) the solutionId from all program documents' components
				let programData = await programsQueries.pullSolutionsFromComponents(solutionToObjectId, tenantId)
				let result
				if (programData) {
					// Construct a result object with number of modified records
					result = {
						programsModifiedCount: programData.nModified,
						solutionId: solutionId,
						success: true,
					}
				}
				return resolve({
					result: result,
					message: CONSTANTS.apiResponses.SOLUTION_RESOURCE_DELETED,
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					data: {},
				})
			}
		})
	}
}

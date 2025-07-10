/*
Files to remove circular dependencies
**/
const solutionsQueries = require(DB_QUERY_BASE_PATH + '/solutions')
const programQueries = require(DB_QUERY_BASE_PATH + '/programs')
const userService = require(GENERICS_FILES_PATH + '/services/users')
const timeZoneDifference = process.env.TIMEZONE_DIFFRENECE_BETWEEN_LOCAL_TIME_AND_UTC

/**
 * Create solution.
 * @method
 * @name createSolution
 * @param {Object} solutionData - solution creation data.
 * @param {Boolean} checkDate
 * @param {Object} userDetails - user related info
 * @param {String} tenantId - tenant id
 * @param {String} orgId - org id
 * @returns {JSON} solution creation data.
 */

function createSolution(solutionData, checkDate = false, userDetails) {
	return new Promise(async (resolve, reject) => {
		try {
			solutionData.type = solutionData.subType = CONSTANTS.common.IMPROVEMENT_PROJECT
			solutionData.resourceType = [CONSTANTS.common.RESOURCE_TYPE]
			solutionData.language = [CONSTANTS.common.ENGLISH_LANGUAGE]
			solutionData.keywords = [CONSTANTS.common.KEYWORDS]
			solutionData.isDeleted = false
			solutionData.isReusable = false
			delete solutionData.tenantId
			delete solutionData.orgId

			let programMatchQuery = {}
			programMatchQuery['tenantId'] = userDetails.tenantAndOrgInfo.tenantId

			programMatchQuery['externalId'] = solutionData.programExternalId
			let programData = await programQueries.programsDocument(programMatchQuery, [
				'name',
				'description',
				'scope',
				'endDate',
				'startDate',
			])
			if (!programData.length > 0) {
				throw {
					message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
				}
			}

			solutionData.programId = programData[0]._id
			solutionData.programName = programData[0].name
			solutionData.programDescription = programData[0].description

			if (solutionData.type == CONSTANTS.common.COURSE && !solutionData.link) {
				return resolve({
					status: HTTP_STATUS_CODE.bad_request.status,
					message: CONSTANTS.apiResponses.COURSE_LINK_REQUIRED,
				})
			}

			// if (solutionData.entities && solutionData.entities.length > 0) {
			// 	let entityIds = []
			// 	let locationData = UTILS.filterLocationIdandCode(solutionData.entities)

			// 	if (locationData.ids.length > 0) {
			// 		let bodyData = {
			// 			id: locationData.ids,
			// 		}
			// 		let entityData = await entitiesService.entityDocuments(bodyData, 'all')
			// 		if (entityData.success) {
			// 			entityData.data.forEach((entity) => {
			// 				entityIds.push(entity._id)
			// 			})
			// 		}
			// 	}

			// 	  if (locationData.codes.length > 0) {
			// 	    let filterData = {
			// 	      externalId: locationData.codes,
			// 	    };
			// 	    let schoolDetails = await userService.orgSchoolSearch(filterData);

			// 	    if (schoolDetails.success) {
			// 	      let schoolData = schoolDetails.data;
			// 	      schoolData.forEach((entity) => {
			// 	        entityIds.push(entity.externalId);
			// 	      });
			// 	    }
			// 	  }

			// 	  if (!entityIds.length > 0) {
			// 	    throw {
			// 	      message: CONSTANTS.apiResponses.ENTITIES_NOT_FOUND,
			// 	    };
			// 	  }

			// 	solutionData.entities = entityIds
			// }

			if (
				solutionData.minNoOfSubmissionsRequired &&
				solutionData.minNoOfSubmissionsRequired > CONSTANTS.common.DEFAULT_SUBMISSION_REQUIRED
			) {
				if (!solutionData.allowMultipleAssessemts) {
					solutionData.minNoOfSubmissionsRequired = CONSTANTS.common.DEFAULT_SUBMISSION_REQUIRED
				}
			}

			solutionData.status = CONSTANTS.common.ACTIVE_STATUS

			if (checkDate) {
				if (solutionData.hasOwnProperty('endDate')) {
					solutionData.endDate = UTILS.getEndDate(solutionData.endDate, timeZoneDifference)
					if (solutionData.endDate > programData[0].endDate) {
						solutionData.endDate = programData[0].endDate
					}
				}
				if (solutionData.hasOwnProperty('startDate')) {
					solutionData.startDate = UTILS.getStartDate(solutionData.startDate, timeZoneDifference)
					if (solutionData.startDate < programData[0].startDate) {
						solutionData.startDate = programData[0].startDate
					}
				}
			}
			solutionData['submissionLevel'] = process.env.SUBMISSION_LEVEL

			// add tenantId and orgId
			solutionData['tenantId'] = userDetails.tenantAndOrgInfo.tenantId
			solutionData['orgId'] = userDetails.tenantAndOrgInfo.orgId[0]

			let solutionCreation = await solutionsQueries.createSolution(_.omit(solutionData, ['scope']))

			if (!solutionCreation._id) {
				throw {
					message: CONSTANTS.apiResponses.SOLUTION_NOT_CREATED,
				}
			}

			delete programMatchQuery.externalId
			programMatchQuery['_id'] = solutionData.programId

			let updateProgram = await programQueries.findAndUpdate(programMatchQuery, {
				$addToSet: { components: solutionCreation._id },
			})

			if (!solutionData.excludeScope && programData[0].scope) {
				await setScope(solutionCreation._id, solutionData.scope ? solutionData.scope : {}, userDetails)
			}

			return resolve({
				message: CONSTANTS.apiResponses.SOLUTION_CREATED,
				data: {
					_id: solutionCreation._id,
				},
				result: {
					_id: solutionCreation._id,
				},
			})
		} catch (error) {
			return reject(error)
		}
	})
}

/**
 * Update solution.
 * @method
 * @name update
 * @param {String} solutionId - solution id.
 * @param {Object} solutionData - solution creation data.
 * @param {Object} userDetails - user related info
 * @returns {JSON} solution creation data.
 */

function update(solutionId, solutionData, userDetails, checkDate = false) {
	return new Promise(async (resolve, reject) => {
		try {
			let queryObject = {
				_id: solutionId,
			}
			// modify the query object to fetch relevant data
			queryObject['tenantId'] = userDetails.tenantAndOrgInfo.tenantId

			let solutionDocument = await solutionsQueries.solutionsDocument(queryObject, ['_id', 'programId'])

			if (!solutionDocument.length > 0) {
				return resolve({
					status: HTTP_STATUS_CODE.bad_request.status,
					message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
				})
			}

			if (
				checkDate &&
				(solutionData.hasOwnProperty(CONSTANTS.common.END_DATE) ||
					solutionData.hasOwnProperty(CONSTANTS.common.END_DATE))
			) {
				let programData = await programQueries.programsDocument(
					{
						_id: solutionDocument[0].programId,
						tenantId: userDetails.tenantAndOrgInfo.tenantId,
					},
					['_id', 'endDate', 'startDate']
				)

				if (!programData.length > 0) {
					throw {
						message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
					}
				}
				if (solutionData.hasOwnProperty(CONSTANTS.common.END_DATE)) {
					solutionData.endDate = UTILS.getEndDate(solutionData.endDate, timeZoneDifference)
					if (solutionData.endDate > programData[0].endDate) {
						solutionData.endDate = programData[0].endDate
					}
				}
				if (solutionData.hasOwnProperty(CONSTANTS.common.START_DATE)) {
					solutionData.startDate = UTILS.getStartDate(solutionData.startDate, timeZoneDifference)
					if (solutionData.startDate < programData[0].startDate) {
						solutionData.startDate = programData[0].startDate
					}
				}
			}

			let updateObject = {
				$set: {},
			}

			if (
				solutionData.minNoOfSubmissionsRequired &&
				solutionData.minNoOfSubmissionsRequired > CONSTANTS.common.DEFAULT_SUBMISSION_REQUIRED
			) {
				if (!solutionData.allowMultipleAssessemts) {
					solutionData.minNoOfSubmissionsRequired = CONSTANTS.common.DEFAULT_SUBMISSION_REQUIRED
				}
			}

			// prevent adding manupulative data
			delete solutionData.tenantId
			delete solutionData.orgId

			let solutionUpdateData = solutionData

			Object.keys(_.omit(solutionUpdateData, ['scope'])).forEach((updationData) => {
				updateObject['$set'][updationData] = solutionUpdateData[updationData]
			})
			updateObject['$set']['updatedBy'] = userDetails.userInformation.userId
			let solutionUpdatedData = await solutionsQueries.updateSolutionDocument(
				{
					_id: solutionDocument[0]._id,
					tenantId: userDetails.tenantAndOrgInfo.tenantId,
				},
				updateObject,
				{ new: true }
			)

			if (!solutionUpdatedData._id) {
				throw {
					message: CONSTANTS.apiResponses.SOLUTION_NOT_CREATED,
				}
			}
			if (solutionData.scope && Object.keys(solutionData.scope).length > 0) {
				let solutionScope = await setScope(solutionUpdatedData._id, solutionData.scope, userDetails)
				if (!solutionScope.success) {
					throw {
						message: CONSTANTS.apiResponses.COULD_NOT_UPDATE_SCOPE,
					}
				}
			}
			return resolve({
				success: true,
				message: CONSTANTS.apiResponses.SOLUTION_UPDATED,
				data: {
					_id: solutionUpdatedData._id,
				},
				result: {
					_id: solutionUpdatedData._id,
				},
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
 * Set scope in solution
 * @method
 * @name setScope
 * @param {String} solutionId - solution id.
 * @param {Object} scopeData - scope data.
 * @param {Object} userDetails - loggedin user info
 * @returns {JSON} - scope in solution.
 */

function setScope(solutionId, scopeData, userDetails) {
	return new Promise(async (resolve, reject) => {
		try {
			let solutionData = await solutionsQueries.solutionsDocument({ _id: solutionId }, ['_id'])

			if (!solutionData.length > 0) {
				return resolve({
					status: HTTP_STATUS_CODE.bad_request.status,
					message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
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

			// let currentSolutionScope = {};
			let scopeKeys = Object.keys(scopeData).map((key) => {
				return `scope.${key}`
			})

			let solutionIndexedKeys = await solutionsQueries.listIndexes()
			let indexes = solutionIndexedKeys.map((indexedKeys) => {
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
				// Map the keysNotIndexed array to get the second part after splitting by '.'
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

			// Assign the scopeData to the scope field in updateObject
			updateObject['$set']['scope'] = filteredScope

			// Update the solution document with the updateObject
			let updateSolution = await solutionsQueries.updateSolutionDocument(
				{
					_id: solutionId,
				},
				updateObject,
				{ new: true }
			)
			// If the update was unsuccessful, throw an error
			if (!updateSolution._id) {
				throw {
					status: CONSTANTS.apiResponses.SOLUTION_SCOPE_NOT_ADDED,
				}
			}
			solutionData = updateSolution

			// Create the result object with the updated solution ID and scope
			let result = { _id: solutionId, scope: updateSolution.scope }

			// Resolve the promise with a success message and the result object
			return resolve({
				success: true,
				message: CONSTANTS.apiResponses.SOLUTION_UPDATED,
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

module.exports = {
	createSolution: createSolution,
	update: update,
	setScope: setScope,
}

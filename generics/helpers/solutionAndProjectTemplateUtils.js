/**
 * name : solutionAndProjectTemplateUtils.js
 * author : Praveen Dass
 * Date : 10-July-2025
 * Description:
 * This file contains solution helper functions that were extracted
 * from solution module to resolve circular dependency issues.
 *
 * Only use this file for shared logic that leads to
 * circular dependencies when placed in the solution module.
 */

// Dependencies
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
			solutionData.type = solutionData.subType =
				solutionData?.type === CONSTANTS.common.COURSE
					? CONSTANTS.common.COURSE
					: CONSTANTS.common.IMPROVEMENT_PROJECT
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
				'components',
			])
			if (!programData.length > 0) {
				throw {
					message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
				}
			}

			let programsComponent = programData[0].components || []
			solutionData.programId = programData[0]._id
			solutionData.programName = programData[0].name
			solutionData.programDescription = programData[0].description

			if (solutionData.type == CONSTANTS.common.COURSE && !solutionData.linkUrl) {
				return resolve({
					status: HTTP_STATUS_CODE.bad_request.status,
					message: CONSTANTS.apiResponses.COURSE_LINK_REQUIRED,
				})
			}

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
				$addToSet: { components: { _id: solutionCreation._id, order: programsComponent.length + 1 } },
			})

			if (!solutionData?.excludeScope && programData[0].scope) {
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
 * @param {Boolean} checkDate -  Optional flag to validate startDate/endDate
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
			// If checkDate flag is true, validate dates against  program startDate and endDate
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
			//Perform the  update operation
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
			//If scope data is provided, update it separately
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

/**
 * Fetch related org details from user-service
 * @method
 * @name organizationDetails
 * @param {Object} userDetails - loggedin user info
 * @returns {Array} - Array of related org details
 */
function organizationDetails(userDetails) {
	return new Promise(async (resolve, reject) => {
		try {
			// fetching related_org_details from user-service
			let orgRead = await userService.getOrgDetails(userDetails.userInformation.organizations[0].id)
			if (!orgRead || !orgRead.success || !orgRead.data || Object.keys(orgRead.data).length == 0) {
				throw {
					success: false,
					status: HTTP_STATUS_CODE.bad_request.status,
					message: CONSTANTS.apiResponses.ORG_DETAILS_FETCH_UNSUCCESSFUL,
				}
			}
			orgRead = orgRead.data
			let relatedOrgCodes

			// aggregate organization codes
			if (orgRead.related_org_details && Array.isArray(orgRead.related_org_details)) {
				relatedOrgCodes = orgRead.related_org_details.map((org) => {
					return org.code
				})
			}
			relatedOrgCodes = relatedOrgCodes && Array.isArray(relatedOrgCodes) ? relatedOrgCodes : []
			return resolve({
				success: true,
				result: relatedOrgCodes,
			})
		} catch (error) {
			return reject({
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
	organizationDetails,
}

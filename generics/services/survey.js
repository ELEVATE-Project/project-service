/**
 * name : survey.js
 * author : Aman Jung Karki
 * Date : 21-Nov-2020
 * Description : Assessment service related information.
 */

//dependencies
const request = require('request')

const SURVEY_SERVICE_URL = process.env.SURVEY_SERVICE_URL

/**
 * Create Child solutions for survey
 * @function
 * @name importSurveyTemplateToSolution
 * @param {String} token - logged in user token.
 * @param {String} solutionId - parent solution id.
 * @param {String} programId -programId
 * @param {Object} data - Body data
 * @returns {JSON} - Create child solution from parent  solution.
 */
const importSurveyTemplateToSolution = function (token, solutionId, programId, data = {}, userDetails) {
	return new Promise(async (resolve, reject) => {
		try {
			let surveyCreateUrl =
				SURVEY_SERVICE_URL +
				CONSTANTS.endpoints.IMPORT_SURVEY_TEMPLATE +
				'/' +
				solutionId +
				'?appName=elevate' +
				'&programId=' +
				programId
			let options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-auth-token': token,
				},
				json: { data: data },
			}
			if (
				userDetails?.userInformation?.roles &&
				!userDetails.userInformation?.roles.includes(CONSTANTS.common.ORG_ADMIN)
			) {
				_.assign(options.headers, {
					'admin-auth-token': process.env.SURVEY_ADMIN_AUTH_TOKEN,
					tenantId: userDetails.tenantAndOrgInfo.tenantId,
					orgId: userDetails.tenantAndOrgInfo.orgId.join(','),
				})
			}
			request.post(surveyCreateUrl, options, assessmentCallback)

			function assessmentCallback(err, data) {
				let result = {
					success: true,
				}
				if (err) {
					result.success = false
				} else {
					let response = data.body
					result = response
					if (result.status === HTTP_STATUS_CODE['ok'].status) {
						result['data'] = response.result
						result.success = true
					} else {
						result.success = false
					}
				}
				return resolve(result)
			}
		} catch (error) {
			return reject(error)
		}
	})
}

/**
 * Create Child solutions for survey
 * @function
 * @name importObservationTemplateToSolution
 * @param {String} token - logged in user token.
 * @param {String} solutionId - parent solution id.
 * @param {Object} bodyData - Body data
 * @returns {JSON} - Create child solution from parent  solution.
 */
const importObservationTemplateToSolution = function (token, solutionId, bodyData, userDetails) {
	return new Promise(async (resolve, reject) => {
		try {
			let observationCreateUrl =
				SURVEY_SERVICE_URL + CONSTANTS.endpoints.CREATE_CHILD_OBSERVATION_SOLUTION + '?solutionId=' + solutionId

			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-auth-token': token,
				},
				json: bodyData,
			}

			if (
				userDetails?.userInformation?.roles &&
				!userDetails.userInformation?.roles.includes(CONSTANTS.common.ORG_ADMIN)
			) {
				_.assign(options.headers, {
					'admin-auth-token': process.env.SURVEY_ADMIN_AUTH_TOKEN,
					tenantId: userDetails.tenantAndOrgInfo.tenantId,
					orgId: userDetails.tenantAndOrgInfo.orgId.join(','),
				})
			}

			request.post(observationCreateUrl, options, assessmentCallback)

			function assessmentCallback(err, data) {
				let result = {
					success: true,
				}
				if (err) {
					result.success = false
				} else {
					let response = data.body
					result = response
					if (result.status === HTTP_STATUS_CODE['ok'].status) {
						result['data'] = response.result
					} else {
						result.success = false
					}
				}
				return resolve(result)
			}
		} catch (error) {
			return reject(error)
		}
	})
}

/**
 * Create get or create surveyDetails
 * @function
 * @name surveyDetails
 * @param {String} token - logged in user token.
 * @param {String} solutionId - child solution id.
 * @param {Object} bodyData - Body data
 * @returns {JSON} - survey create or details
 */
const surveyDetails = function (token, solutionId, bodyData, programId) {
	return new Promise(async (resolve, reject) => {
		try {
			let observationCreateUrl =
				SURVEY_SERVICE_URL + CONSTANTS.endpoints.SURVEY_DETAILS + '?solutionId=' + solutionId
			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-auth-token': token,
				},
				json: bodyData,
			}

			request.post(observationCreateUrl, options, assessmentCallback)

			function assessmentCallback(err, data) {
				let result = {
					success: true,
				}
				if (err) {
					result.success = false
				} else {
					let response = data.body
					if (response.status === HTTP_STATUS_CODE['ok'].status) {
						result['data'] = response.result
					} else {
						result.success = false
					}
				}
				return resolve(result)
			}
		} catch (error) {
			return reject(error)
		}
	})
}

/**
 * Details observation
 * @function
 * @name observationDetails
 * @param {String} token - logged in user token.
 * @param {String} observationId - observation id.
 * @returns {JSON} - Add entity to observation.
 */

const observationDetails = function (token, observationId) {
	return new Promise(async (resolve, reject) => {
		try {
			let url = SURVEY_SERVICE_URL + CONSTANTS.endpoints.OBSERVATION_DETAILS + '/' + observationId

			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-auth-token': token,
				},
			}

			request.get(url, options, assessmentCallback)

			function assessmentCallback(err, data) {
				let result = {
					success: true,
				}

				if (err) {
					result.success = false
				} else {
					let response = JSON.parse(data.body)
					if (response.status === HTTP_STATUS_CODE['ok'].status) {
						result['data'] = response.result
					} else {
						result.success = false
					}
				}

				return resolve(result)
			}
		} catch (error) {
			return reject(error)
		}
	})
}

/**
 * List of solutions
 * @function
 * @name listSolutions
 * @param {Array} solutionIds - solution external ids.
 * @param {String} token -userToken
 * @returns {JSON} - List of solutions
 */

const listSolutions = function (solutionIds, token, userDetails) {
	return new Promise(async (resolve, reject) => {
		try {
			const url = SURVEY_SERVICE_URL + CONSTANTS.endpoints.LIST_SOLUTIONS
			let options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-auth-token': token,
				},
				json: solutionIds,
			}
			// pass admin and tenant info in header  if user superAdmin
			if (
				userDetails?.userInformation?.roles &&
				!userDetails?.userInformation?.roles.includes(CONSTANTS.common.ORG_ADMIN)
			) {
				_.assign(options.headers, {
					'admin-auth-token': process.env.SURVEY_ADMIN_AUTH_TOKEN,
					tenantId: userDetails.tenantAndOrgInfo.tenantId,
					orgId: userDetails.tenantAndOrgInfo.orgId.join(','),
				})
			}
			request.post(url, options, assessmentCallback)
			function assessmentCallback(err, data) {
				let result = {
					success: true,
				}

				if (err) {
					result.success = false
				} else {
					let response = data.body
					if (response.status === HTTP_STATUS_CODE['ok'].status) {
						result['data'] = response.result.data
					} else {
						result.success = false
					}
				}

				return resolve(result)
			}
		} catch (error) {
			return reject(error)
		}
	})
}

/**
 * Update solution
 * @function
 * @name updateSolution
 * @param {String} token - Logged in user token.
 * @param {Object} updateData - Data to update.
 * @param {Object} solutionExternalId -  ExternalId of solution.
 * @returns {JSON} - Update solutions.
 */

const updateSolution = function (token, updateData, solutionExternalId, userDetails) {
	return new Promise(async (resolve, reject) => {
		try {
			const url = SURVEY_SERVICE_URL + CONSTANTS.endpoints.UPDATE_SOLUTIONS + '/' + solutionExternalId

			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-auth-token': token,
				},
				json: updateData,
			}

			// pass admin and tenant info in header  if user superAdmin
			if (
				userDetails?.userInformation?.roles &&
				!userDetails?.userInformation?.roles.includes(CONSTANTS.common.ORG_ADMIN)
			) {
				_.assign(options.headers, {
					'admin-auth-token': process.env.SURVEY_ADMIN_AUTH_TOKEN,
					tenantId: userDetails.tenantAndOrgInfo.tenantId,
					orgId: userDetails.tenantAndOrgInfo.orgId.join(','),
				})
			}
			request.post(url, options, assessmentCallback)

			function assessmentCallback(err, data) {
				let result = {
					success: true,
				}

				if (err) {
					result.success = false
				} else {
					let response = data.body
					if (response.status === HTTP_STATUS_CODE['ok'].status) {
						result['data'] = response.result
					} else {
						result.success = false
					}

					result['data'] = data.body
				}

				return resolve(result)
			}
		} catch (error) {
			return reject(error)
		}
	})
}

/**
 * Create observation
 * @function
 * @name createObservation
 * @param {String} token - logged in user token.
 * @param {String} solutionId - solution id.
 * @param {Object} data - body data
 * @param {Object} userRoleAndProfileInformation -userRoleInformation
 * @param {String} programId-programId
 * @returns {JSON} - Create observation.
 */

const createObservation = function (token, solutionId, data, userRoleAndProfileInformation = {}, programId) {
	return new Promise(async (resolve, reject) => {
		try {
			let createdObservationUrl =
				SURVEY_SERVICE_URL +
				CONSTANTS.endpoints.CREATE_OBSERVATIONS +
				'?solutionId=' +
				solutionId +
				'&programId=' +
				programId
			let options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-auth-token': token,
				},
				json: {
					data: data,
				},
			}

			if (userRoleAndProfileInformation && Object.keys(userRoleAndProfileInformation).length > 0) {
				options.json.userRoleAndProfileInformation = userRoleAndProfileInformation
			}

			request.post(createdObservationUrl, options, assessmentCallback)

			function assessmentCallback(err, data) {
				let result = {
					success: true,
				}

				if (err) {
					result.success = false
				} else {
					let response = data.body
					if (response.status === HTTP_STATUS_CODE['ok'].status) {
						result['data'] = response.result
					} else {
						result.success = false
					}
				}

				return resolve(result)
			}
		} catch (error) {
			return reject(error)
		}
	})
}

/**
 * List Programs based on ids.
 * @function
 * @name listProgramsBasedOnIds
 * @param {Array} programIds - Array of program ids.
 * @returns {JSON} - List programs based on ids.
 */

const listProgramsBasedOnIds = function (programIds) {
	return new Promise(async (resolve, reject) => {
		try {
			const url = SURVEY_SERVICE_URL + CONSTANTS.endpoints.LIST_PROGRAMS_BY_IDS

			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
				},
				json: {
					programIds: programIds,
				},
			}

			request.post(url, options, kendraCallback)

			function kendraCallback(err, data) {
				let result = {
					success: true,
				}

				if (err) {
					result.success = false
				} else {
					let response = data.body
					if (response.status === HTTP_STATUS_CODE['ok'].status) {
						result['data'] = response.result
					} else {
						result.success = false
					}
				}

				return resolve(result)
			}
		} catch (error) {
			return reject(error)
		}
	})
}

/**
 * Remove solutions from program.
 * @function
 * @name removeSolutionsFromProgram
 * @param {String} programId - Program id.
 * @param {Array} solutionIds - Array of solutions ids.
 * @returns {JSON} - updated program.
 */

const removeSolutionsFromProgram = function (token, programId, solutionIds) {
	return new Promise(async (resolve, reject) => {
		try {
			const url = SURVEY_SERVICE_URL + CONSTANTS.endpoints.REMOVE_SOLUTIONS_FROM_PROGRAM + '/' + programId

			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-auth-token': token,
				},
				json: {
					solutionIds: solutionIds,
				},
			}

			request.post(url, options, kendraCallback)

			function kendraCallback(err, data) {
				let result = {
					success: true,
				}

				if (err) {
					result.success = false
				} else {
					result['data'] = data.body.result
				}

				return resolve(result)
			}
		} catch (error) {
			return reject(error)
		}
	})
}

/**
 * Remove solutions from program.
 * @function
 * @name removeEntitiesFromSolution
 * @param {String} solutionId - Program id.
 * @param {Array} entities - Array of solutions ids.
 * @returns {JSON} - updated program.
 */

const removeEntitiesFromSolution = function (token, solutionId, entities) {
	return new Promise(async (resolve, reject) => {
		try {
			const url = SURVEY_SERVICE_URL + CONSTANTS.endpoints.REMOVE_ENTITY_FROM_SOLUTION + '/' + solutionId

			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-auth-token': token,
				},
				json: {
					entities: entities,
				},
			}

			request.post(url, options, kendraCallback)

			function kendraCallback(err, data) {
				let result = {
					success: true,
				}

				if (err) {
					result.success = false
				} else {
					result['data'] = data.body.result
				}

				return resolve(result)
			}
		} catch (error) {
			return reject(error)
		}
	})
}

/**
 * User targetted solutions.
 * @function
 * @name listEntitiesByLocationIds
 * @param {String} token - User token.
 * @param {Object} locationIds - Requested body data.
 * @returns {JSON} - List of entities by location ids.
 */

const listEntitiesByLocationIds = function (token, locationIds) {
	return new Promise(async (resolve, reject) => {
		try {
			const url = SURVEY_SERVICE_URL + CONSTANTS.endpoints.LIST_ENTITIES_BY_LOCATION_IDS

			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-auth-token': token,
				},
				json: {
					locationIds: locationIds,
				},
			}

			request.post(url, options, assessmentCallback)

			function assessmentCallback(err, data) {
				let result = {
					success: true,
				}

				if (err) {
					result.success = false
				} else {
					let response = data.body

					if (response.status === HTTP_STATUS_CODE['ok'].status && response.result) {
						result['data'] = response.result
					} else {
						result.success = false
					}
				}

				return resolve(result)
			}
		} catch (error) {
			return reject(error)
		}
	})
}

module.exports = {
	observationDetails: observationDetails,
	listSolutions: listSolutions,
	updateSolution: updateSolution,
	createObservation: createObservation,
	listProgramsBasedOnIds: listProgramsBasedOnIds,
	removeSolutionsFromProgram: removeSolutionsFromProgram,
	removeEntitiesFromSolution: removeEntitiesFromSolution,
	listEntitiesByLocationIds: listEntitiesByLocationIds,
	importSurveyTemplateToSolution: importSurveyTemplateToSolution,
	surveyDetails: surveyDetails,
	importObservationTemplateToSolution: importObservationTemplateToSolution,
}

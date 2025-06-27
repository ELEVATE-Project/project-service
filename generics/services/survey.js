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
 * Create Child solutions for survey and observation
 * @function
 * @name importTemplateToSolution
 * @param {String} token - logged in user token.
 * @param {String} solutionId - parent solution id.
 * @param {String} programId- 	programId
 * @param {Object} payload - Body data
 * @param {Object} userDetails - user info
 * @param {String} solutionType -type of solution
 * @returns {JSON} - Create child solution from parent  solution.
 */
const importTemplateToSolution = function (token, solutionId, programId = '', payload = {}, userDetails, solutionType) {
	return new Promise(async (resolve, reject) => {
		try {
			//Build the endpoint and query
			let endpoint
			let url
			switch (solutionType) {
				case CONSTANTS.common.SURVEY:
					endpoint = CONSTANTS.endpoints.IMPORT_SURVEY_TEMPLATE
					url = `${SURVEY_SERVICE_URL}${endpoint}/${solutionId}` + `?appName=elevate&programId=${programId}`
					// Survey service expects payload inside `{ data: … }`
					break

				case CONSTANTS.common.OBSERVATION:
					endpoint = CONSTANTS.endpoints.CREATE_CHILD_OBSERVATION_SOLUTION
					url = `${SURVEY_SERVICE_URL}${endpoint}` + `?solutionId=${solutionId}`
					// Observation already wants the raw body
					break

				default:
					throw new Error('Invalid solutionType: use "survey" or "observation".')
			}
			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
				},
				json: payload,
			}
			//pass the user Token only for admin and orgAdmin
			let roles = userDetails?.userInformation?.roles ?? []
			if (roles && (roles.includes(CONSTANTS.common.ORG_ADMIN) || roles.includes(CONSTANTS.common.ADMIN_ROLE))) {
				_.assign(options.headers, {
					'x-auth-token': token,
				})
			}

			// Admin need extra headers
			if (roles && roles.includes(CONSTANTS.common.ADMIN_ROLE)) {
				_.assign(options.headers, {
					'admin-auth-token': process.env.ADMIN_AUTH_TOKEN,
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
					if (typeof response === CONSTANTS.common.OBJECT) {
						result = response
					} else {
						result = JSON.parse(response)
					}
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
 * Fetches solution details based on a list of external solution IDs.
 * This is typically called after creating solutions, to populate the `solutionDetails`
 * key in task objects.
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
			let roles = userDetails?.userInformation?.roles ?? []
			// pass admin and tenant info in header  if user superAdmin
			if (roles && roles.includes(CONSTANTS.common.ADMIN_ROLE)) {
				_.assign(options.headers, {
					'admin-auth-token': process.env.ADMIN_AUTH_TOKEN,
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
			let roles = userDetails?.userInformation?.roles ?? []
			if (roles && roles.includes(CONSTANTS.common.ADMIN_ROLE)) {
				_.assign(options.headers, {
					'admin-auth-token': process.env.ADMIN_AUTH_TOKEN,
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

module.exports = {
	listSolutions: listSolutions,
	updateSolution: updateSolution,
	createObservation: createObservation,
	surveyDetails: surveyDetails,
	importTemplateToSolution: importTemplateToSolution,
}

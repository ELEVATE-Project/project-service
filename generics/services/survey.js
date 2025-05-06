/**
 * name : survey.js
 * author : Aman Jung Karki
 * Date : 21-Nov-2020
 * Description : Assessment service related information.
 */

//dependencies
const request = require('request')

const ASSESSMENT_URL = process.env.SURVEY_SERVICE_URL
/**
 * Assessment create
 * @function
 * @name createAssessmentSolutionFromTemplate
 * @param {String} token - logged in user token.
 * @param {String} templateId - template id.
 * @param {Object} bodyData - Body data
 * @returns {JSON} - Create assessment from template solution.
 */

const createAssessmentSolutionFromTemplate = function (token, templateId, bodyData) {
	return new Promise(async (resolve, reject) => {
		try {
			let assessmentCreateUrl =
				ASSESSMENT_URL + CONSTANTS.endpoints.ASSESSMENTS_CREATE + '?solutionId=' + templateId

			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-auth-token': token,
				},
				json: bodyData,
			}
			console.log(options, 'thisis opti')
			request.post(assessmentCreateUrl, options, assessmentCallback)

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
 * Create Observation
 * @function
 * @name createObservationFromSolutionTemplate
 * @param {String} token - logged in user token.
 * @param {String} templateId - template id.
 * @param {Object} bodyData - Body data
 * @returns {JSON} - Create assessment from template solution.
 */

const createObservationFromSolutionTemplate = function (token, templateId, bodyData) {
	return new Promise(async (resolve, reject) => {
		try {
			let observationCreateUrl = ASSESSMENT_URL + '/v1/observations/create?solutionId=' + templateId

			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-auth-token': token,
				},
				json: { data: bodyData },
			}
			console.log(options, 'this is options')
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
 * Create Child solutions for survey
 * @function
 * @name importSurveryTemplateToSolution
 * @param {String} token - logged in user token.
 * @param {String} solutionId - parent solution id.
 * @param {Object} bodyData - Body data
 * @returns {JSON} - Create child solution from parent  solution.
 */
const importSurveryTemplateToSolution = function (token, solutionId, bodyData) {
	return new Promise(async (resolve, reject) => {
		try {
			let surveyCreateUrl =
				ASSESSMENT_URL + '/v1/surveys/importSurveryTemplateToSolution' + '/' + solutionId + '?appName=elevate'

			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-auth-token': token,
				},
				json: bodyData,
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
					if (response.status === HTTP_STATUS_CODE['ok'].status) {
						result['data'] = response.result
					} else {
						result.success = false
					}
				}
				return resolve(result)
			}
		} catch (error) {
			console.log(error, 'this is errro')
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
const surveyDetails = function (token, solutionId, bodyData) {
	return new Promise(async (resolve, reject) => {
		try {
			let observationCreateUrl =
				ASSESSMENT_URL + '/v1/surveys/details' + '?solutionId=' + solutionId + '&&fromPrjectService=true'

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
 * Add entity to observation
 * @function
 * @name addEntityToObservation
 * @param {String} token - logged in user token.
 * @param {String} observationId - template id.
 * @param {Object} bodyData - Body data
 * @returns {JSON} - Create assessment from template solution.
 */

/**
 * Add entities to assessment solution
 * @function
 * @name addEntitiesToSolution
 * @param {String} token - logged in user token.
 * @param {String} solutionId - solution id.
 * @param {Object} bodyData - Body data
 * @returns {JSON} - Add entity to assessment solution.
 */

const addEntitiesToSolution = function (token, solutionId, bodyData) {
	return new Promise(async (resolve, reject) => {
		try {
			let assessmentCreateUrl = ASSESSMENT_URL + CONSTANTS.endpoints.ADD_ENTITIES_TO_SOLUTIONS + '/' + solutionId

			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-auth-token': token,
				},
				json: {
					entities: bodyData,
				},
			}

			request.post(assessmentCreateUrl, options, assessmentCallback)

			function assessmentCallback(err, data) {
				let result = {
					success: true,
				}

				if (err) {
					result.success = false
				} else {
					let response = data.body
					if (response.status === HTTP_STATUS_CODE['ok'].status) {
						result['data'] = response.result ? response.result : {}
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
 * Add entity to observation
 * @function
 * @name addEntityToObservation
 * @param {String} token - logged in user token.
 * @param {String} observationId - observation id.
 * @param {Object} bodyData - Body data
 * @returns {JSON} - Add entity to observation.
 */

const addEntityToObservation = function (token, observationId, bodyData) {
	return new Promise(async (resolve, reject) => {
		try {
			let addEntityToObservationUrl =
				ASSESSMENT_URL + CONSTANTS.endpoints.ADD_ENTITY_TO_OBSERVATIONS + '/' + observationId

			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-auth-token': token,
				},
				json: {
					data: bodyData,
				},
			}

			request.post(addEntityToObservationUrl, options, assessmentCallback)

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
 * Create entity assessors
 * @function
 * @name createEntityAssessors
 * @param {String} token - logged in user token.
 * @param {String} programId - program id.
 * @param {String} solutionId - solution id.
 * @param {Array} entities - Entities data
 * @returns {JSON} - Add entity to observation.
 */

const createEntityAssessors = function (token, programId, solutionId, entities) {
	return new Promise(async (resolve, reject) => {
		try {
			let createdEntityAssessor =
				ASSESSMENT_URL +
				CONSTANTS.endpoints.CREATE_ENTITY_ASSESSORS +
				'/' +
				programId +
				'?solutionId=' +
				solutionId

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

			request.post(createdEntityAssessor, options, assessmentCallback)

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
			let url = ASSESSMENT_URL + CONSTANTS.endpoints.OBSERVATION_DETAILS + '/' + observationId

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
 * @returns {JSON} - List of solutions
 */

const listSolutions = function (solutionIds) {
	return new Promise(async (resolve, reject) => {
		try {
			const url = ASSESSMENT_URL + CONSTANTS.endpoints.LIST_SOLUTIONS

			let options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
				},
			}
			options['json'] = solutionIds
			console.log(options, 'this is opt')
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

const updateSolution = function (token, updateData, solutionExternalId) {
	return new Promise(async (resolve, reject) => {
		try {
			const url =
				ASSESSMENT_URL + CONSTANTS.endpoints.UPDATE_SOLUTIONS + '?solutionExternalId=' + solutionExternalId

			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-auth-token': token,
				},
				json: updateData,
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
 * @returns {JSON} - Create observation.
 */

const createObservation = function (token, solutionId, data, userRoleAndProfileInformation = {}) {
	return new Promise(async (resolve, reject) => {
		try {
			let createdObservationUrl =
				ASSESSMENT_URL + CONSTANTS.endpoints.CREATE_OBSERVATIONS + '?solutionId=' + solutionId

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
			const url = ASSESSMENT_URL + CONSTANTS.endpoints.LIST_PROGRAMS_BY_IDS

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
			const url = ASSESSMENT_URL + CONSTANTS.endpoints.REMOVE_SOLUTIONS_FROM_PROGRAM + '/' + programId

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
			const url = ASSESSMENT_URL + CONSTANTS.endpoints.REMOVE_ENTITY_FROM_SOLUTION + '/' + solutionId

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
			const url = ASSESSMENT_URL + CONSTANTS.endpoints.LIST_ENTITIES_BY_LOCATION_IDS

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
	createAssessmentSolutionFromTemplate: createAssessmentSolutionFromTemplate,
	createObservationFromSolutionTemplate: createObservationFromSolutionTemplate,
	addEntityToObservation: addEntityToObservation,
	addEntitiesToSolution: addEntitiesToSolution,
	createEntityAssessors: createEntityAssessors,
	observationDetails: observationDetails,
	listSolutions: listSolutions,
	updateSolution: updateSolution,
	createObservation: createObservation,
	listProgramsBasedOnIds: listProgramsBasedOnIds,
	removeSolutionsFromProgram: removeSolutionsFromProgram,
	removeEntitiesFromSolution: removeEntitiesFromSolution,
	listEntitiesByLocationIds: listEntitiesByLocationIds,
	importSurveryTemplateToSolution: importSurveryTemplateToSolution,
	surveyDetails: surveyDetails,
}

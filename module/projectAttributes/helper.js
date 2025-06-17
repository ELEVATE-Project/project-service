const projectAttributesQueries = require(DB_QUERY_BASE_PATH + '/projectAttributes')
const entitiesService = require(GENERICS_FILES_PATH + '/services/entity-management')

module.exports = class ProjectAttributesHelper {
	/**
	 * create project attributes
	 * @method
	 * @name create
	 * @param {Object} userDetails - loggedin user info
	 * @returns {Object} .
	 */
	static async create(userDetails) {
		try {
			// Get the default project attributes
			let getProjectAttribute = CONSTANTS.common.DEFAULT_ATTRIBUTES
			const tenantId = userDetails.tenantAndOrgInfo.tenantId
			const orgId = userDetails.tenantAndOrgInfo.orgId[0]
			//Getting roles from the entity service
			let userRoleInformation = await entitiesService.getUserRoleExtensionDocuments(
				{
					status: CONSTANTS.common.ACTIVE_STATUS.toUpperCase(),
					tenantId,
					orgId,
				},
				['title', 'code']
			)

			if (!userRoleInformation.success) {
				throw {
					message: CONSTANTS.apiResponses.FAILED_TO_FETCH_USERROLE,
					status: HTTP_STATUS_CODE.bad_request.status,
				}
			}
			let roleToAddForFilter = []
			if (userRoleInformation.data.length > 0) {
				userRoleInformation.data.map((eachResult) => {
					roleToAddForFilter.push({
						label: eachResult.title,
						value: eachResult.code,
					})
				})
			}
			// Adding the roles into entities of projectAttributes
			getProjectAttribute[1].entities = roleToAddForFilter
			getProjectAttribute.forEach((item) => {
				item['tenantId'] = tenantId
				item['orgId'] = orgId
			})
			await projectAttributesQueries.createProjectAttributes(getProjectAttribute)
			return {
				success: true,
				message: CONSTANTS.apiResponses.PROJECT_ATTRIBUTES_CREATED,
			}
		} catch (error) {
			// If an error occurs, return an error response with status, message, and the error object
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	/**
	 * update project attributes
	 * @method
	 * @name update
	 * @param {code} - which attributes need to be updated
	 * @param {language} - language code for multilingual
	 * @param {Object} bodyData  - reqBody
	 * @param {Object} userDetails - loggedin user info
	 * @returns {Object} .
	 */

	static async update(code, language, bodyData, userDetails) {
		try {
			const tenantId = userDetails.tenantAndOrgInfo.tenantId
			const orgId = userDetails.tenantAndOrgInfo.orgId[0]
			if (bodyData.translateData) {
				// getting name and data from reqBody
				const { name, data } = bodyData.translateData

				// Fetch the project attributes document for the given code and language
				const projectAttributesDocument = await projectAttributesQueries.projectAttributesDocument(
					{
						code: code,
						[`translation.${language}`]: { $exists: true },
						tenantId,
						orgId,
					},
					[`translation.${language}`]
				)

				if (projectAttributesDocument && projectAttributesDocument.length > 0) {
					// Filter data to exclude already existing codes in the document
					const existingCodes = projectAttributesDocument[0].translation[language].data || []
					const filteredData = data.filter((eachValue) => !existingCodes.includes(eachValue.code))

					if (filteredData.length > 0) {
						// Update only if there is filtered data
						await projectAttributesQueries.findAndUpdate(
							{ code: code, tenantId, orgId },
							{ $set: { [`translation.${language}`]: { name, data: filteredData } } }
						)
					}
				} else {
					// If no document matches, upsert a new one
					await projectAttributesQueries.findAndUpdate(
						{ code: code, tenantId, orgId },
						{ $set: { [`translation.${language}`]: { name, data } } },
						{ upsert: true }
					)
				}
				return {
					success: true,
					message: CONSTANTS.apiResponses.PROJECT_ATTRIBUTES_UPDATED,
				}
			} else {
				let projectAttributesDocument = await this.updateEntities(
					'entities',
					code,
					bodyData.data,
					tenantId,
					orgId
				)
				if (projectAttributesDocument.success) {
					return {
						success: true,
						message: CONSTANTS.apiResponses.PROJECT_ATTRIBUTES_UPDATED,
					}
				} else {
					throw {
						message: CONSTANTS.apiResponses.PROJECT_ATTRIBUTES_NOT_UPDATED,
						status: HTTP_STATUS_CODE.bad_request.status,
					}
				}
			}
		} catch (error) {
			// Handle errors gracefully
			console.error('Error updating project attributes:', error)
			return {
				success: false,
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	/**
	 * update project attributes Entities
	 * @method
	 * @name updateEntities
	 * @param {keyToFilter} - which attributes key need to be updated
	 * @param {code}       -  attributes code for update
	 * @param {Object} filterData  - reqBody
	 * @param {String} tenantId - user's tenant id
	 * @param {String} orgId - user's org id
	 * @returns {Object} .
	 */
	static async updateEntities(keyToFilter = 'entities', code = 'role', filterData, tenantId, orgId) {
		try {
			let userRoleInformation
			let roleToAddForFilter = []

			if (code === 'role') {
				// Fetch latest user role information from entityService
				userRoleInformation = await entitiesService.getUserRoleExtensionDocuments(
					{
						status: CONSTANTS.common.ACTIVE_STATUS.toUpperCase(),
						tenantId,
						orgId,
					},
					['title', 'code']
				)

				if (!userRoleInformation.success) {
					throw {
						message: CONSTANTS.apiResponses.FAILED_TO_FETCH_USERROLE,
						status: HTTP_STATUS_CODE.bad_request.status,
					}
				}
				if (userRoleInformation.data.length > 0) {
					roleToAddForFilter = userRoleInformation.data.map((eachResult) => {
						return {
							label: eachResult.title,
							value: eachResult.code,
						}
					})
				}
			}

			// If current role filter doesn't match with userRole of entityService then updating the existing role filter

			let updatedEntities = await projectAttributesQueries.findAndUpdate(
				{ code: code, tenantId, orgId },
				{ [keyToFilter]: code === 'role' ? roleToAddForFilter : filterData }
			)
			if (!updatedEntities) {
				return {
					success: false,
				}
			}
			return {
				success: true,
			}
		} catch (error) {
			// Handle error response
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	/**
	 * find project attributes
	 * @method
	 * @name find
	 * @param {String} language - Language Code of project attributes to get the multilingual response
	 * @param {Object} userDetails - loggedin user info
	 * @returns {Object} projectAttributesData.
	 */
	static async find(language = '', userDetails) {
		try {
			// Get the role updated with the current entityService Roles
			await this.updateEntities()

			const tenantId = userDetails.userInformation.tenantId
			const orgId = userDetails.userInformation.organizationId

			let createProjectAttributes = await projectAttributesQueries.projectAttributesDocument(
				{ tenantId, orgId },
				['name', 'code', 'entities', language != '' ? 'translation' : '']
			)
			// Get the response object based on languageCode
			const filterData = createProjectAttributes.map((eachValue) => {
				return {
					Name: (language && eachValue.translation?.[language]?.name) || eachValue.name,
					code: eachValue.code,
					values: (language && eachValue.translation?.[language]?.data) || eachValue.entities,
				}
			})
			return {
				success: true,
				message: CONSTANTS.apiResponses.PROJECT_ATTRIBUTES_FETCHED,
				result: filterData,
			}
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}
}

const projectAttributesQueries = require(DB_QUERY_BASE_PATH + '/projectAttributes')
const entitiesService = require(GENERICS_FILES_PATH + '/services/entity-management')

module.exports = class ProjectAttributesHelper {
	/**
	 * create project attributes
	 * @method
	 * @name create
	 * @returns {Object} .
	 */
	static async create() {
		try {
			// Get the default project attributes
			let getProjectAttribute = CONSTANTS.common.DEFAULT_ATTRIBUTES
			//Getting roles from the entity service
			let userRoleInformation = await entitiesService.userExtensionDocuments(
				{
					status: CONSTANTS.common.ACTIVE_STATUS.toUpperCase(),
				},
				['title', 'code']
			)

			if (!userRoleInformation.success) {
				throw new Error(userRoleInformation)
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
	 * @param {codeToUpdate} - which attributes need to be updated
	 * @param {languageCode} - language code for multilingual
	 * @param {Object} translateData  - TranslatedData object(reqBody)
	 * @returns {Object} .
	 */

	static async update(codeToUpdate, languageCode, translateData) {
		try {
			// getting name and data from reqBody
			const { name, data } = translateData

			// Fetch the project attributes document for the given code and language
			const projectAttributesDocument = await projectAttributesQueries.projectAttributesDocument(
				{
					code: codeToUpdate,
					[`translation.${languageCode}`]: { $exists: true },
				},
				[`translation.${languageCode}`]
			)

			if (projectAttributesDocument && projectAttributesDocument.length > 0) {
				// Filter data to exclude already existing codes in the document
				const existingCodes = projectAttributesDocument[0].translation[languageCode].data || []
				const filteredData = data.filter((eachValue) => !existingCodes.includes(eachValue.code))

				if (filteredData.length > 0) {
					// Update only if there is filtered data
					await projectAttributesQueries.findAndUpdate(
						{ code: codeToUpdate },
						{ $set: { [`translation.${languageCode}`]: { name, data: filteredData } } }
					)
				}
			} else {
				// If no document matches, upsert a new one
				await projectAttributesQueries.findAndUpdate(
					{ code: codeToUpdate },
					{ $set: { [`translation.${languageCode}`]: { name, data } } },
					{ upsert: true }
				)
			}

			return {
				success: true,
				message: 'Successfully updated the project attributes',
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
	 * @name update
	 * @returns {Object} .
	 */
	static async updateEntities(keyToFilter = 'entities', name = 'role', filterData) {
		try {
			// Fetch latest user role information from entityService
			let userRoleInformation = await entitiesService.userExtensionDocuments(
				{
					status: CONSTANTS.common.ACTIVE_STATUS.toUpperCase(),
				},
				['title', 'code']
			)

			if (!userRoleInformation.success) {
				return resolve(userRoleInformation)
			}

			let roleToAddForFilter = []
			if (userRoleInformation.result.length > 0) {
				roleToAddForFilter = userRoleInformation.data.map((eachResult) => {
					return {
						label: eachResult.title,
						value: eachResult.code,
					}
				})
			}

			// Fetch project attributes dynamically based on the key
			let createProjectAttributes = await projectAttributesQueries.projectAttributesDocument({}, [
				'name',
				'code',
				keyToFilter,
			])
			// If current role filter doesn't match with userRole of entityService then updating the existing role filter
			if (
				createProjectAttributes[keyToFilter].length > 0 &&
				createProjectAttributes[keyToFilter].length < roleToAddForFilter.length
			) {
				await projectAttributesQueries.findAndUpdate(
					{ name: name },
					{ [keyToFilter]: (name = 'role' ? roleToAddForFilter : filterData) }
				)
			}

			return resolve({
				success: true,
			})
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
	 * @returns {Object} projectAttributesData.
	 */
	static async find(languageCode = '') {
		try {
			// Get the role updated with the current entityService Roles
			await this.updateEntities()

			let createProjectAttributes = await projectAttributesQueries.projectAttributesDocument({}, [
				'name',
				'code',
				'entities',
				languageCode != '' ? 'translation' : '',
			])
			// Get the response object based on languageCode
			const filterData = createProjectAttributes.map((eachValue) => {
				return {
					Name: (languageCode && eachValue.translation?.[languageCode]?.name) || eachValue.name,
					values: (languageCode && eachValue.translation?.[languageCode]?.data) || eachValue.entities,
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

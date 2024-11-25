const projectAttributesQueries = require(DB_QUERY_BASE_PATH + '/projectAttributes')
const entitiesService = require(GENERICS_FILES_PATH + '/services/entity-management')

module.exports = class ProfileAttributesHelper {
	/**
	 * create project attributes
	 * @method
	 * @name create
	 * @returns {Object} .
	 */
	static async create() {
		try {
			const getProjectAttribute = await getProjectAttributes()
			let userRoleInformation = await entitiesService.userExtensionDocuments(
				{
					status: CONSTANTS.common.ACTIVE_STATUS.toUpperCase(),
				},
				['title', 'code']
			)

			if (!userRoleInformation.success) {
				return userRoleInformation
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
	 * @returns {Object} .
	 */
	static async update(keyToFilter = 'entities', name = 'role', filterData) {
		try {
			// Fetch user role information
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
	static async find() {
		try {
			// Get the role updated
			await this.update()

			let createProjectAttributes = await projectAttributesQueries.projectAttributesDocument({}, [
				'name',
				'code',
				'entities',
			])
			const filterData = createProjectAttributes.map((eachValue) => {
				return {
					Name: eachValue.name,
					values: eachValue.entities,
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

function getProjectAttributes() {
	let attributesvalue = [
		{
			name: 'Duration',
			code: 'duration',
			hasEntityTrue: true,
			entities: [
				{
					value: '1 week',
					label: '1 week',
				},
				{
					value: '2 week',
					label: '2 week',
				},
				{
					value: '3 week',
					label: '3 week',
				},
				{
					value: '4 week',
					label: '4 week',
				},
				{
					value: '5 week',
					label: '5 week',
				},
				{
					value: '6 week',
					label: '6 week',
				},
				{
					value: 'More than 6 weeks',
					label: 'More than 6 weeks',
				},
			],
		},
		{
			name: 'Role',
			code: 'role',
			hasEntityTrue: true,
			entities: [],
		},
	]

	return attributesvalue
}

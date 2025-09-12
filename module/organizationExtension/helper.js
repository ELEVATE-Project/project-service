/**
 * name : helper.js
 * author : prajwal
 * created-date : 11-sep-2025
 * Description : Organization Extension helper functionality.
 */
const orgExtenQueries = require(DB_QUERY_BASE_PATH + '/organizationExtension.js')
module.exports = class OrganizationHelper {
	/**
	 * Update Organization Extension document
	 * @method
	 * @name updateOrgExtension
	 * @param req - requestData
	 * @returns {Object} Updated document
	 */

	static async updateOrgExtension(req) {
		return new Promise(async (resolve, reject) => {
			try {
				// Fetch org extension document by ID
				const tenantId = req.userDetails.tenantAndOrgInfo.tenantId
				const orgExtension = await orgExtenQueries.orgExtenDocuments({
					_id: UTILS.convertStringToObjectId(req.params._id),
					tenantId,
				})

				// If no document is found, throw error
				if (!orgExtension || orgExtension.length === 0) {
					throw {
						success: false,
						message: CONSTANTS.apiResponses.ORG_EXTENSION_NOT_FOUND,
					}
				}

				// Extract request body
				let bodyData = req.body

				// Only allow updating of specific fields: projectResourceVisibilityPolicy & externalProjectResourceVisibilityPolicy
				let filteredBodyData = Object.fromEntries(
					Object.entries(bodyData).filter(
						([key, value]) =>
							key === 'projectResourceVisibilityPolicy' ||
							key === 'externalProjectResourceVisibilityPolicy'
					)
				)

				// Get all allowed values for org extension visibility
				let orgExtenVisibilityValues = Object.values(CONSTANTS.common.ORG_EXTENSION_VISIBILITY)

				// Validate each provided visibility policy
				Object.entries(filteredBodyData).map(([key, value]) => {
					if (key == 'projectResourceVisibilityPolicy' || key == 'externalProjectResourceVisibilityPolicy') {
						value = value.toUpperCase()
						filteredBodyData[key] = value
						// If provided value is not valid, reset to default
						if (!orgExtenVisibilityValues.includes(value)) delete filteredBodyData[key]
					}
				})

				// Add "updatedBy" field to track who made the update
				filteredBodyData['updatedBy'] = req.userDetails.userInformation.userName

				// Update the org extension in DB and return the new document
				const updatedOrgExtension = await orgExtenQueries.update(
					{
						_id: UTILS.convertStringToObjectId(req.params._id),
						tenantId,
					},
					filteredBodyData,
					{
						new: true,
					}
				)

				// Throw error if updation failed
				if (!updatedOrgExtension) {
					throw {
						success: false,
						message: CONSTANTS.apiResponses.ORG_EXTENSION_UPDATE_FAILED,
					}
				}

				// Return success response with updated data
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.ORG_EXTENSION_UPDATED,
					result: updatedOrgExtension,
				})
			} catch (error) {
				// Catch and return error response
				return resolve({
					message: error.message,
					success: false,
				})
			}
		})
	}

	/**
	 * Create Organization Extension document
	 * @method
	 * @name createOrgExtension
	 * @param req - requestData
	 * @returns {Object} Created document
	 */
	static async createOrgExtension(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const bodyData = req.body

				// Pick tenantId from request body if present, else fallback to userDetails
				const tenantId = bodyData.tenant_code ? bodyData.tenant_code : req.userDetails.tenantAndOrgInfo.tenantId

				// Pick orgId from request body if present, else fallback to userDetails
				const orgId = bodyData.code ? bodyData.code : req.userDetails.tenantAndOrgInfo.orgId[0]

				// Prepare data object for org extension creation
				let orgExtenData = {
					tenantId,
					orgId,
				}

				const orgExtensionDoc = await orgExtenQueries.orgExtenDocuments(orgExtenData)

				if (orgExtensionDoc && orgExtensionDoc.length > 0) {
					throw {
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.ORG_EXTENSION_ALREADY_EXISTS,
					}
				}

				// Use projectResourceVisibilityPolicy from body if given
				if (bodyData.projectResourceVisibilityPolicy) {
					orgExtenData['projectResourceVisibilityPolicy'] = bodyData.projectResourceVisibilityPolicy
				}

				// Use externalProjectResourceVisibilityPolicy from body if given
				if (bodyData.externalProjectResourceVisibilityPolicy) {
					orgExtenData['externalProjectResourceVisibilityPolicy'] =
						bodyData.externalProjectResourceVisibilityPolicy
				}

				// Get all allowed values for org extension visibility
				let orgExtenVisibilityValues = Object.values(CONSTANTS.common.ORG_EXTENSION_VISIBILITY)

				// Validate each provided visibility policy
				Object.entries(orgExtenData).map(([key, value]) => {
					if (key == 'projectResourceVisibilityPolicy' || key == 'externalProjectResourceVisibilityPolicy') {
						value = value.toUpperCase()
						orgExtenData[key] = value
						// If provided value is not valid, reset to default
						if (!orgExtenVisibilityValues.includes(value)) delete orgExtenData[key]
					}
				})

				// Call query to insert org extension document
				const orgExtenCreate = await orgExtenQueries.create(orgExtenData)

				if (!orgExtenCreate || Object.keys(orgExtenCreate).length === 0) {
					throw {
						success: false,
						status: HTTP_STATUS_CODE.internal_server_error.status,
						message: CONSTANTS.apiResponses.ORG_EXTENSION_CREATE_FAILED,
					}
				}

				// Return success response
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.ORG_EXTENSION_CREATED,
					result: orgExtenCreate,
				})
			} catch (error) {
				return reject({
					message: error.message,
					success: false,
				})
			}
		})
	}
}

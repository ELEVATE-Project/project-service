/**
 * name : helper.js
 * author : prajwal
 * created-date : 14-05-2024
 * Description : Certificate Template related helper functionality.
 */

// dependencies
const certificateTemplatesHelper = require(MODULES_BASE_PATH + '/certificateTemplates/helper')
const certificateBaseTemplateQueries = require(DB_QUERY_BASE_PATH + '/certificateBaseTemplates')

/**
 * CertificateBaseTemplatesHelper
 * @class
 */
module.exports = class CertificateBaseTemplatesHelper {
	/**
	 * Create certificate base template.
	 * @method create
	 * @name create
	 * @param {Object} data - certificate base template creation data.
	 * @param {String} file - file.
	 * @param {String} userId - userId.
	 * @param {Object} userDetails - user related info
	 * @returns {JSON} created certificate base template details.
	 */

	static create(data, file, userId, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				// Call the uploadToCloud method of certificateTemplatesHelper with the provided file data
				let uploadFile = await certificateTemplatesHelper.uploadToCloud(file, '', userId, false)
				// Throw an error if the file upload was not successful
				if (!uploadFile.success) {
					throw {
						message: CONSTANTS.apiResponses.COULD_NOT_UPLOAD_CONTENT,
					}
				}
				// Add the uploaded file URL to the data object
				data.url = uploadFile.data.templateUrl

				data['tenantId'] = userDetails.tenantAndOrgInfo.tenantId
				data['orgId'] = userDetails.tenantAndOrgInfo.orgId[0]

				// Call the create method of certificateBaseTemplateQueries to create a new certificate base template
				let certificateBaseTemplateCreated = await certificateBaseTemplateQueries.create(data)

				// Resolve the promise with the created certificate base template details
				return resolve({
					message: CONSTANTS.apiResponses.CERTIFICATE_BASE_TEMPLATE_ADDED,
					data: {
						_id: certificateBaseTemplateCreated._id,
					},
					result: {
						_id: certificateBaseTemplateCreated._id,
					},
				})
			} catch (error) {
				// Reject the promise with the error object
				return reject(error)
			}
		})
	}

	/**
	 * Update certificate base template.
	 * @method update
	 * @name update
	 * @param {String} baseTemplateId - certificate template Id.
	 * @param {Object} data - certificate template updation data.
	 * @param {String} file - file.
	 * @param {String} userId - userId.
	 * @param {Object} userDetails - user related info
	 * @returns {JSON} Updated certificate template details.
	 */

	static update(baseTemplateId, data, file = {}, userId, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				// avoid adding manupulative data
				delete data.tenantId
				delete data.orgId

				// Check if a file is provided in the request
				if (Object.keys(file).length > 0) {
					// Call the uploadToCloud method of certificateTemplatesHelper with the provided file data
					let uploadFile = await certificateTemplatesHelper.uploadToCloud(file, '', userId, true)
					// Throw an error if the file upload was not successful
					if (!uploadFile.success) {
						throw {
							message: CONSTANTS.apiResponses.COULD_NOT_UPLOAD_CONTENT,
						}
					}
					// Add the uploaded file URL to the data object
					data.url = uploadFile.data.templateUrl
				}

				// Create an update object with the new data
				let updateObject = {
					$set: data,
				}
				let tenantId = userDetails.tenantAndOrgInfo.tenantId

				// Call the update method of certificateBaseTemplateQueries to update the database
				let certificateBaseTemplateUpdated = await certificateBaseTemplateQueries.update(
					{ _id: baseTemplateId, tenantId: tenantId },
					updateObject
				)
				// Throw an error if the update was not successful
				if (certificateBaseTemplateUpdated == null) {
					throw {
						message: CONSTANTS.apiResponses.CERTIFICATE_BASE_TEMPLATE_NOT_UPDATED,
					}
				}
				// Resolve the promise with the updated certificate base template details
				return resolve({
					message: CONSTANTS.apiResponses.CERTIFICATE_BASE_TEMPLATE_UPDATED,
					data: {
						_id: certificateBaseTemplateUpdated._id,
					},
					result: {
						_id: certificateBaseTemplateUpdated._id,
					},
				})
			} catch (error) {
				// Reject the promise with the error object
				return reject(error)
			}
		})
	}
}

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
	 * @returns {JSON} created certificate base template details.
	 */

	static create(data, file, userId) {
		return new Promise(async (resolve, reject) => {
			try {
				let uploadFile = await certificateTemplatesHelper.uploadToCloud(file, '', userId, false)
				if (!uploadFile.success) {
					throw {
						message: CONSTANTS.apiResponses.COULD_NOT_UPLOAD_CONTENT,
					}
				}
				data.url = uploadFile.data.templateUrl
				let certificateBaseTemplateCreated = await certificateBaseTemplateQueries.create(data)
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
	 * @returns {JSON} Updated certificate template details.
	 */

	static update(baseTemplateId, data, file = {}, userId) {
		return new Promise(async (resolve, reject) => {
			try {
				if (Object.keys(file).length > 0) {
					let uploadFile = await certificateTemplatesHelper.uploadToCloud(file, '', userId, true)
					if (!uploadFile.success) {
						throw {
							message: CONSTANTS.apiResponses.COULD_NOT_UPLOAD_CONTENT,
						}
					}
					data.url = uploadFile.data.templateUrl
				}

				let updateObject = {
					$set: data,
				}
				let certificateBaseTemplateUpdated = await certificateBaseTemplateQueries.update(
					{ _id: baseTemplateId },
					updateObject
				)
				if (certificateBaseTemplateUpdated == null) {
					throw {
						message: CONSTANTS.apiResponses.CERTIFICATE_BASE_TEMPLATE_NOT_UPDATED,
					}
				}
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
				return reject(error)
			}
		})
	}
}

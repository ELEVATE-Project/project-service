/**
 * name : certificateTemplates.js
 * author : Vishnu
 * created-date : 03-Oct-2022
 * Description : Certificate template helper for DB interactions.
 */

// Dependencies

/**
 * CertificateTemplates
 * @class
 */

module.exports = class CertificateTemplates {
	/**
	 * certificate template details.
	 * @method
	 * @name certificateTemplateDocument
	 * @param {Array} [filterData = "all"] - certificate template filter query.
	 * @param {Array} [fieldsArray = "all"] - projected fields.
	 * @param {Array} [skipFields = "none"] - field not to include.
	 * @returns {Array} certificateTemplates details.
	 */

	static certificateTemplateDocument(filterData = 'all', fieldsArray = 'all', skipFields = 'none') {
		return new Promise(async (resolve, reject) => {
			try {
				let queryObject = filterData != 'all' ? filterData : {}
				let projection = {}

				if (fieldsArray != 'all') {
					fieldsArray.forEach((field) => {
						projection[field] = 1
					})
				}

				if (skipFields !== 'none') {
					skipFields.forEach((field) => {
						projection[field] = 0
					})
				}
				let certificateTemplateDoc = await database.models.certificateTemplates
					.find(queryObject, projection)
					.lean()

				return resolve(certificateTemplateDoc)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * create certificate template.
	 * @method
	 * @name createCertificateTemplate
	 * @param {JSON} data - payload data.
	 * @returns {JSON} certificateTemplates details.
	 */

	static createCertificateTemplate(data) {
		return new Promise(async (resolve, reject) => {
			try {
				let certificateTemplateDoc = await database.models.certificateTemplates.create(data)

				return resolve(certificateTemplateDoc)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * update certificate template details.
	 * @method
	 * @name updateCertificateTemplate
	 * @param {Array} [filterData = "all"] - certificate template filter query.
	 * @param {JSON} setData - data to be updated.
	 * @param {JSON} returnData - return the updated the data.
	 * @returns {JSON} updated certificateTemplate details.
	 */

	static updateCertificateTemplate(filterData, setData, returnData = { new: true }) {
		return new Promise(async (resolve, reject) => {
			try {
				let certificateBaseTemplateDoc = await database.models.certificateTemplates
					.findOneAndUpdate(filterData, setData, returnData)
					.lean()

				return resolve(certificateBaseTemplateDoc)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Delete certificateTemplates documents based on the provided MongoDB filter.
	 * @param {Object} filter - MongoDB query filter to match documents for deletion.
	 * @returns {Promise<Object>} - MongoDB deleteMany result containing deleted count.
	 */
	static deleteCertificateTemplate(filter) {
		return new Promise(async (resolve, reject) => {
			try {
				let deleteDocuments = await database.models.certificateTemplates.deleteMany(filter)

				return resolve(deleteDocuments)
			} catch (error) {
				return reject(error)
			}
		})
	}
}

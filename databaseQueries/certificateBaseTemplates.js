/**
 * name : certificateBaseTemplates.js
 * author : prajwal
 * created-date : 21-May-2024
 * Description : Certificate base template helper for DB interactions.
 */

// Dependencies

/**
 * CertificateBaseTemplates
 * @class
 */

module.exports = class CertificateBaseTemplates {
	/**
	 * certificate base template create.
	 * @method
	 * @name create
	 * @param {JSON} data - certificate base template bodyData.
	 * @returns {JSON} - certificateBaseTemplate creation details.
	 */

	static create(data) {
		return new Promise(async (resolve, reject) => {
			try {
				let certificateBaseTemplateDoc = await database.models.certificateBaseTemplates.create(data)

				return resolve(certificateBaseTemplateDoc)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * certificate base template update.
	 * @method
	 * @name update
	 * @param {JSON} filterData - certificate base template filter query.
	 * @param {JSON} setData - set data.
	 * @param {Boolean} returnData - true/false to return updated data
	 * @returns {JSON} certificateBaseTemplates updated details.
	 */

	static update(filterData, setData, returnData = { new: true }) {
		return new Promise(async (resolve, reject) => {
			try {
				let certificateBaseTemplateDoc = await database.models.certificateBaseTemplates
					.findOneAndUpdate(filterData, setData, returnData)
					.lean()

				return resolve(certificateBaseTemplateDoc)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * certificate base template find.
	 * @method
	 * @name update
	 * @param {JSON} filterData - certificate base template filter query.
	 * @param {JSON} fieldsArray - projection fields.
	 * @returns {JSON} certificateBaseTemplates details.
	 */

	static findDocument(filterData, fieldsArray) {
		return new Promise(async (resolve, reject) => {
			try {
				let baseTemplateData = await database.models.certificateBaseTemplates
					.find(filterData, fieldsArray)
					.lean()
				return resolve(baseTemplateData)
			} catch (error) {
				return reject(error)
			}
		})
	}
}

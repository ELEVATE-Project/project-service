/**
 * OrganizationExtension
 * @class
 */

module.exports = class OrganizationExtension {
	/**
	 * Create Organization Extension Document.
	 * @method
	 * @name create
	 * @param {Object} [orgExtenData] - Organization Extension Data.
	 * @returns {Object} - Organization Extension Document
	 */
	static create(orgExtenData) {
		return new Promise(async (resolve, reject) => {
			try {
				let orgExten = await database.models.organizationExtension.create(orgExtenData)
				return resolve(orgExten)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Lists of Organization Extension Documents.
	 * @method
	 * @name orgExtenDocuments
	 * @param {Array} [filterData = "all"] - Organization Extension filter query.
	 * @param {Array} [fieldsArray = "all"] - projected fields.
	 * @param {Array} [skipFields = "none"] - field not to include
	 * @returns {Array} Lists of Organization Extension Documents.
	 */
	static orgExtenDocuments(filterData = 'all', fieldsArray = 'all', skipFields = 'none', sort = {}) {
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
				let orgExten = await database.models.organizationExtension
					.find(queryObject, projection)
					.sort(sort) // Use the `sort` parameter for sorting
					.lean()
				return resolve(orgExten)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Update Organization Extension Documents.
	 * @method
	 * @name update
	 * @param {Object} [filterData] - filtered Query.
	 * @param {Object} [updateData] - update data.
	 * @returns {Array} - Organization Extension Documents.
	 */
	static update(filterData = 'all', updateData, returnData = { new: false }) {
		return new Promise(async (resolve, reject) => {
			try {
				let queryObject = filterData != 'all' ? filterData : {}
				let updatedData = await database.models.organizationExtension
					.findOneAndUpdate(queryObject, updateData, returnData)
					.lean()

				return resolve(updatedData)
			} catch (error) {
				return reject(error)
			}
		})
	}
}

// Dependencies

/**
 * userExtension
 * @class
 */

module.exports = class UserExtension {
	/**
	 * userExtensionDocument details.
	 * @method
	 * @name userExtensionDocument
	 * @param {Array} [filterData = "all"] - userExtension filter query.
	 * @param {Array} [fieldsArray = "all"] - projected fields.
	 * @param {Array} [skipFields = "none"] - field not to include
	 * @returns {Array} userExtension details.
	 */

	static userExtensionDocument(filterData = 'all', fieldsArray = 'all', skipFields = 'none') {
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
				let projectAttributesDocument = await database.models.userExtension.find(queryObject, projection).lean()

				return resolve(projectAttributesDocument)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * find userExtension
	 * @method
	 * @name getAggregate
	 * @param {Array} query - aggregation query.
	 * @returns {Array} List of userExtension.
	 */

	static getAggregate(query = []) {
		return new Promise(async (resolve, reject) => {
			try {
				let projectAttributesDocument = await database.models.userExtension.aggregate(query)

				return resolve(projectAttributesDocument)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * create createUserExtension
	 * @method
	 * @name createUserExtension
	 * @param {Object} data - Attributes data.
	 * @returns {Object} .
	 */
	static createUserExtension(data) {
		return new Promise(async (resolve, reject) => {
			try {
				let projectAttributesDocument = await database.models.userExtension.create(data)
				return resolve(projectAttributesDocument)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * find and update.
	 * @method
	 * @name findAndUpdate
	 * @param {Array} [filterData = "all"] -  filter query.
	 * @param {Array} [setData = {}] - set fields.
	 * @param {Array} [returnData = true/false] - returnData
	 * @returns {Array} userExtension details.
	 */

	static findAndUpdate(filterData = 'all', setData, returnData = { new: false, rawResult: false }) {
		return new Promise(async (resolve, reject) => {
			try {
				let queryObject = filterData != 'all' ? filterData : {}

				let updatedData = await database.models.userExtension
					.findOneAndUpdate(queryObject, setData, returnData)
					.lean()

				return resolve(updatedData)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * find a user extension document.
	 * @method
	 * @name findOneForm
	 * @param {Object} [filterData = "all"] - user extension filter query.
	 * @param {Array} [fieldsArray = "all"] - projected fields.
	 * @param {Array} [skipFields = "none"] - field not to include.
	 * @returns {Object} form details.
	 */
	static findOne(filterData = 'all', fieldsArray = 'all', skipFields = 'none') {
		return new Promise(async (resolve, reject) => {
			try {
				let queryObject = filterData != 'all' ? filterData : {}

				let projection = {}
				if (fieldsArray != 'all') {
					fieldsArray.map((key) => {
						projection[key] = 1
					})
				}
				if (skipFields != 'none') {
					skipFields.map((key) => {
						projection[key] = 0
					})
				}
				const userExtensionData = await database.models.userExtension.findOne(queryObject, projection)
				return resolve(userExtensionData)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Delete userExtension documents based on the provided MongoDB filter.
	 *
	 * @param {Object} filter - MongoDB query filter to match documents for deletion.
	 * @returns {Promise<Object>} - MongoDB deleteMany result containing deleted count.
	 */
	static delete(filter) {
		return new Promise(async (resolve, reject) => {
			try {
				let deleteDocuments = await database.models.userExtension.deleteMany(filter)

				return resolve(deleteDocuments)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Remove entries from `programRoleMapping` array where programId matches the given ID,
	 * across all userExtension documents.
	 *
	 * @param {String} programId - The programId to be removed from programRoleMapping array.
	 * @returns {Promise<Object>} - MongoDB update result object.
	 */
	static pullProgramIdFromProgramRoleMapping(programId, tenantId) {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await database.models.userExtension.updateMany(
					{
						programRoleMapping: {
							$elemMatch: {
								programId: programId,
							},
						},
						tenantId: tenantId,
					},
					{ $pull: { programRoleMapping: { programId: programId } } }
				)

				return resolve(result)
			} catch (error) {
				return reject(error)
			}
		})
	}
}

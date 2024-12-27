// Dependencies

/**
 * ProjectAttributes
 * @class
 */

module.exports = class ProjectAttributes {
	/**
	 * projectAttributesDocument details.
	 * @method
	 * @name projectAttributesDocument
	 * @param {Array} [filterData = "all"] - projectAttributes filter query.
	 * @param {Array} [fieldsArray = "all"] - projected fields.
	 * @param {Array} [skipFields = "none"] - field not to include
	 * @returns {Array} projectAttributes details.
	 */

	static projectAttributesDocument(filterData = 'all', fieldsArray = 'all', skipFields = 'none') {
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
				let projectAttributesDocument = await database.models.projectAttributes
					.find(queryObject, projection)
					.lean()

				return resolve(projectAttributesDocument)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * find projectAttributes
	 * @method
	 * @name getAggregate
	 * @param {Array} query - aggregation query.
	 * @returns {Array} List of projectAttributes.
	 */

	static getAggregate(query = []) {
		return new Promise(async (resolve, reject) => {
			try {
				let projectAttributesDocument = await database.models.projectAttributes.aggregate(query)

				return resolve(projectAttributesDocument)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * create createProjectAttributes
	 * @method
	 * @name createProjectAttributes
	 * @param {Object} data - Attributes data.
	 * @returns {Object} solution object.
	 */
	static createProjectAttributes(data) {
		return new Promise(async (resolve, reject) => {
			try {
				let projectAttributesDocument = await database.models.projectAttributes.create(data)
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
	 * @param {Array} [filterData = "all"] - programs filter query.
	 * @param {Array} [setData = {}] - set fields.
	 * @param {Array} [returnData = true/false] - returnData
	 * @returns {Array} program details.
	 */

	static findAndUpdate(filterData = 'all', setData, returnData = { new: false }) {
		return new Promise(async (resolve, reject) => {
			try {
				let queryObject = filterData != 'all' ? filterData : {}

				let updatedData = await database.models.projectAttributes
					.findOneAndUpdate(queryObject, setData, returnData)
					.lean()

				return resolve(updatedData)
			} catch (error) {
				return reject(error)
			}
		})
	}
}

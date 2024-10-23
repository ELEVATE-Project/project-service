/**
 * name : programs.js
 * author : Vishnu
 * created-date : 09-Mar-2022
 * Description : program helper for DB interactions.
 */

// Dependencies

/**
 * Programs
 * @class
 */

module.exports = class Programs {
	/**
	 * programs details.
	 * @method
	 * @name programsDocument
	 * @param {Array} [filterData = "all"] - programs filter query.
	 * @param {Array} [fieldsArray = "all"] - projected fields.
	 * @param {Array} [skipFields = "none"] - field not to include
	 * @returns {Array} program details.
	 */

	static programsDocument(filterData = 'all', fieldsArray = 'all', skipFields = 'none', sort = {}) {
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
				let programsDoc = await database.models.programs
					.find(queryObject, projection)
					.sort(sort) // Use the `sort` parameter for sorting
					.lean()
				return resolve(programsDoc)
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

				let updatedData = await database.models.programs
					.findOneAndUpdate(queryObject, setData, returnData)
					.lean()

				return resolve(updatedData)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * aggregate function.
	 * @method
	 * @name getAggregate
	 * @param {Array} [matchQuery = []] - matchQuerry array
	 * @returns {Array} program details.
	 */

	static getAggregate(matchQuery) {
		return new Promise(async (resolve, reject) => {
			try {
				let aggregatedData = await database.models.programs.aggregate(matchQuery)
				return resolve(aggregatedData)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * listIndexes function.
	 * @method
	 * @name listIndexes
	 * @returns {Array} list of indexes.
	 */

	static listIndexes() {
		return new Promise(async (resolve, reject) => {
			try {
				let indexData = await database.models.programs.listIndexes()

				return resolve(indexData)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * create function.
	 * @method
	 * @name createProgram
	 * @returns {Object} created program.
	 */

	static createProgram(programData) {
		return new Promise(async (resolve, reject) => {
			try {
				let program = await database.models.programs.create(programData)

				return resolve(program)
			} catch (error) {
				return reject(error)
			}
		})
	}
}

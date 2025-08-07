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
	 * @param {Object} [sort = {}] - object to sort in descending/ascending order
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

	/**
	 * Delete programs documents based on the provided MongoDB filter.
	 *
	 * @param {Object} filter - MongoDB query filter to match documents for deletion.
	 * @returns {Promise<Object>} - MongoDB deleteMany result containing deleted count.
	 */
	static delete(filter) {
		return new Promise(async (resolve, reject) => {
			try {
				let deleteDocuments = await database.models.programs.deleteMany(filter)

				return resolve(deleteDocuments)
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.bad_request.status,
					message: error.message || HTTP_STATUS_CODE.bad_request.message,
					errorObject: error,
				})
			}
		})
	}

	/**
	 * Removes a specific solution ID from the `components` array in all program documents where it's found.
	 * This is typically used when a solution is being deleted and should no longer be referenced in programs.
	 *
	 * @param {ObjectId} solutionId - The ID of the solution to be removed from program components.
	 * @returns {Promise<Object>} - MongoDB update result containing number of modified documents.
	 */
	static pullSolutionsFromComponents(solutionId, tenantId) {
		return new Promise(async (resolve, reject) => {
			try {
				// Build the update operation: $pull removes matching solutionId from the components array
				const updateQuery = {
					$pull: {
						components: { _id: solutionId },
					},
				}

				// Filter: Find programs that contain components._id = solutionId
				const filterQuery = {
					'components._id': solutionId,
					tenantId: tenantId,
				}

				// Run updateMany to apply this change to all program docs
				const result = await database.models.programs.updateMany(filterQuery, updateQuery)
				return resolve(result)
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.bad_request.status,
					message: error.message || HTTP_STATUS_CODE.bad_request.message,
					errorObject: error,
				})
			}
		})
	}
}

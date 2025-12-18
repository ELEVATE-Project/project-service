/**
 * name : programUsers.js
 * author : Ankit Shahu
 * created-date : 07-04-2023
 * Description : program users helper for DB interactions.
 */

module.exports = class ProgramUsers {
	/**
	 * Get program users documents.
	 * @method
	 * @name programUsersDocument
	 * @param {Object} [filterData = "all"] - program users filter query.
	 * @param {Array} [fieldsArray = "all"] - projected fields.
	 * @param {Array} [skipFields = "none"] - fields not to include.
	 * @returns {Array} program users details.
	 */
	static programUsersDocument(filterData = 'all', fieldsArray = 'all', skipFields = 'none') {
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

				let programJoinedData = await database.models.programUsers.find(queryObject, projection).lean()
				return resolve(programJoinedData)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Create a new program user document.
	 * @method
	 * @name create
	 * @param {Object} data - program user data to create.
	 * @returns {Object} newly created program user document.
	 */
	static create(data) {
		return new Promise(async (resolve, reject) => {
			try {
				let programUserDocument = await database.models.programUsers.create(data)
				return resolve(programUserDocument)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Find a single program user document.
	 * @method
	 * @name findOne
	 * @param {Object} [filterData = "all"] - program users filter query.
	 * @param {Array} [fieldsArray = "all"] - projected fields.
	 * @param {Array} [skipFields = "none"] - fields not to include.
	 * @returns {Object} program user details.
	 */
	static findOne(filterData = 'all', fieldsArray = 'all', skipFields = 'none') {
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

				let programUserData = await database.models.programUsers.findOne(queryObject, projection).lean()
				return resolve(programUserData)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Update a single program user document.
	 * @method
	 * @name findOneAndUpdate
	 * @param {Object} filterData - filter query.
	 * @param {Object} updateData - data to update.
	 * @param {Object} [options = { new: true }] - options for the update.
	 * @returns {Object} updated program user document.
	 */
	static findOneAndUpdate(filterData, updateData, options = { new: true }) {
		return new Promise(async (resolve, reject) => {
			try {
				let updatedDocument = await database.models.programUsers
					.findOneAndUpdate(filterData, updateData, options)
					.lean()
				return resolve(updatedDocument)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Update multiple program user documents.
	 * @method
	 * @name updateMany
	 * @param {Object} filterData - filter query.
	 * @param {Object} updateData - data to update.
	 * @returns {Object} update result.
	 */
	static updateMany(filterData, updateData) {
		return new Promise(async (resolve, reject) => {
			try {
				let updateResult = await database.models.programUsers.updateMany(filterData, updateData)
				return resolve(updateResult)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Delete a single program user document.
	 * @method
	 * @name deleteOne
	 * @param {Object} filterData - filter query.
	 * @returns {Object} deletion result.
	 */
	static deleteOne(filterData) {
		return new Promise(async (resolve, reject) => {
			try {
				let deleteResult = await database.models.programUsers.deleteOne(filterData)
				return resolve(deleteResult)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Delete multiple program user documents.
	 * @method
	 * @name deleteMany
	 * @param {Object} filterData - filter query.
	 * @returns {Object} deletion result.
	 */
	static deleteMany(filterData) {
		return new Promise(async (resolve, reject) => {
			try {
				let deleteResult = await database.models.programUsers.deleteMany(filterData)
				return resolve(deleteResult)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Count program user documents.
	 * @method
	 * @name count
	 * @param {Object} [filterData = {}] - filter query.
	 * @returns {Number} count of documents.
	 */
	static count(filterData = {}) {
		return new Promise(async (resolve, reject) => {
			try {
				let count = await database.models.programUsers.countDocuments(filterData)
				return resolve(count)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Get program users with pagination.
	 * @method
	 * @name list
	 * @param {Object} [filterData = {}] - filter query.
	 * @param {Array} [fieldsArray = "all"] - projected fields.
	 * @param {Array} [skipFields = "none"] - fields not to include.
	 * @param {Number} [page = 1] - page number.
	 * @param {Number} [limit = 10] - records per page.
	 * @param {Object} [sortData = { createdAt: -1 }] - sort criteria.
	 * @returns {Object} paginated program users data with count.
	 */
	static list(
		filterData = {},
		fieldsArray = 'all',
		skipFields = 'none',
		page = 1,
		limit = 10,
		sortData = { createdAt: -1 }
	) {
		return new Promise(async (resolve, reject) => {
			try {
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

				const skip = (page - 1) * limit

				const [data, totalCount] = await Promise.all([
					database.models.programUsers
						.find(filterData, projection)
						.sort(sortData)
						.skip(skip)
						.limit(limit)
						.lean(),
					database.models.programUsers.countDocuments(filterData),
				])

				return resolve({
					data,
					totalCount,
					page,
					limit,
					totalPages: Math.ceil(totalCount / limit),
				})
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Get paginated program users using offset-based pagination.
	 * @method
	 * @name listWithOffset
	 * @param {Object} [filterData = {}] - filter query.
	 * @param {Array} [fieldsArray = "all"] - projected fields.
	 * @param {Array} [skipFields = "none"] - fields not to include.
	 * @param {Number} [offset = 0] - number of documents to skip.
	 * @param {Number} [limit = 10] - number of documents to return.
	 * @param {Object} [sortData = { createdAt: -1 }] - sort criteria.
	 * @returns {Object} paginated program users data with count.
	 */
	static listWithOffset(
		filterData = {},
		fieldsArray = 'all',
		skipFields = 'none',
		offset = 0,
		limit = 10,
		sortData = { createdAt: -1 }
	) {
		return new Promise(async (resolve, reject) => {
			try {
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

				const [data, totalCount] = await Promise.all([
					database.models.programUsers
						.find(filterData, projection)
						.sort(sortData)
						.skip(offset)
						.limit(limit)
						.lean(),
					database.models.programUsers.countDocuments(filterData),
				])

				// Calculate page info for response
				const page = Math.floor(offset / limit) + 1
				const totalPages = Math.ceil(totalCount / limit)

				return resolve({
					data,
					totalCount,
					page,
					limit,
					offset,
					totalPages,
				})
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Aggregate program users.
	 * @method
	 * @name aggregate
	 * @param {Array} pipeline - aggregation pipeline.
	 * @returns {Array} aggregation result.
	 */
	static aggregate(pipeline) {
		return new Promise(async (resolve, reject) => {
			try {
				let result = await database.models.programUsers.aggregate(pipeline)
				return resolve(result)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Bulk write operations for program users.
	 * @method
	 * @name bulkWrite
	 * @param {Array} operations - array of bulk write operations.
	 * @param {Object} [options = {}] - bulk write options.
	 * @returns {Object} bulk write result.
	 */
	static bulkWrite(operations, options = {}) {
		return new Promise(async (resolve, reject) => {
			try {
				let result = await database.models.programUsers.bulkWrite(operations, options)
				return resolve(result)
			} catch (error) {
				return reject(error)
			}
		})
	}
}

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
	static async programUsersDocument(filterData = 'all', fieldsArray = 'all', skipFields = 'none') {
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
			return programJoinedData
		} catch (error) {
			throw error
		}
	}

	/**
	 * Create a new program user document.
	 * @method
	 * @name create
	 * @param {Object} data - program user data to create.
	 * @returns {Object} newly created program user document.
	 */
	static async create(data) {
		try {
			let programUserDocument = await database.models.programUsers.create(data)
			return programUserDocument
		} catch (error) {
			throw error
		}
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
	static async findOne(filterData = 'all', fieldsArray = 'all', skipFields = 'none') {
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
			return programUserData
		} catch (error) {
			throw error
		}
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
	static async findOneAndUpdate(filterData, updateData, options = { new: true }) {
		try {
			let updatedDocument = await database.models.programUsers
				.findOneAndUpdate(filterData, updateData, options)
				.lean()
			return updatedDocument
		} catch (error) {
			throw error
		}
	}

	/**
	 * Update multiple program user documents.
	 * @method
	 * @name updateMany
	 * @param {Object} filterData - filter query.
	 * @param {Object} updateData - data to update.
	 * @returns {Object} update result.
	 */
	static async updateMany(filterData, updateData) {
		try {
			let updateResult = await database.models.programUsers.updateMany(filterData, updateData)
			return updateResult
		} catch (error) {
			throw error
		}
	}

	/**
	 * Delete a single program user document.
	 * @method
	 * @name deleteOne
	 * @param {Object} filterData - filter query.
	 * @returns {Object} deletion result.
	 */
	static async deleteOne(filterData) {
		try {
			let deleteResult = await database.models.programUsers.deleteOne(filterData)
			return deleteResult
		} catch (error) {
			throw error
		}
	}

	/**
	 * Delete multiple program user documents.
	 * @method
	 * @name deleteMany
	 * @param {Object} filterData - filter query.
	 * @returns {Object} deletion result.
	 */
	static async deleteMany(filterData) {
		try {
			let deleteResult = await database.models.programUsers.deleteMany(filterData)
			return deleteResult
		} catch (error) {
			throw error
		}
	}

	/**
	 * Count program user documents.
	 * @method
	 * @name count
	 * @param {Object} [filterData = {}] - filter query.
	 * @returns {Number} count of documents.
	 */
	static async count(filterData = {}) {
		try {
			let count = await database.models.programUsers.countDocuments(filterData)
			return count
		} catch (error) {
			throw error
		}
	}

	/**
	 * Get program users with pagination.
	 * @method
	 * @name list
	 * @param {Object} [filterData = {}] - filter query.
	 * @param {Array} [fieldsArray = "all"] - projected fields.
	 * @param {Array} [skipFields = "none"] - fields not to include.
	 * @param {Number} [page = 1] - page number.
	 * @param {Number} [limit = 20] - records per page.
	 * @param {Object} [sortData = { createdAt: -1 }] - sort criteria.
	 * @returns {Object} paginated program users data with count.
	 */
	static async list(
		filterData = {},
		fieldsArray = 'all',
		skipFields = 'none',
		page = 1,
		limit = 20,
		sortData = { createdAt: -1 }
	) {
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
				database.models.programUsers.find(filterData, projection).sort(sortData).skip(skip).limit(limit).lean(),
				database.models.programUsers.countDocuments(filterData),
			])

			return {
				data,
				totalCount,
				page,
				limit,
				totalPages: Math.ceil(totalCount / limit),
			}
		} catch (error) {
			throw error
		}
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
	static async listWithOffset(
		filterData = {},
		fieldsArray = 'all',
		skipFields = 'none',
		offset = 0,
		limit = 10,
		sortData = { createdAt: -1 }
	) {
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

			return {
				data,
				totalCount,
				page,
				limit,
				offset,
				totalPages,
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * Aggregate program users.
	 * @method
	 * @name aggregate
	 * @param {Array} pipeline - aggregation pipeline.
	 * @returns {Array} aggregation result.
	 */
	static async aggregate(pipeline) {
		try {
			let result = await database.models.programUsers.aggregate(pipeline)
			return result
		} catch (error) {
			throw error
		}
	}

	/**
	 * Bulk write operations for program users.
	 * @method
	 * @name bulkWrite
	 * @param {Array} operations - array of bulk write operations.
	 * @param {Object} [options = {}] - bulk write options.
	 * @returns {Object} bulk write result.
	 */
	static async bulkWrite(operations, options = {}) {
		try {
			let result = await database.models.programUsers.bulkWrite(operations, options)
			return result
		} catch (error) {
			throw error
		}
	}
}

/**
 * name : admin.js
 * author : prajwal
 * created-date : 23-Apr-2024
 * Description : Admin related db queries
 */

// Dependencies
/**
 * Admin
 * @class
 */

module.exports = class Admin {
	/**
	 * list index.
	 * @method
	 * @name listIndices
	 * @param {String} [collectionName] - collection name.
	 * @returns {cursorObject} program details.
	 */

	// static listIndices(collectionName) {
	// 	return new Promise(async (resolve, reject) => {
	// 		try {
	// 			let presentIndices = await database.models[collectionName].listIndexes()
	// 			return resolve(presentIndices)
	// 		} catch (error) {
	// 			return reject(error)
	// 		}
	// 	})
	// }

	static listIndices(collectionName) {
		return new Promise(async (resolve, reject) => {
			try {
				let presentIndices = await database.models[collectionName].db.collection(collectionName).listIndexes()
				return resolve(presentIndices)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * create index
	 * @method
	 * @name createIndex
	 * @param {String} [collectionName] - collection name.
	 * @param {String} [key] - key to be indexed
	 * @returns {Object} success/failure object
	 */

	static createIndex(collectionName, key) {
		return new Promise(async (resolve, reject) => {
			try {
				let createdIndex = await database.models[collectionName].db
					.collection(collectionName)
					.createIndex({ [key]: 1 })
				return resolve(createdIndex)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * List of data based on collection.
	 * @method
	 * @name list
	 * @param {Object} filterQueryObject - filter query data.
	 * @param {Object} [projection = {}] - projected data.
	 * @returns {Promise} returns a promise.
	 */

	static list(
		collection,
		query = 'all',
		fields = 'all',
		skipFields = 'none',
		limitingValue = 100,
		skippingValue = 0,
		sortedData = ''
	) {
		return new Promise(async (resolve, reject) => {
			try {
				let queryObject = {}

				if (query != 'all') {
					queryObject = query
				}

				let projectionObject = {}

				if (fields != 'all') {
					fields.forEach((element) => {
						projectionObject[element] = 1
					})
				}

				if (skipFields != 'none') {
					skipFields.forEach((element) => {
						projectionObject[element] = 0
					})
				}

				let mongoDBDocuments
				if (sortedData !== '') {
					mongoDBDocuments = await database.models[collection].db
						.collection(collection)
						.find(queryObject)
						.project(projectionObject)
						.sort(sortedData)
						.limit(limitingValue)
						.toArray()
				} else {
					mongoDBDocuments = await database.models[collection].db
						.collection(collection)
						.find(queryObject)
						.project(projectionObject)
						.skip(skippingValue)
						.limit(limitingValue)
						.toArray()
				}
				// finding document count from db. We can't get it from result array length because a limiting value is passed
				let docCount = await await database.models[collection].db
					.collection(collection)
					.find(queryObject)
					.count()

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.DATA_FETCHED_SUCCESSFULLY,
					data: mongoDBDocuments,
					count: docCount,
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					data: false,
				})
			}
		})
	}
}

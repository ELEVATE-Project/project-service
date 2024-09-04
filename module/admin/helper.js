/**
 * name : helper.js
 * author : Prajwal
 * created-date : 15-Apr-2024
 * Description : Admin.
 */

// Dependencies
/**
 * ProgramsHelper
 * @class
 */
const adminQueries = require(DB_QUERY_BASE_PATH + '/admin')
const configurationQueries = require(DB_QUERY_BASE_PATH + '/configurations')
module.exports = class AdminHelper {
	/**
	 * create index in the model.
	 * @method
	 * @name createIndex
	 * @param {String} collection - collectionName.
	 * @param {Array} keys - keys data.
	 * @returns {JSON} - success/failure message.
	 */
	static createIndex(collection, keys) {
		return new Promise(async (resolve, reject) => {
			try {
				let presentIndex = await adminQueries.listIndices(collection)
				let indexes = presentIndex.map((indexedKeys) => {
					return Object.keys(indexedKeys.key)[0]
				})
				let indexNotPresent = _.differenceWith(keys, indexes)
				if (indexNotPresent.length > 0) {
					indexNotPresent.forEach(async (key) => {
						await adminQueries.createIndex(collection, key)
					})
					//If indexing is happening in solutions collection update the configuration table
					if (collection === CONSTANTS.common.SOLUTION_MODEL_NAME) {
						// Filter keys that start with "scope." and extract the part after "scope."
						const scopeKeys = keys
							.filter((key) => key.startsWith('scope.')) // Filter out keys that start with "scope."
							.map((key) => key.split('scope.')[1]) // Extract the part after "scope."
						if (scopeKeys.length > 0) {
							await configurationQueries.createOrUpdate('keysAllowedForTargeting', scopeKeys)
						}
					}
					return resolve({
						message: CONSTANTS.apiResponses.KEYS_INDEXED_SUCCESSFULL,
						success: true,
					})
				} else {
					return resolve({
						message: CONSTANTS.apiResponses.KEYS_ALREADY_INDEXED_SUCCESSFULL,
						success: true,
					})
				}
			} catch (error) {
				return resolve({
					status: error.status ? error.status : HTTP_STATUS_CODE.internal_server_error.status,
					success: false,
					message: error.message,
					data: {},
				})
			}
		})
	}

	/**
	 * List of data based on collection
	 * @method
	 * @name dbFind
	 * @param {Object} reqBody - request body
	 * @returns {Object}  - collection details.
	 */

	static dbFind(collection, reqBody) {
		return new Promise(async (resolve, reject) => {
			try {
				if (reqBody.mongoIdKeys) {
					reqBody.query = await this.convertStringToObjectIdInQuery(reqBody.query, reqBody.mongoIdKeys)
				}

				let mongoDBDocuments = await adminQueries.list(
					collection,
					reqBody.query,
					reqBody.projection ? reqBody.projection : [],
					'none',
					reqBody.limit ? reqBody.limit : 100,
					reqBody.skip ? reqBody.skip : 0
				)
				return resolve({
					message: CONSTANTS.apiResponses.DATA_FETCHED_SUCCESSFULLY,
					success: true,
					result: mongoDBDocuments.data ? mongoDBDocuments.data : [],
					count: mongoDBDocuments.count ? mongoDBDocuments.count : 0,
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

	/**
	 * Convert String to ObjectIds inside Query.
	 * @method
	 * @name convertStringToObjectIdInQuery
	 * @returns {Array} Query.
	 */

	static convertStringToObjectIdInQuery(query, mongoIdKeys) {
		for (let pointerToArray = 0; pointerToArray < mongoIdKeys.length; pointerToArray++) {
			let eachKey = mongoIdKeys[pointerToArray]
			let currentQuery = query[eachKey]

			if (typeof currentQuery === 'string') {
				query[eachKey] = UTILS.convertStringToObjectId(currentQuery)
			} else if (typeof currentQuery === 'object') {
				let nestedKey = Object.keys(query[eachKey])
				if (nestedKey) {
					nestedKey = nestedKey[0]
					query[eachKey][nestedKey] = UTILS.arrayIdsTobjectIds(currentQuery[nestedKey])
				}
			}
		}

		return query
	}
}

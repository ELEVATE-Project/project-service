/**
 * name : userCourses.js
 * author : Praveen Dass
 * Date : 22-July-2025
 * Description:
 * This file contains userCourses dbRelated helper functions
 *  @class
 */

module.exports = class userCourses {
	/**
	 * find survey submissions
	 * @method
	 * @name userCoursesDocuments
	 * @param {Array} [userCoursesFilter = "all"] - survey submission ids.
	 * @param {Array} [fieldsArray = "all"] - projected fields.
	 * @param {Array} [sortedData = "all"] - sorted field.
	 * @param {Array} [skipFields = "none"] - field not to include
	 * @returns {Array} List of survey submissions.
	 */

	static userCoursesDocuments(
		userCoursesFilter = 'all',
		fieldsArray = 'all',
		sortedData = 'all',
		skipFields = 'none'
	) {
		return new Promise(async (resolve, reject) => {
			try {
				let queryObject = userCoursesFilter != 'all' ? userCoursesFilter : {}

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

				let userCoursesDocuments

				if (sortedData !== 'all') {
					userCoursesDocuments = await database.models.userCourses
						.find(queryObject, projection)
						.sort(sortedData)
						.lean()
				} else {
					userCoursesDocuments = await database.models.userCourses.find(queryObject, projection).lean()
				}

				return resolve(userCoursesDocuments)
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
	 * Update userCourses
	 * @method
	 * @name updateMany
	 * @param {Object} query
	 * @param {Object} update
	 * @param {Object} options
	 * @returns {JSON} - update response
	 */

	static updateMany(query, update) {
		return new Promise(async (resolve, reject) => {
			try {
				let userCoursesDocuments = await database.models.userCourses.updateMany(query, update)
				return resolve(userCoursesDocuments)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Update userCourses
	 * @method
	 * @name userCoursesUpdateDocuments
	 * @param {Object} query
	 * @param {Object} updateObject
	 * @param {Object} returnData
	 * @returns {JSON} - update response
	 */

	static userCoursesUpdateDocuments(query, updateObject, returnData = { new: false }) {
		return new Promise(async (resolve, reject) => {
			try {
				let userCoursesDocuments = await database.models.userCourses
					.findOneAndUpdate(query, updateObject, returnData)
					.lean()
				return resolve(userCoursesDocuments)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * create userCourses
	 * @method
	 * @name createUserCourses
	 * @param {Object} courseData - solution data.
	 * @returns {Object} solution object.
	 */
	static createUserCourses(courseData) {
		return new Promise(async (resolve, reject) => {
			try {
				let userCoursesDocument = await database.models.userCourses.create(courseData)
				return resolve(userCoursesDocument)
			} catch (error) {
				return reject(error)
			}
		})
	}
}

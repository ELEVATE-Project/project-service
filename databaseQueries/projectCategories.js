/**
 * name : projectCategories.js
 * author : Priyanka
 * created-date : 01-Sep-2021
 * Description : Project categories helper for DB interactions.
 */

// Dependencies

/**
 * ProjectCategories
 * @class
 */

module.exports = class ProjectCategories {
	/**
	 * Library project categories documents.
	 * @method
	 * @name categoryDocuments
	 * @param {Object} [findQuery = "all"] - filtered data.
	 * @param {Array} [fields = "all"] - projected data.
	 * @param {Array} [skipFields = "none"] - fields to skip.
	 * @returns {Array} - Library project categories data.
	 */

	static categoryDocuments(findQuery = 'all', fields = 'all', skipFields = 'none') {
		return new Promise(async (resolve, reject) => {
			try {
				let queryObject = {}

				if (findQuery != 'all') {
					queryObject = findQuery
				}

				let projection = {}

				if (fields != 'all') {
					fields.forEach((element) => {
						projection[element] = 1
					})
				}

				if (skipFields != 'none') {
					skipFields.forEach((element) => {
						projection[element] = 0
					})
				}

				let projectCategoriesData = await database.models.projectCategories.find(queryObject, projection).lean()

				return resolve(projectCategoriesData)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * update Many project categories documents.
	 * @method
	 * @name updateMany
	 * @param {Object} [filterQuery] - filtered Query.
	 * @param {Object} [updateData] - update data.
	 * @returns {Array} - Library project categories data.
	 */

	static updateMany(filterQuery, updateData) {
		return new Promise(async (resolve, reject) => {
			try {
				let updatedCategories = await database.models.projectCategories.updateMany(filterQuery, updateData)

				return resolve(updatedCategories)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * create project categories documents.
	 * @method
	 * @name create
	 * @param {Object} [filterQuery] - filtered Query.
	 * @returns {Object} - Library project categories data.
	 */

	static create(filterQuery) {
		return new Promise(async (resolve, reject) => {
			try {
				let createdProjectCategory = await database.models.projectCategories.create(filterQuery)

				return resolve(createdProjectCategory)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * create project categories documents.
	 * @method
	 * @name insertMany
	 * @returns {Object} - Library project categories data.
	 */
	static insertMany(dataArray) {
		return new Promise(async (resolve, reject) => {
			try {
				// Insert multiple documents into the collection
				let insertedDocuments = await database.models.projectCategories.insertMany(dataArray)
				return resolve(insertedDocuments)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Update single category document.
	 * @method
	 * @name updateOne
	 * @param {Object} filterQuery - filtered Query.
	 * @param {Object} updateData - update data.
	 * @returns {Object} - Updated category data.
	 */
	static updateOne(filterQuery, updateData) {
		return new Promise(async (resolve, reject) => {
			try {
				let updatedCategory = await database.models.projectCategories.updateOne(filterQuery, updateData)
				return resolve(updatedCategory)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Find single category document.
	 * @method
	 * @name findOne
	 * @param {Object} filterQuery - filtered Query.
	 * @param {Object} projection - fields to project.
	 * @returns {Object} - Category data.
	 */
	static findOne(filterQuery, projection = {}) {
		return new Promise(async (resolve, reject) => {
			try {
				let category = await database.models.projectCategories.findOne(filterQuery, projection).lean()
				return resolve(category)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Get category hierarchy using aggregation.
	 * @method
	 * @name getHierarchy
	 * @param {Object} filterQuery - filtered Query.
	 * @param {Number} maxDepth - Maximum depth to fetch.
	 * @returns {Array} - Category hierarchy tree.
	 */
	static getHierarchy(filterQuery, maxDepth = null) {
		return new Promise(async (resolve, reject) => {
			try {
				let pipeline = [
					{ $match: filterQuery },
					{
						$graphLookup: {
							from: 'projectCategories',
							startWith: '$_id',
							connectFromField: '_id',
							connectToField: 'parent_id',
							as: 'children',
							maxDepth: maxDepth || 10,
							depthField: 'depth',
						},
					},
					{
						$addFields: {
							children: {
								$filter: {
									input: '$children',
									as: 'child',
									cond: { $eq: ['$$child.parent_id', '$_id'] },
								},
							},
						},
					},
				]

				let hierarchy = await database.models.projectCategories.aggregate(pipeline)
				return resolve(hierarchy)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Get all descendants of a category using path.
	 * @method
	 * @name getDescendants
	 * @param {String} categoryId - Category ID.
	 * @param {String} tenantId - Tenant ID.
	 * @returns {Array} - Descendant categories.
	 */
	static getDescendants(categoryId, tenantId) {
		return new Promise(async (resolve, reject) => {
			try {
				let category = await database.models.projectCategories.findOne({ _id: categoryId, tenantId }).lean()

				if (!category) {
					return resolve([])
				}

				// Use path to find all descendants
				let pathPattern = new RegExp(`^${category.path || categoryId}`)
				let descendants = await database.models.projectCategories
					.find({
						path: pathPattern,
						_id: { $ne: categoryId },
						tenantId,
						isDeleted: false,
					})
					.lean()

				return resolve(descendants)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Get leaf categories (categories with no children).
	 * @method
	 * @name getLeafCategories
	 * @param {Object} filterQuery - filtered Query.
	 * @returns {Array} - Leaf categories.
	 */
	static getLeafCategories(filterQuery) {
		return new Promise(async (resolve, reject) => {
			try {
				filterQuery.hasChildren = false
				let leafCategories = await database.models.projectCategories.find(filterQuery).lean()
				return resolve(leafCategories)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * List project categories with pagination.
	 * @method
	 * @name list
	 * @param {Object} query - Filter query.
	 * @param {Object} projection - Fields to select.
	 * @param {Object} sort - Sort options.
	 * @param {Number} skip - Skip count.
	 * @param {Number} limit - Limit count.
	 * @returns {Array} - List of project categories.
	 */
	static list(query, projection = {}, sort = {}, skip, limit) {
		return new Promise(async (resolve, reject) => {
			try {
				let projectCategoriesData = await database.models.projectCategories
					.find(query, projection)
					.sort(sort)
					.skip(skip)
					.limit(limit)
					.lean()

				let count = await database.models.projectCategories.countDocuments(query)

				return resolve({
					data: projectCategoriesData,
					count: count,
				})
			} catch (error) {
				return reject(error)
			}
		})
	}
}

/**
 * name : helper.js
 * author : Aman
 * created-date : 16-July-2020
 * Description : Project categories helper functionality.
 */

// Dependencies
// const coreService = require(GENERICS_FILES_PATH + "/services/core");
// const sessionHelpers = require(GENERIC_HELPERS_PATH+"/sessions");
const projectCategoriesQueries = require(DB_QUERY_BASE_PATH + '/projectCategories')
const projectTemplateQueries = require(DB_QUERY_BASE_PATH + '/projectTemplates')
const orgExtensionQueries = require(DB_QUERY_BASE_PATH + '/organizationExtension')
const filesHelpers = require(MODULES_BASE_PATH + '/cloud-services/files/helper')
const axios = require('axios')
// hierarchyConfig removed — use local defaults instead
const DEFAULT_PAGINATION_LIMIT = 20
const MAX_PAGINATION_LIMIT = 100
const { ObjectId } = require('mongodb')
const moment = require('moment-timezone')
const _ = require('lodash')
const entitiesService = require(GENERICS_FILES_PATH + '/services/entity-management')
const projectTemplateTaskQueries = require(DB_QUERY_BASE_PATH + '/projectTemplateTask')
const projectAttributesQueries = require(DB_QUERY_BASE_PATH + '/projectAttributes')
const kafkaProducersHelper = require(GENERICS_FILES_PATH + '/kafka/producers')

/**
 * LibraryCategoriesHelper
 * @class
 */
module.exports = class LibraryCategoriesHelper {
	/**
	 * List of library projects.
	 * @method
	 * @name projects
	 * @param categoryIds - category external id.
	 * @param pageSize - Size of page.
	 * @param pageNo - Recent page no.
	 * @param search - search text.
	 * @param sortedData - Data to be sorted.
	 * @param userDetails - user related info
	 * @param tenantId - tenant id info
	 * @param orgId - org id info
	 * @param language - pass language code for the translation
	 * @param hasSpotlight - true/false for filtering based on hasSpotlight key
	 * @param filter - Data to be filtered
	 * @returns {Object} List of library projects.
	 */

	static projects(
		categoryIds,
		pageSize,
		pageNo,
		search,
		sortedData,
		userDetails,
		language = 'en',
		hasSpotlight = false,
		filter = {}
	) {
		return new Promise(async (resolve, reject) => {
			try {
				const defaultLanguage = 'en'
				const userLanguage = language

				let matchQuery = {
					$match: {
						status: CONSTANTS.common.PUBLISHED,
						isReusable: true,
					},
				}

				// Fetch the organization extension document of the loggedin user
				let orgExtension = await orgExtensionQueries.orgExtenDocuments({
					tenantId: userDetails.userInformation.tenantId,
					orgId: userDetails.userInformation.organizationId,
				})

				if (!orgExtension || orgExtension.length === 0) {
					orgExtension = null
				} else {
					orgExtension = orgExtension[0]
				}

				matchQuery['$match']['tenantId'] = userDetails.userInformation.tenantId
				/**
				 * 
					Sample for matchQuery obj when orgExtension.externalProjectResourceVisibilityPolicy = CURRENT
					{
						"$match": {
							"status": "published",
							"isReusable": true,
							"tenantId": "shikshalokam",
							"orgId": "slorg"
						}
					}
				*/
				/**
				 * 
					Sample for matchQuery obj when orgExtension.externalProjectResourceVisibilityPolicy = ASSOCIATED
					{
						"$match": {
							"status": "published",
							"isReusable": true,
							"tenantId": "shikshalokam",
							"$and": [
								{
								"$or": [
									{
										"visibility": {
											"$ne": "CURRENT"
										},
										"visibleToOrganizations": {
											"$in": [
												"sot"
											]
										}
									},
									{
										"orgId": "sot"
									}
								]
								}
							]
						}
					}
				*/
				/**
				 * 
					Sample for matchQuery obj when orgExtension.externalProjectResourceVisibilityPolicy = ALL
					{
						"$match": {
						"status": "published",
						"isReusable": true,
						"tenantId": "shikshalokam",
						"$and": [
							{
							"$or": [
								{
									"visibility": "ALL"
								},
								{
									"visibility": {
										"$ne": "CURRENT"
									},
									"visibleToOrganizations": {
										"$in": [
											"mys"
										]
									}
								},
								{
									"orgId": "mys"
								}
							]
							}
						]
						}
					}
				*/
				matchQuery = applyVisibilityConditions(matchQuery, orgExtension, userDetails)

				if (categoryIds) {
					// Ensure categoryIds is an array (handles both single string or array)
					const idsToFilter = Array.isArray(categoryIds) ? categoryIds : [categoryIds]

					if (idsToFilter.length > 0) {
						// Use $in to support multiple IDs
						matchQuery['$match']['categories.externalId'] = { $in: idsToFilter }
					}
				}

				let aggregateData = []
				aggregateData.push(matchQuery)

				if (hasSpotlight) {
					matchQuery['$match']['hasSpotlight'] = true
				}

				if (Object.keys(filter).length >= 1) {
					let duration = filter.duration || ''
					let roles = filter.roles || ''

					// Split duration only if it has a value
					if (duration) {
						const durationArray = duration.split(',')
						let defaultDurationAttributes

						// Fetch the project attributes document for the duration
						const projectAttributesDocument = await projectAttributesQueries.projectAttributesDocument({
							code: 'duration',
							deleted: false,
						})

						if (projectAttributesDocument && projectAttributesDocument.length > 0) {
							defaultDurationAttributes = projectAttributesDocument[0]
						} else {
							defaultDurationAttributes = CONSTANTS.common.DEFAULT_ATTRIBUTES.find(
								(attr) => attr.code === 'duration'
							)
						}

						const entities = defaultDurationAttributes?.entities || []

						const matchingDurations = entities
							.map((entity) => entity.value)
							.filter((value) => durationArray.includes(value))

						let upperBoundDurationFilter = []
						let exactDurationFilters = []
						// Separate values that start with "More than" into `upperBoundDurationFilter`, others into `exactDurationFilters`
						matchingDurations.forEach((value) => {
							if (value.startsWith('More than')) {
								upperBoundDurationFilter.push(value.replace('More than ', '').trim())
							} else {
								exactDurationFilters.push(value)
							}
						})

						let minDays = Infinity
						let exactDurationFiltersInDays = []
						if (upperBoundDurationFilter.length > 0) {
							// Initialize with a large number

							// Convert to days and find the lowest duration
							if (upperBoundDurationFilter.length > 0) {
								upperBoundDurationFilter.forEach((item) => {
									const days = UTILS.convertDurationToDays(item) // Convert duration to days
									minDays = Math.min(minDays, days) // Keep track of the minimum days
								})
							}
						}

						// Convert exact duration filters to days
						if (exactDurationFilters.length > 0) {
							exactDurationFiltersInDays = exactDurationFilters.map((item) =>
								UTILS.convertDurationToDays(item)
							)
						}

						// construct the match query for filters
						if (minDays !== Infinity && exactDurationFiltersInDays.length > 0) {
							matchQuery['$match']['$and'] = [
								...(matchQuery['$match']['$and'] || []),
								{ durationInDays: { $gt: minDays } }, // Use $gt for greater than
								{ durationInDays: { $in: exactDurationFiltersInDays } }, // For exact durations
							]
						} else if (minDays !== Infinity) {
							matchQuery['$match']['durationInDays'] = { $gt: minDays } // Use $gt for greater than
						} else if (exactDurationFiltersInDays.length > 0) {
							matchQuery['$match']['durationInDays'] = { $in: exactDurationFiltersInDays } // Handle $in independently
						}
					}

					// Split roles only if it has a value
					if (roles) {
						roles = roles.split(',')
						if (roles.length > 0) {
							//Getting roles from the entity service
							let userRoleInformation = await entitiesService.getUserRoleExtensionDocuments(
								{
									code: { $in: roles },
									tenantId: userDetails.userInformation.tenantId,
									orgId: { $in: [userDetails.userInformation.organizationId] },
								},
								['title']
							)
							if (!userRoleInformation.success) {
								throw {
									message: CONSTANTS.apiResponses.FAILED_TO_FETCH_USERROLE,
									status: HTTP_STATUS_CODE.bad_request.status,
								}
							}
							// Extract titles
							let userRoles = await userRoleInformation.data.map((eachRole) => eachRole.title)
							matchQuery['$match']['recommendedFor'] = { $in: userRoles }
						}
					}
				}

				const searchConditions = []
				if (search !== '') {
					if (userLanguage === defaultLanguage) {
						searchConditions.push(
							{ title: new RegExp(search, 'i') },
							{ description: new RegExp(search, 'i') },
							{ categories: new RegExp(search, 'i') }
						)
					} else {
						searchConditions.push(
							{ [`translations.${userLanguage}.title`]: new RegExp(search, 'i') },
							{ [`translations.${userLanguage}.description`]: new RegExp(search, 'i') },
							{ title: new RegExp(search, 'i') },
							{ description: new RegExp(search, 'i') },
							{ categories: new RegExp(search, 'i') }
						)
					}

					// Add into $and instead of overwriting
					matchQuery.$match.$and = [...(matchQuery.$match.$and || []), { $or: searchConditions }]
				}

				let sortedQuery = {
					$sort: {
						createdAt: -1,
					},
				}
				if (sortedData && sortedData === CONSTANTS.common.IMPORTANT_PROJECT) {
					sortedQuery['$sort'] = {}
					sortedQuery['$sort']['noOfRatings'] = -1
				}

				aggregateData.push(sortedQuery)

				aggregateData.push(
					{
						$project: {
							title: {
								$ifNull: [`$translations.${language}.title`, '$title'],
							},
							description: {
								$ifNull: [`$translations.${language}.description`, '$description'],
							},
							impact: {
								$ifNull: [`$translations.${language}.impact`, '$impact'],
							},
							summary: {
								$ifNull: [`$translations.${language}.summary`, '$summary'],
							},
							story: {
								$ifNull: [`$translations.${language}.story`, '$story'],
							},
							author: {
								$ifNull: [`$translations.${language}.author`, '$author'],
							},
							externalId: 1,
							noOfRatings: 1,
							averageRating: 1,
							createdAt: 1,
							categories: 1,
							metaInformation: 1,
							recommendedFor: 1,
							evidences: 1,
							translations: 1,
						},
					},
					{
						$facet: {
							totalCount: [{ $count: 'count' }],
							data: [{ $skip: pageSize * (pageNo - 1) }, { $limit: pageSize }],
						},
					},
					{
						$project: {
							data: 1,
							count: {
								$arrayElemAt: ['$totalCount.count', 0],
							},
						},
					}
				)
				let result = await projectTemplateQueries.getAggregate(aggregateData)

				if (result[0].data.length > 0) {
					for (const resultedData of result[0].data) {
						// add as new if its created within 7 days
						let timeDifference = moment().diff(moment(resultedData.createdAt), 'days')
						resultedData.new = false
						if (timeDifference <= 7) {
							resultedData.new = true
						}
						// Process evidences
						if (resultedData.evidences && resultedData.evidences.length > 0) {
							for (const eachEvidence of resultedData.evidences) {
								try {
									const downloadableUrl = await filesHelpers.getDownloadableUrl([eachEvidence.link])
									eachEvidence.downloadableUrl = downloadableUrl.result[0].url
								} catch (error) {
									console.error('Error fetching downloadable URL:', error)
								}
							}
						}
					}
				}

				let projectTemplates = result[0].data
				let allCategoryId = []
				let filePathsArray = []

				for (let project of projectTemplates) {
					let categories = project.categories
					if (categories.length > 0) {
						let categoryIdArray = categories.map((category) => {
							if (category._id) {
								return category._id
							}
						})
						allCategoryId.push(...categoryIdArray)
					}
				}

				let allCategoryInfo = await projectCategoriesQueries.categoryDocuments({
					_id: { $in: allCategoryId },
					tenantId: userDetails.userInformation.tenantId,
				})
				for (let singleCategoryInfo of allCategoryInfo) {
					if (singleCategoryInfo.evidences && singleCategoryInfo.evidences.length > 0) {
						let filePaths = singleCategoryInfo.evidences.map((evidenceInfo) => {
							return evidenceInfo.filepath
						})
						filePathsArray.push({
							categoryId: singleCategoryInfo._id,
							filePaths,
						})
					}
				}

				for (let project of projectTemplates) {
					let categories = project.categories

					if (categories.length > 0) {
						for (let projectCategory of categories) {
							let filteredCategory = allCategoryInfo.filter((category) => {
								return category._id.toString() == projectCategory._id.toString()
							})
							if (filteredCategory.length > 0) {
								let singleCategoryInfo = filteredCategory[0]
								projectCategory.evidences = singleCategoryInfo.evidences
							}
						}
					}
				}

				let allFilePaths = filePathsArray.map((project) => {
					return project.filePaths
				})
				// `allFilePaths` is an array of arrays containing file paths.
				// Use Lodash's `_.flatten` to convert this into a single, flat array of file paths.
				// Example: [[path1, path2], [path3]] => [path1, path2, path3]
				let flattenedFilePathArr = _.flatten(allFilePaths)

				if (flattenedFilePathArr.length > 0) {
					let downloadableUrlsCall = await filesHelpers.getDownloadableUrl(flattenedFilePathArr)
					if (downloadableUrlsCall.message !== CONSTANTS.apiResponses.CLOUD_SERVICE_SUCCESS_MESSAGE) {
						throw {
							message: CONSTANTS.apiResponses.PROJECTS_FETCHED,
							data: {
								data: [],
								count: 0,
							},
						}
					}

					let downloadableUrls = downloadableUrlsCall.result

					let urlDictionary = {}
					for (let singleURL of downloadableUrls) {
						let url = singleURL.url
						let filePath = singleURL.filePath
						urlDictionary[filePath] = url
					}

					for (const template of projectTemplates) {
						const { categories } = template

						if (categories.length > 0) {
							for (const category of categories) {
								const { evidences } = category
								if (!evidences || evidences.length === 0) {
									continue
								}

								for (const [index, singleEvidence] of evidences.entries()) {
									const downloadablePath = urlDictionary[singleEvidence.filepath]
									category.evidences[index].downloadableUrl = downloadablePath
								}
							}
						}
					}

					result[0].data = projectTemplates
				}
				result[0].data.map(async (projectTemplate) => {
					if (projectTemplate.metaInformation) {
						const metaInformation = projectTemplate.metaInformation
						// get the translated data if language is other than 'en'
						if (language != 'en') {
							await UTILS.getTranslatedData(metaInformation, projectTemplate.translations[language])
						}
						// add metaInformation keys to the root of the project
						Object.keys(metaInformation).map((key) => {
							projectTemplate[key] = metaInformation[key]
						})
						delete projectTemplate.metaInformation
					}
					delete projectTemplate.translations
				})
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROJECTS_FETCHED,
					data: {
						data: result[0].data,
						count: result[0].count ? result[0].count : 0,
					},
				})
			} catch (error) {
				return reject({
					success: false,
					status: HTTP_STATUS_CODE.not_found.status,
					message: error.message,
				})
			}
		})
	}

	/**
	 * Update category
	 * @method
	 * @name update
	 * @param {Object} filterQuery - Filter query
	 * @param {Object} updateData - Update data
	 * @param {Object} files - Files
	 * @param {Object} userDetails - User details
	 * @returns {Object} Updated category
	 */
	static update(filterQuery, updateData, files, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				// Find category to update
				let matchQuery = { tenantId: userDetails.tenantAndOrgInfo.tenantId, isDeleted: false }
				if (ObjectId.isValid(filterQuery._id)) {
					matchQuery['$or'] = [{ _id: new ObjectId(filterQuery._id) }, { externalId: filterQuery._id }]
				} else {
					matchQuery['externalId'] = filterQuery._id
				}
				// Remove _id from filterQuery as we constructed matchQuery
				delete filterQuery._id

				let categoryData = await projectCategoriesQueries.categoryDocuments(matchQuery, 'all')

				if (!categoryData || !categoryData.length > 0 || !categoryData[0]._id) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.CATEGORY_NOT_FOUND,
					}
				}

				// Extract parent_id if provided (move operation)
				const newParentId = updateData.parent_id || null
				const hasParentChange = updateData.parent_id !== undefined

				// Handle evidence upload if files provided
				if (files && files.cover_image) {
					let evidenceUploadData = await handleEvidenceUpload(files, userDetails.userInformation.userId)
					evidenceUploadData = evidenceUploadData.data

					updateData['evidences'] = []

					if (categoryData[0].evidences && categoryData[0].evidences.length > 0) {
						for (const evidence of evidenceUploadData) {
							evidence.sequence += categoryData[0].evidences.length
							categoryData[0].evidences.push(evidence)
						}
						updateData['evidences'] = categoryData[0].evidences
					} else {
						updateData['evidences'] = evidenceUploadData
					}
				}

				// Check for duplicate name if name is being updated
				if (updateData.name) {
					const parentId = categoryData[0].parent_id
					const duplicateCheck = await projectCategoriesQueries.findOne(
						{
							name: updateData.name,
							tenantId: userDetails.tenantAndOrgInfo.tenantId,
							parent_id: parentId,
							isDeleted: false,
							_id: { $ne: categoryData[0]._id }, // Exclude current doc
						},
						{ _id: 1 }
					)

					if (duplicateCheck) {
						throw {
							status: HTTP_STATUS_CODE.bad_request.status,
							message:
								CONSTANTS.apiResponses.CATEGORY_NAME_EXISTS ||
								'Category with this name already exists in this level',
						}
					}
				}

				// Handle parent_id change (move operation) if provided
				if (hasParentChange) {
					// Prevent circular reference
					if (newParentId) {
						const categoryId = categoryData[0]._id
						if (newParentId.toString() === categoryId.toString()) {
							throw {
								status: HTTP_STATUS_CODE.bad_request.status,
								message: 'Cannot move category to itself',
							}
						}
						const descendants = await projectCategoriesQueries.getDescendants(
							categoryId,
							userDetails.tenantAndOrgInfo.tenantId
						)
						const descendantIds = descendants.map((d) => d._id.toString())
						if (descendantIds.includes(newParentId.toString())) {
							throw {
								status: HTTP_STATUS_CODE.bad_request.status,
								message: 'Cannot move category to its own descendant',
							}
						}
					}

					// Get old parent
					const oldParentId = categoryData[0].parent_id
					const categoryId = categoryData[0]._id

					// Get all descendants (for syncing templates later)
					const descendants = await projectCategoriesQueries.getDescendants(
						categoryId,
						userDetails.tenantAndOrgInfo.tenantId
					)

					// Update old parent: decrement count and remove from children array
					if (oldParentId) {
						await this.updateParentCounts(oldParentId, userDetails.tenantAndOrgInfo.tenantId, -1)
						await projectCategoriesQueries.updateOne(
							{ _id: oldParentId },
							{ $pull: { children: categoryId } }
						)
						this.syncTemplatesForCategory(oldParentId, userDetails.tenantAndOrgInfo.tenantId).catch(
							console.error
						)
					}

					// Update new parent: increment count and add to children array
					if (newParentId) {
						await this.updateParentCounts(newParentId, userDetails.tenantAndOrgInfo.tenantId, 1)
						await projectCategoriesQueries.updateOne(
							{ _id: newParentId },
							{ $addToSet: { children: categoryId } }
						)
						this.syncTemplatesForCategory(newParentId, userDetails.tenantAndOrgInfo.tenantId).catch(
							console.error
						)
					}

					// Sync moved category and all descendants
					this.syncTemplatesForCategory(categoryId, userDetails.tenantAndOrgInfo.tenantId).catch(
						console.error
					)
					descendants.forEach((descendant) => {
						this.syncTemplatesForCategory(descendant._id, userDetails.tenantAndOrgInfo.tenantId).catch(
							console.error
						)
					})
				}

				// Remove tenantId, orgId, hasChildCategories from updateData
				delete updateData.tenantId
				delete updateData.orgId
				delete updateData.hasChildCategories
				delete updateData.parent_id

				// Update category - use the constructed matchQuery so only the targeted category is updated
				let categoriesUpdated = await projectCategoriesQueries.updateMany(matchQuery, { $set: updateData })

				if (!categoriesUpdated) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROJECT_CATEGORIES_NOT_UPDATED,
					}
				}

				// Sync templates if name or externalId changed
				if (updateData.name || updateData.externalId) {
					// Trigger template sync (can be async)
					this.syncTemplatesForCategory(categoryData[0]._id, userDetails.tenantAndOrgInfo.tenantId).catch(
						console.error
					)
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROJECT_CATEGORIES_UPDATED,
					data: {
						categoryId: categoryData[0]._id,
						movedCategory: hasParentChange ? categoryData[0]._id : null,
						newParentId: hasParentChange ? newParentId : null,
					},
				})
			} catch (error) {
				return reject({
					success: false,
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message,
					data: {},
				})
			}
		})
	}

	/**
	 * Details of library projects.
	 * @method
	 * @name projectDetails
	 * @param projectId - project internal id.
	 * @param language - languageCode
	 * @returns {Object} Details of library projects.
	 */

	static projectDetails(projectId, userToken = '', isATargetedSolution = '', language = '', userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				let tenantId = userDetails.userInformation.tenantId
				let orgId = userDetails.userInformation.organizationId
				let projectsData = await projectTemplateQueries.templateDocument(
					{
						_id: projectId,
						status: CONSTANTS.common.PUBLISHED,
						isDeleted: false,
						tenantId: tenantId,
					},
					'all',
					['__v']
				)

				if (!projectsData.length > 0) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROJECT_NOT_FOUND,
					}
				}

				projectsData[0].showProgramAndEntity = false

				if (projectsData[0].tasks && projectsData[0].tasks.length > 0) {
					let tasks = await projectTemplateTaskQueries.taskDocuments({
						_id: {
							$in: projectsData[0].tasks,
						},
						isDeleted: false,
					})

					if (tasks && tasks.length > 0) {
						let taskData = {}

						for (let taskPointer = 0; taskPointer < tasks.length; taskPointer++) {
							let currentTask = tasks[taskPointer]

							if (
								currentTask.type === CONSTANTS.common.ASSESSMENT ||
								currentTask.type === CONSTANTS.common.OBSERVATION
							) {
								projectsData[0].showProgramAndEntity = true
							}

							if (currentTask.parentId && currentTask.parentId !== '') {
								if (!taskData[currentTask.parentId.toString()]) {
									taskData[currentTask.parentId.toString()] = { children: [] } // Initialize if not present
								}

								taskData[currentTask.parentId.toString()].children.push(
									_.omit(currentTask, ['parentId'])
								)
							} else {
								currentTask.children = []
								taskData[currentTask._id.toString()] = currentTask
							}
						}

						projectsData[0].tasks = Object.values(taskData)
					}
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROJECTS_FETCHED,
					data: projectsData[0],
				})
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
	 * Create category
	 * @method
	 * @name create
	 * @param {Object} categoryData - Category data
	 * @param {Object} files - Files
	 * @param {Object} userDetails - User details
	 * @returns {Object} Created category
	 */
	static async create(categoryData, files, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				// Extract tenant & org details
				const tenantId = userDetails.tenantAndOrgInfo.tenantId
				const orgId = userDetails.tenantAndOrgInfo.orgId

				// Validate org extension
				const orgExtension = await orgExtensionQueries.orgExtenDocuments({
					tenantId,
					orgId: orgId[0],
				})

				if (!orgExtension || orgExtension.length === 0) {
					throw {
						success: false,
						status: 404,
						message: 'ORG_EXTENSION_NOT_FOUND',
					}
				}

				const parentId = categoryData.parentId || categoryData.parent_id || null

				// Duplicate category check — always enforce duplicate name prevention
				const nameFilter = {
					name: categoryData.name,
					tenantId: tenantId,
					isDeleted: false,
					parent_id: parentId ? new ObjectId(parentId) : null,
				}
				const duplicateName = await projectCategoriesQueries.findOne(nameFilter, { _id: 1 })
				if (duplicateName) {
					throw {
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message:
							CONSTANTS.apiResponses.CATEGORY_ALREADY_EXISTS ||
							'Category with this name already exists in this level',
					}
				}

				// Legacy check for externalId (global uniqueness)
				const filterQuery = {
					externalId: categoryData.externalId?.toString(),
					tenantId: tenantId,
				}

				const existingCategory = await projectCategoriesQueries.categoryDocuments(filterQuery, [
					'_id',
					'externalId',
				])

				if (existingCategory.length > 0) {
					throw {
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.CATEGORY_ALREADY_EXISTS,
					}
				}

				// Validate parent
				const parent = await this.validateParent(parentId, tenantId)

				// Upload evidences
				const evidences = await handleEvidenceUpload(files, userDetails.userInformation.userId)
				categoryData.evidences = evidences.data

				// Add required fields before creation
				categoryData.tenantId = tenantId
				categoryData.orgId = orgId[0]
				categoryData.hasChildCategories = false
				categoryData.sequenceNumber = categoryData.sequenceNumber || 0
				// ensure icon (if provided at root) moves under metaInformation for storage
				if (categoryData.icon) {
					categoryData.metaInformation = categoryData.metaInformation || {}
					categoryData.metaInformation.icon = categoryData.icon
					delete categoryData.icon
				}

				// Create category
				let createdCategory = await projectCategoriesQueries.create(categoryData)

				// Update parent counters and add to children array
				if (parentId) {
					await this.updateParentCounts(parentId, tenantId, 1)
					// add to parent's children array
					await projectCategoriesQueries.updateOne(
						{ _id: parentId },
						{ $addToSet: { children: createdCategory._id } }
					)
					this.syncTemplatesForCategory(parentId, tenantId).catch(console.error)
				}

				createdCategory = await projectCategoriesQueries.findOne({ _id: createdCategory._id })

				// normalize icon for backward compatibility
				if (
					createdCategory &&
					createdCategory.metaInformation &&
					createdCategory.metaInformation.icon !== undefined
				) {
					createdCategory.icon = createdCategory.metaInformation.icon
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROJECT_CATEGORIES_ADDED,
					data: createdCategory,
				})
			} catch (error) {
				return reject({
					status: error.status ? error.status : HTTP_STATUS_CODE.internal_server_error.status,
					success: false,
					message: error.message,
					data: {},
				})
			}
		})
	}

	/**
	 * List categories with hierarchy support
	 * @method
	 * @name list
	 * @param {Object} req - Request object
	 * @returns {Object} Categories list
	 */
	static list(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let tenantId = req.userDetails.userInformation.tenantId
				let organizationId = req.userDetails.userInformation.organizationId
				let query = {
					// visibleToOrganizations: { $in: [organizationId] },
					tenantId: tenantId,
					status: CONSTANTS.common.ACTIVE_STATUS,
					isDeleted: false,
				}

				// Filter by parentId if provided
				if (req.query.parentId) {
					query.parent_id = req.query.parentId
				} else if (req.query.rootOnly === 'true' || req.query.rootOnly === true) {
					// Root categories only
					query.parent_id = null
				}

				// Handle currentOrgOnly filter
				if (req.query.currentOrgOnly) {
					let currentOrgOnly = UTILS.convertStringToBoolean(req.query.currentOrgOnly)
					if (currentOrgOnly) {
						query['orgId'] = { $in: ['ALL', organizationId] }
					}
				}

				// Pagination logic
				const pageSize = req.pageSize
				const skip = pageSize * (req.pageNo - 1)
				const sort = { sequenceNumber: 1, name: 1 }

				// Use new paginated list query
				let projectCategories = await projectCategoriesQueries.list(
					query,
					{
						externalId: 1,
						name: 1,
						'metaInformation.icon': 1,
						updatedAt: 1,
						noOfProjects: 1,
						parent_id: 1,
						hasChildCategories: 1,
						sequenceNumber: 1,
					},
					sort,
					skip,
					pageSize
				)

				if (projectCategories.data.length === 0) {
					return resolve({
						success: true,
						message: CONSTANTS.apiResponses.PROJECT_CATEGORIES_FETCHED || 'Categories fetched successfully',
						data: [],
						count: 0,
					})
				}

				// Normalize icon from metaInformation and ensure sequenceNumber exists for compatibility
				const normalizedData = projectCategories.data.map((cat) => {
					const copy = { ...cat }
					if (copy.metaInformation && copy.metaInformation.icon !== undefined) {
						copy.icon = copy.metaInformation.icon
					}
					copy.sequenceNumber = copy.sequenceNumber || 0
					return copy
				})

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROJECT_CATEGORIES_FETCHED || 'Categories fetched successfully',
					data: normalizedData,
					count: projectCategories.count,
				})
			} catch (error) {
				return reject({
					success: false,
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message,
					data: {},
				})
			}
		})
	}

	/**
	 * Update parent's hasChildCategories
	 * @method
	 * @name updateParentCounts
	 * @param {ObjectId} parentId - Parent category ID
	 * @param {String} tenantId - Tenant ID
	 * @param {Number} increment - Increment value (1 or -1)
	 */
	static async updateParentCounts(parentId, tenantId, increment = 1) {
		if (!parentId) return

		try {
			const parent = await projectCategoriesQueries.findOne({ _id: parentId, tenantId })
			if (parent) {
				const existingChildren = Array.isArray(parent.children) ? parent.children.length : 0
				const newChildCount = Math.max(0, existingChildren + increment)
				await projectCategoriesQueries.updateOne(
					{ _id: parentId, tenantId },
					{
						$set: {
							hasChildCategories: newChildCount > 0,
						},
					}
				)
			}
		} catch (error) {
			console.error('Error updating parent counts:', error)
		}
	}

	/**
	 * Validate parent category
	 * @method
	 * @name validateParent
	 * @param {ObjectId} parentId - Parent category ID
	 * @param {String} tenantId - Tenant ID
	 * @returns {Object} Parent category
	 */
	static async validateParent(parentId, tenantId) {
		if (!parentId) return null

		const parent = await projectCategoriesQueries.findOne({
			_id: parentId,
			tenantId,
			isDeleted: false,
		})

		if (!parent) {
			throw {
				status: HTTP_STATUS_CODE.bad_request.status,
				message: 'PARENT_CATEGORY_NOT_FOUND',
			}
		}

		return parent
	}

	/**
	 * Get hierarchy for a specific category (subtree starting from category)
	 * @method
	 * @name getCategoryHierarchy
	 * @param {String} categoryId - Category ID
	 * @param {Object} req - Request object
	 * @returns {Object} Category subtree
	 */
	static getCategoryHierarchy(categoryId, req) {
		return new Promise(async (resolve, reject) => {
			try {
				let tenantId =
					req.headers['tenantId'] ||
					req.body.tenantId ||
					req.query.tenantId ||
					req.query.tenantCode ||
					req.userDetails.userInformation.tenantId

				// Find the category
				let matchQuery = { tenantId: tenantId, isDeleted: false }
				if (ObjectId.isValid(categoryId)) {
					matchQuery['$or'] = [{ _id: new ObjectId(categoryId) }, { externalId: categoryId }]
				} else {
					matchQuery['externalId'] = categoryId
				}

				const category = await projectCategoriesQueries.findOne(matchQuery)

				if (!category) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.CATEGORY_NOT_FOUND || 'Category not found',
					}
				}

				// Get all descendant categories recursively
				const descendantIds = await this.getAllDescendantIds(category._id, tenantId)
				const allCategoryIds = [category._id, ...descendantIds]

				// Convert all IDs to ObjectId for query
				const objectIdArray = allCategoryIds.map((id) => {
					if (id instanceof ObjectId) return id
					if (ObjectId.isValid(id)) return new ObjectId(id)
					return id
				})

				// Get all categories in the subtree
				let query = {
					tenantId: tenantId,
					_id: { $in: objectIdArray },
					status: CONSTANTS.common.ACTIVE_STATUS,
					isDeleted: false,
				}

				let allCategories = await projectCategoriesQueries.categoryDocuments(query, [
					'_id',
					'externalId',
					'name',
					'metaInformation.icon',
					'parent_id',
					'hasChildCategories',
					'sequenceNumber',
				])

				// Build tree structure starting from the requested category
				const categoryMap = {}
				let rootCategory = null

				// Create map of all categories
				allCategories.forEach((cat) => {
					const catIdStr = cat._id.toString()
					categoryMap[catIdStr] = { ...cat, children: [] }
					const categoryIdStr = category._id.toString()
					if (catIdStr === categoryIdStr) {
						rootCategory = categoryMap[catIdStr]
					}
				})

				// Build tree - only add children that are in our map
				allCategories.forEach((cat) => {
					const categoryNode = categoryMap[cat._id.toString()]
					if (cat.parent_id) {
						// Handle both ObjectId and string formats
						let parentIdStr
						if (cat.parent_id instanceof ObjectId) {
							parentIdStr = cat.parent_id.toString()
						} else if (cat.parent_id._id) {
							parentIdStr = cat.parent_id._id.toString()
						} else {
							parentIdStr = cat.parent_id.toString()
						}

						if (categoryMap[parentIdStr]) {
							categoryMap[parentIdStr].children.push(categoryNode)
						}
					}
				})

				// Sort by sequenceNumber
				const sortBySequenceNumber = (categoryNode) => {
					if (categoryNode.children && categoryNode.children.length > 0) {
						categoryNode.children.sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0))
						categoryNode.children.forEach((child) => {
							if (child.children && child.children.length > 0) {
								sortBySequenceNumber(child)
							}
						})
					}
				}

				// normalize icon field from metaInformation to top-level for backward compatibility
				const normalizeIcon = (categoryNode) => {
					if (categoryNode.metaInformation && categoryNode.metaInformation.icon !== undefined) {
						categoryNode.icon = categoryNode.metaInformation.icon
					}
					if (categoryNode.children && categoryNode.children.length) {
						categoryNode.children.forEach((child) => normalizeIcon(child))
					}
				}

				if (rootCategory) {
					sortBySequenceNumber(rootCategory)
					normalizeIcon(rootCategory)
				}

				return resolve({
					success: true,
					message: 'Category hierarchy fetched successfully',
					data: {
						tree: rootCategory,
						totalCategories: allCategories.length,
					},
				})
			} catch (error) {
				return reject({
					success: false,
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message,
					data: {},
				})
			}
		})
	}

	/**
	 * Get leaf categories
	 * @method
	 * @name getLeaves
	 * @param {Object} req - Request object
	 * @returns {Object} Leaf categories
	 */
	static getLeaves(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let tenantId =
					req.headers['tenantId'] ||
					req.body.tenantId ||
					req.query.tenantId ||
					req.query.tenantCode ||
					req.userDetails.userInformation.tenantId
				let orgId =
					req.headers['orgId'] ||
					req.body.orgId ||
					req.query.orgId ||
					req.query.orgCode ||
					req.userDetails.userInformation.organizationId

				let query = {
					tenantId: tenantId,
					// visibleToOrganizations: { $in: [orgId] },
					status: CONSTANTS.common.ACTIVE_STATUS,
					isDeleted: false,
					hasChildCategories: false,
				}

				// Pagination logic using defaults
				const pageSize = req.pageSize
				const skip = pageSize * (req.pageNo - 1)
				const sort = { sequenceNumber: 1, name: 1 }

				// Use list query with pagination
				let leafCategoriesResult = await projectCategoriesQueries.list(
					query,
					{
						externalId: 1,
						name: 1,
						'metaInformation.icon': 1,
						parent_id: 1,
						hasChildCategories: 1,
						sequenceNumber: 1,
					},
					sort,
					skip,
					pageSize
				)

				// Normalize icon from metaInformation
				const normalizedData = leafCategoriesResult.data.map((cat) => {
					const copy = { ...cat }
					if (copy.metaInformation && copy.metaInformation.icon !== undefined) {
						copy.icon = copy.metaInformation.icon
					}
					return copy
				})

				return resolve({
					success: true,
					message: 'Leaf categories fetched successfully',
					data: normalizedData,
					count: leafCategoriesResult.count,
				})
			} catch (error) {
				return reject({
					success: false,
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message,
					data: {},
				})
			}
		})
	}

	/**
	 * Get all descendant category IDs for a given category (recursive)
	 * @method
	 * @name getAllDescendantIds
	 * @param {ObjectId} categoryId - Parent category ID
	 * @param {String} tenantId - Tenant ID
	 * @returns {Array} Array of descendant category IDs
	 */
	static async getAllDescendantIds(categoryId, tenantId) {
		try {
			const allDescendantIds = []
			const processedIds = new Set()

			// Recursive function to get all descendants
			const getDescendants = async (parentId) => {
				// Normalize parentId to string for comparison
				const parentIdStr = parentId instanceof ObjectId ? parentId.toString() : parentId.toString()

				// Avoid infinite loops
				if (processedIds.has(parentIdStr)) {
					return
				}
				processedIds.add(parentIdStr)

				// Convert to ObjectId for query - MongoDB can match ObjectId with ObjectId or string
				const parentObjectId =
					parentId instanceof ObjectId
						? parentId
						: ObjectId.isValid(parentId)
						? new ObjectId(parentId)
						: parentId

				// Query for direct children - try both ObjectId and string formats
				const children = await projectCategoriesQueries.categoryDocuments(
					{
						tenantId: tenantId,
						$or: [{ parent_id: parentObjectId }, { parent_id: parentIdStr }],
						isDeleted: false,
						status: CONSTANTS.common.ACTIVE_STATUS,
					},
					['_id', 'parent_id']
				)

				for (const child of children) {
					const childIdStr = child._id.toString()
					// Only add if not already in the list
					if (!allDescendantIds.some((id) => id.toString() === childIdStr)) {
						allDescendantIds.push(child._id)
						// Recursively get children of this child
						await getDescendants(child._id)
					}
				}
			}

			await getDescendants(categoryId)
			return allDescendantIds
		} catch (error) {
			console.error('Error getting descendant IDs:', error)
			return []
		}
	}

	/**
	 * Check if categories have any projects associated
	 * @method
	 * @name checkCategoriesHaveProjects
	 * @param {Array} categoryIds - Array of category IDs to check
	 * @param {String} tenantId - Tenant ID
	 * @returns {Object} Result with hasProjects flag and details
	 */
	static async checkCategoriesHaveProjects(categoryIds, tenantId) {
		try {
			// Build aggregation pipeline to count projects for each category
			const pipeline = [
				{
					$match: {
						tenantId: tenantId,
						isReusable: true,
						status: CONSTANTS.common.PUBLISHED_STATUS,
						isDeleted: false,
						'categories._id': { $in: categoryIds },
					},
				},
				{
					$unwind: '$categories',
				},
				{
					$match: {
						'categories._id': { $in: categoryIds },
					},
				},
				{
					$group: {
						_id: '$categories._id',
						categoryName: { $first: '$categories.name' },
						projectCount: { $sum: 1 },
						projectTitles: { $push: '$title' },
					},
				},
			]

			const results = await projectTemplateQueries.getAggregate(pipeline)

			if (!results || results.length === 0) {
				return {
					hasProjects: false,
					totalProjects: 0,
					categoriesWithProjects: [],
				}
			}

			const totalProjects = results.reduce((sum, cat) => sum + cat.projectCount, 0)
			const categoriesWithProjects = results.map((cat) => ({
				categoryId: cat._id,
				categoryName: cat.categoryName,
				projectCount: cat.projectCount,
				projectTitles: cat.projectTitles.slice(0, 5), // Limit to first 5 project names
			}))

			return {
				hasProjects: true,
				totalProjects,
				categoriesWithProjects,
			}
		} catch (error) {
			console.error('Error checking categories for projects:', error)
			return {
				hasProjects: false,
				totalProjects: 0,
				categoriesWithProjects: [],
			}
		}
	}

	/**
	 * Delete category
	 * @method
	 * @name delete
	 * @param {ObjectId} categoryId - Category ID
	 * @param {String} tenantId - Tenant ID
	 * @param {String} orgId - Org ID
	 * @returns {Object} Delete result
	 */
	static delete(categoryId, tenantId, orgId) {
		return new Promise(async (resolve, reject) => {
			try {
				// 1. Get category details
				let matchQuery = { tenantId: tenantId, isDeleted: false }
				if (ObjectId.isValid(categoryId)) {
					matchQuery['$or'] = [{ _id: new ObjectId(categoryId) }, { externalId: categoryId }]
				} else {
					matchQuery['externalId'] = categoryId
				}

				const category = await projectCategoriesQueries.findOne(matchQuery)

				if (!category) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.CATEGORY_NOT_FOUND,
					}
				}

				// 2. Validate deletion eligibility
				const allCategoryIds = await this.getAllDescendantIds(category._id, tenantId)
				allCategoryIds.push(category._id) // Include the category itself

				// Check if any category (parent or children) has projects
				const projectsCheck = await this.checkCategoriesHaveProjects(allCategoryIds, tenantId)
				if (projectsCheck.hasProjects) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: `Category or its children are used by ${projectsCheck.totalProjects} projects`,
					}
				}

				// Check if has children
				if (category.hasChildCategories) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: 'Has child categories. Delete children first.',
					}
				}

				// Check if referenced by templates
				const templates = await projectTemplateQueries.templateDocument(
					{
						'categories._id': category._id,
						tenantId,
						isDeleted: false,
					},
					['_id', 'title']
				)

				if (templates && templates.length > 0) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: `Referenced by ${templates.length} templates`,
					}
				}

				// 3. Soft delete the category
				await projectCategoriesQueries.updateOne(
					{ _id: category._id, tenantId },
					{ $set: { isDeleted: true, deletedAt: new Date() } }
				)

				// 4. Remove category from all templates
				const templatesUpdated = await this.removeCategoryFromTemplates(category._id, tenantId)

				// 5. Update parent counts
				if (category.parent_id) {
					await this.updateParentCounts(category.parent_id, tenantId, -1)
					// remove from parent's children array
					await projectCategoriesQueries.updateOne(
						{ _id: category.parent_id },
						{ $pull: { children: category._id } }
					)
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.CATEGORY_DELETED || 'Category deleted successfully',
					data: {
						categoryId: category._id,
						templatesUpdated: templatesUpdated,
					},
				})
			} catch (error) {
				return reject({
					success: false,
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message,
					data: {},
				})
			}
		})
	}

	/**
	 * Remove category from all templates
	 * @method
	 * @name removeCategoryFromTemplates
	 * @param {ObjectId} categoryId - Category ID
	 * @param {String} tenantId - Tenant ID
	 * @returns {Number} Number of templates updated
	 */
	static async removeCategoryFromTemplates(categoryId, tenantId) {
		try {
			// Find all templates with this category
			const templates = await projectTemplateQueries.templateDocument(
				{
					'categories._id': categoryId,
					tenantId,
					isDeleted: false,
				},
				['_id', 'categories']
			)

			console.log(`Removing category ${categoryId} from ${templates.length} templates`)

			// Remove category from each template
			for (const template of templates) {
				const updatedCategories = template.categories.filter(
					(cat) => cat._id && cat._id.toString() !== categoryId.toString()
				)

				await projectTemplateQueries.updateProjectTemplateDocument(
					{ _id: template._id },
					{
						$set: {
							categories: updatedCategories,
							categorySyncedAt: new Date(),
						},
					}
				)
			}

			return templates.length
		} catch (error) {
			console.error('Error removing category from templates:', error)
			throw error
		}
	}

	/**
	 * Bulk create categories
	 * @method
	 * @name bulkCreate
	 * @param {Array} categories - Array of category data
	 * @param {String} tenantId - Tenant ID
	 * @param {String} orgId - Org ID
	 * @param {Object} userDetails - User details
	 * @returns {Object} Bulk create result
	 */
	static bulkCreate(categories, tenantId, orgId, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				let created = 0
				let failed = 0
				const errors = []

				for (const categoryData of categories) {
					try {
						// Find parent by externalId if parentExternalId provided
						let parentId = null
						if (categoryData.parentExternalId) {
							const parent = await projectCategoriesQueries.findOne(
								{ externalId: categoryData.parentExternalId, tenantId },
								{ _id: 1 }
							)
							if (parent) {
								parentId = parent._id
							} else {
								throw {
									message:
										CONSTANTS.apiResponses.PARENT_CATEGORY_NOT_FOUND || 'Parent category not found',
									status: HTTP_STATUS_CODE.bad_request.status,
								}
							}
						}

						categoryData.parentId = parentId
						categoryData.tenantId = tenantId
						categoryData.orgId = orgId
						// categoryData.visibleToOrganizations = [orgId]

						// Create category
						const result = await this.create(categoryData, null, userDetails)
						if (result.success) {
							created++
						} else {
							failed++
							errors.push({ category: categoryData.externalId, error: result.message })
						}
					} catch (error) {
						failed++
						errors.push({ category: categoryData.externalId, error: error.message })
					}
				}

				return resolve({
					success: true,
					data: {
						created,
						failed,
						errors,
					},
				})
			} catch (error) {
				return reject({
					success: false,
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message,
					data: {},
				})
			}
		})
	}

	/**
	 * Apply visibility conditions to the match query.
	 * @method
	 * @name applyVisibilityConditions
	 * @param {Object} matchQuery - The current match query.
	 * @param {Object} orgExtension - Organization extension document.
	 * @param {Object} userDetails - User details.
	 * @returns {Object} Updated match query.
	 */
	static applyVisibilityConditions(matchQuery, orgExtension, userDetails) {
		let matchConditions = []

		// allow ALL templates
		if (
			orgExtension &&
			orgExtension.externalProjectResourceVisibilityPolicy === CONSTANTS.common.ORG_EXTENSION_VISIBILITY.ALL
		) {
			matchConditions.push({ visibility: CONSTANTS.common.ORG_EXTENSION_VISIBILITY.ALL })
		}

		// allow ASSOCIATED templates with orgId match (for both ALL and ASSOCIATED cases)
		if (
			orgExtension &&
			[
				CONSTANTS.common.ORG_EXTENSION_VISIBILITY.ALL,
				CONSTANTS.common.ORG_EXTENSION_VISIBILITY.ASSOCIATED,
			].includes(orgExtension.externalProjectResourceVisibilityPolicy)
		) {
			matchConditions.push({
				visibility: { $ne: CONSTANTS.common.ORG_EXTENSION_VISIBILITY.CURRENT },
				visibleToOrganizations: {
					$in: [userDetails.userInformation.organizationId],
				},
			})
		}

		// Build a single `$or` array for visibility, then add it into `$and`
		const visibilityOr =
			matchConditions.length > 0
				? [...matchConditions, { orgId: userDetails.userInformation.organizationId }]
				: null
		if (visibilityOr) {
			// Preserve any existing $and clauses and append the visibility OR
			matchQuery.$match.$and = [...(matchQuery.$match.$and || []), { $or: visibilityOr }]
		} else {
			// Fallback to a simple orgId match when there are no other visibility conditions
			matchQuery.$match.orgId = userDetails.userInformation.organizationId
		}
		return matchQuery
	}

	/**
	 * Sync templates for a category (background job)
	 * @method
	 * @name syncTemplatesForCategory
	 * @param {ObjectId} categoryId - Category ID
	 * @param {String} tenantId - Tenant ID
	 */
	static async syncTemplatesForCategory(categoryId, tenantId) {
		try {
			const category = await projectCategoriesQueries.findOne({ _id: categoryId, tenantId })
			if (!category) return

			// Find all templates with this category
			const templates = await projectTemplateQueries.templateDocument(
				{
					'categories._id': categoryId,
					tenantId,
					isDeleted: false,
				},
				['_id', 'categories']
			)

			// Instead of updating templates directly here, publish a kafka event so
			// downstream template sync workers can handle updates in a decoupled way.
			for (const template of templates) {
				const message = {
					templateId: template._id,
					tenantId: tenantId,
					category: {
						_id: category._id,
						name: category.name,
						externalId: category.externalId,
						isLeaf: !category.hasChildCategories,
						updatedAt: new Date(),
					},
					action: 'category_updated',
				}

				// fire and forget - log error if kafka push fails
				kafkaProducersHelper.pushCategoryChangeEvent(message).catch((err) => {
					console.error('Failed to push category change event for template', template._id, err)
				})
			}
		} catch (error) {
			console.error('Error syncing templates for category:', error)
		}
	}

	static details(categoryId, tenantId) {
		return new Promise(async (resolve, reject) => {
			try {
				let matchQuery = {
					tenantId: tenantId,
					isDeleted: false,
				}

				if (ObjectId.isValid(categoryId)) {
					matchQuery['$or'] = [{ _id: new ObjectId(categoryId) }, { externalId: categoryId }]
				} else {
					matchQuery['externalId'] = categoryId
				}

				const category = await projectCategoriesQueries.findOne(matchQuery)

				if (!category) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.CATEGORY_NOT_FOUND,
					}
				}

				// normalize icon for backward compatibility
				if (category && category.metaInformation && category.metaInformation.icon !== undefined) {
					category.icon = category.metaInformation.icon
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROJECT_CATEGORIES_FETCHED,
					data: category,
				})
			} catch (error) {
				return reject({
					success: false,
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message,
					data: {},
				})
			}
		})
	}
}

/**
 * Handle evidence upload
 * @name handleEvidenceUpload
 * @param {Array} files - files
 * @param {String} userId - user id
 * @returns {Object} returns evidences array
 */
function handleEvidenceUpload(files, userId) {
	return new Promise(async (resolve, reject) => {
		try {
			let evidences = []
			if (files && files.cover_image) {
				let coverImages = files.cover_image

				if (!Array.isArray(coverImages)) {
					coverImages = [coverImages]
				}

				let uniqueId = await UTILS.generateUniqueId()

				let requestData = {
					[uniqueId]: {
						files: [],
					},
				}

				for (let file of coverImages) {
					requestData[uniqueId].files.push(file.name)
				}

				let signedUrl = await filesHelpers.preSignedUrls(requestData, userId, false)

				if (
					signedUrl.data &&
					Object.keys(signedUrl.data).length > 0 &&
					signedUrl.data[uniqueId].files.length > 0 &&
					signedUrl.data[uniqueId].files[0].url &&
					signedUrl.data[uniqueId].files[0].url !== ''
				) {
					for (let fileFromRequest of coverImages) {
						let fileUploadUrl = signedUrl.data[uniqueId].files.filter((fileData) => {
							return fileData.file == fileFromRequest.name
						})

						const uploadData = await axios.put(fileUploadUrl[0].url, fileFromRequest.data, {
							headers: {
								'x-ms-blob-type': process.env.CLOUD_STORAGE_PROVIDER === 'azure' ? 'BlockBlob' : null,
								'Content-Type': 'multipart/form-data',
							},
						})

						if (!(uploadData.status == 200 || uploadData.status == 201)) {
							throw {
								success: false,
								message: CONSTANTS.apiResponses.FAILED_TO_UPLOAD,
							}
						}
					}
				}

				let sequenceNumber = 0
				evidences = signedUrl.data[uniqueId].files.map((fileInfo) => {
					return {
						title: fileInfo.file,
						filepath: fileInfo.payload.sourcePath,
						type: fileInfo.file.split('.').reverse()[0],
						sequence: ++sequenceNumber,
					}
				})
			}

			return resolve({
				success: true,
				data: evidences,
			})
		} catch (error) {
			return reject({
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				success: false,
				message: error.message,
				data: {},
			})
		}
	})
}

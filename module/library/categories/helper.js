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
const projectTemplateTaskQueries = require(DB_QUERY_BASE_PATH + '/projectTemplateTask')
const moment = require('moment-timezone')
const filesHelpers = require(MODULES_BASE_PATH + '/cloud-services/files/helper')
const axios = require('axios')
const entitiesService = require(GENERICS_FILES_PATH + '/services/entity-management')

/**
 * LibraryCategoriesHelper
 * @class
 */

module.exports = class LibraryCategoriesHelper {
	/**
	 * List of library projects.
	 * @method
	 * @name projects
	 * @param categoryId - category external id.
	 * @param pageSize - Size of page.
	 * @param pageNo - Recent page no.
	 * @param search - search text.
	 * @param sortedData - Data to be sorted.
	 * @param language - pass language code for the translation
	 * @param hasSpotlight - true/false for filtering based on hasSpotlight key
	 * @param filter - Data to be filtered
	 * @returns {Object} List of library projects.
	 */

	static projects(
		categoryId,
		pageSize,
		pageNo,
		search,
		sortedData,
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

				if (categoryId && categoryId !== '') {
					matchQuery['$match']['categories.externalId'] = categoryId
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

						const defaultDurationAttributes = CONSTANTS.common.DEFAULT_ATTRIBUTES.find(
							(attr) => attr.code === 'duration'
						)
						const entities = defaultDurationAttributes?.entities || []

						// Extract values excluding "More than 6 weeks"
						let notInDurations = entities
							.map((entity) => entity.value)
							.filter((value) => value !== CONSTANTS.common.MORE_THAN_SIX_WEEKS)

						if (durationArray.includes(CONSTANTS.common.MORE_THAN_SIX_WEEKS)) {
							// Exclude "More than 6 weeks" from the current durations
							const filteredDurations = durationArray.filter(
								(dur) => dur !== CONSTANTS.common.MORE_THAN_SIX_WEEKS
							)

							// Exclude already included durations from `notInDurations`
							notInDurations = notInDurations.filter(
								(notDuration) => !filteredDurations.includes(notDuration)
							)

							// Apply the `$nin` filter
							matchQuery['$match']['metaInformation.duration'] = { $nin: notInDurations }
						} else if (durationArray.length > 0) {
							// Apply the `$in` filter
							matchQuery['$match']['metaInformation.duration'] = { $in: durationArray }
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

				if (search !== '') {
					if (userLanguage === defaultLanguage) {
						// Search directly in default fields for English
						matchQuery['$match']['$or'] = [
							{ title: new RegExp(search, 'i') },
							{ description: new RegExp(search, 'i') },
							{ categories: new RegExp(search, 'i') },
						]
					} else {
						// Search in translations for other languages
						matchQuery['$match']['$or'] = [
							{ [`translations.${userLanguage}.title`]: new RegExp(search, 'i') },
							{ [`translations.${userLanguage}.description`]: new RegExp(search, 'i') },
							{ title: new RegExp(search, 'i') },
							{ description: new RegExp(search, 'i') },
							{ categories: new RegExp(search, 'i') },
						]
					}
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
						if (language != 'en') {
							await UTILS.getTranslatedData(metaInformation, projectTemplate.translations[language])
						}
						Object.keys(metaInformation).map((key) => {
							projectTemplate[key] = metaInformation[key]
						})
						delete projectTemplate.metaInformation
						delete projectTemplate.translations
					}
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
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROJECTS_FETCHED,
					data: {
						data: [],
						count: 0,
					},
				})
			}
		})
	}

	/**
	 * Update categories
	 * @method
	 * @name update
	 * @param filterQuery - Filter query.
	 * @param updateData - Update data.
	 * @param files - files
	 * @param userId - user id
	 * @returns {Object} updated data
	 */

	static update(filterQuery, updateData, files, userId) {
		return new Promise(async (resolve, reject) => {
			try {
				let categoryData = await projectCategoriesQueries.categoryDocuments(
					{
						_id: filterQuery._id,
					},
					'all'
				)

				// Throw error if category is not found
				if (
					!categoryData ||
					!(categoryData.length > 0) ||
					!(Object.keys(categoryData[0]).length > 0) ||
					categoryData[0]._id == ''
				) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.CATEGORY_NOT_FOUND,
					}
				}

				let evidenceUploadData = await handleEvidenceUpload(files, userId)
				evidenceUploadData = evidenceUploadData.data

				// Update the sequence numbers
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

				// Update the category
				let categoriesUpdated = await projectCategoriesQueries.updateMany(filterQuery, updateData)

				if (!categoriesUpdated) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROJECT_CATEGORIES_NOT_UPDATED,
					}
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROJECT_CATEGORIES_UPDATED,
				})
			} catch (error) {
				return resolve({
					success: false,
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

	static projectDetails(projectId, userToken = '', isATargetedSolution = '', language = '') {
		return new Promise(async (resolve, reject) => {
			try {
				let projectsData = await projectTemplateQueries.templateDocument(
					{
						_id: projectId,
						status: CONSTANTS.common.PUBLISHED,
						isDeleted: false,
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
									taskData[currentTask.parentId.toString()].children = []
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
	 * create categories
	 * @method
	 * @name create
	 * @param categoryData - categoryData.
	 * @param files - files.
	 * @param userId - user id.
	 * @returns {Object} category details
	 */

	static create(categoryData, files, userId) {
		return new Promise(async (resolve, reject) => {
			try {
				// Check if the category already exists
				const checkIfCategoryExist = await projectCategoriesQueries.categoryDocuments(
					{
						externalId: categoryData.externalId.toString(),
					},
					['_id', 'externalId']
				)

				// Throw error if the category already exists
				if (
					checkIfCategoryExist.length > 0 &&
					Object.keys(checkIfCategoryExist[0]).length > 0 &&
					checkIfCategoryExist[0]._id != ''
				) {
					throw {
						success: false,
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.CATEGORY_ALREADY_EXISTS,
					}
				}

				// Fetch the signed urls from handleEvidenceUpload function
				const evidences = await handleEvidenceUpload(files, userId)
				categoryData['evidences'] = evidences.data

				let projectCategoriesData = await projectCategoriesQueries.create(categoryData)

				if (!projectCategoriesData._id) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROJECT_CATEGORIES_NOT_ADDED,
					}
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROJECT_CATEGORIES_ADDED,
					data: projectCategoriesData._id,
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
	 * list categories
	 * @method
	 * @name list
	 * @returns {Object} category details
	 */

	static list() {
		return new Promise(async (resolve, reject) => {
			try {
				let categoryData = await projectCategoriesQueries.categoryDocuments(
					{
						status: CONSTANTS.common.ACTIVE_STATUS,
					},
					['externalId', 'name', 'icon', 'updatedAt', 'noOfProjects']
				)

				if (!categoryData.length > 0) {
					throw {
						status: HTTP_STATUS_CODE.ok.status,
						message: CONSTANTS.apiResponses.LIBRARY_CATEGORIES_NOT_FOUND,
					}
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROJECT_CATEGORIES_FETCHED,
					data: categoryData,
				})
			} catch (error) {
				return resolve({
					success: false,
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
 * @returns {Array} returns evidences array
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
				// Generate a unique ID for the file upload
				let uniqueId = await UTILS.generateUniqueId()

				// Prepare the request data for the file upload
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

						// Upload evidences to cloud
						const uploadData = await axios.put(fileUploadUrl[0].url, fileFromRequest.data, {
							headers: {
								'x-ms-blob-type': process.env.CLOUD_STORAGE_PROVIDER === 'azure' ? 'BlockBlob' : null,
								'Content-Type': 'multipart/form-data',
							},
						})

						// Throw error if evidence upload fails
						if (!(uploadData.status == 200 || uploadData.status == 201)) {
							throw {
								success: false,
								message: CONSTANTS.apiResponses.FAILED_TO_UPLOAD,
							}
						}
					}
				}

				// Attach sequence number to each evidence.
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
				status: error.status ? error.status : HTTP_STATUS_CODE.internal_server_error.status,
				success: false,
				message: error.message,
				data: {},
			})
		}
	})
}

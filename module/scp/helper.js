/**
 * name : helper.js
 * author : Priyanka Pradeep
 * created-date : 24-Dec-2024
 * Description : Scp functionalities
 */

// Dependencies
const projectTemplateQueries = require(DB_QUERY_BASE_PATH + '/projectTemplates')
const projectTemplateTaskQueries = require(DB_QUERY_BASE_PATH + '/projectTemplateTask')
const projectCategoriesQueries = require(DB_QUERY_BASE_PATH + '/projectCategories')
const scpService = require(GENERICS_FILES_PATH + '/services/scp')

/**
 * SCP Helper
 * @class
 */

module.exports = class ReportsHelper {
	/**
	 * Publish Template and Task
	 * @name publishTemplateAndTasks
	 * @param {Object} templateAndTaskData - Template and task data
	 * @param {String} callBackUrl - Callback URL
	 * @returns {Object} - Result of the operation
	 */

	static publishTemplateAndTasks(templateAndTaskData, callBackUrl) {
		return new Promise(async (resolve, reject) => {
			try {
				// Format the template
				const formattedTemplate = _formatTemplate(templateAndTaskData)
				if (!formattedTemplate.success) {
					throw {
						message: CONSTANTS.apiResponses.FAILED_TO_FORMAT_TEMPLATE,
						status: HTTP_STATUS_CODE.bad_request.status,
					}
				}

				const template = formattedTemplate.template

				// Process Categories
				if (templateAndTaskData.categories?.length > 0) {
					const categoriesResponse = await _getOrCreateCategories(templateAndTaskData.categories)
					if (!categoriesResponse.success) {
						throw {
							message: CONSTANTS.apiResponses.FAILED_TO_FETCH_OR_CREATE_CATEGORIES,
							status: HTTP_STATUS_CODE.bad_request.status,
						}
					}
					template.categories = categoriesResponse.categories
				}

				// Create the template
				const createdTemplate = await projectTemplateQueries.createTemplate(template)
				if (!createdTemplate._id) {
					throw {
						message: CONSTANTS.apiResponses.FAILED_TO_CREATE_TEMPLATE,
						status: HTTP_STATUS_CODE.bad_request.status,
					}
				}

				const { _id: templateId, externalId: templateExternalId } = createdTemplate

				// Assign Sequence Numbers and Create Tasks
				const processedTasks = assignSequenceNumbers(templateAndTaskData.tasks || [])
				const taskCreationResponse = await createTasks(processedTasks, templateId, templateExternalId)
				if (!taskCreationResponse.success) {
					throw {
						message: CONSTANTS.apiResponses.FAILED_TO_CREATE_TASKS,
						status: HTTP_STATUS_CODE.bad_request.status,
					}
				}

				// Update Template with Tasks and Sequence
				const updateResponse = await projectTemplateQueries.findOneAndUpdate(
					{ _id: templateId },
					{
						$set: {
							tasks: taskCreationResponse.taskIds,
							taskSequence: taskCreationResponse.externalIds,
						},
					}
				)

				if (!updateResponse._id) {
					throw {
						message: CONSTANTS.apiResponses.FAILED_TO_UPDATE_TEMPLATE,
						status: HTTP_STATUS_CODE.bad_request.status,
					}
				}

				// Trigger callback url for updating the template id in scp
				let callBackResponse = await scpService.resourcePublishCallBack(
					callBackUrl,
					templateAndTaskData.id,
					templateId
				)
				if (!callBackResponse.success) {
					throw {
						message: CONSTANTS.apiResponses.SCP_CALLBACK_FAILED,
						status: HTTP_STATUS_CODE.bad_request.status,
					}
				}

				// Resolve the promise with success, message, and paginated data.
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROJECT_TEMPLATES_CREATED,
					result: {
						_id: templateId,
					},
				})
			} catch (error) {
				// If an error occurs, resolve the promise with failure and error data.
				return resolve({
					success: false,
					message: error.message,
					data: [],
				})
			}
		})
	}
}

/**
 * Format template data
 * @param {Object} templateData - Template data
 * @returns {Object} - Formatted template
 */
const _formatTemplate = (templateData) => {
	try {
		let template = {
			title: templateData.title,
			description: templateData.objective || '',
			keywords: UTILS.formatKeywords(templateData.keywords),
			isDeleted: false,
			recommendedFor: templateData.recommended_for?.length
				? templateData.recommended_for.map((item) => item.label)
				: [],
			createdBy: templateData.user_id,
			updatedBy: templateData.user_id,
			learningResources: UTILS.convertResources(templateData.learning_resources || []),
			isReusable: true,
			taskSequence: [], // Initially empty
			deleted: false,
			status: CONSTANTS.common.PUBLISHED_STATUS,
			externalId: UTILS.generateExternalId(templateData.title),
			entityType: '',
			metaInformation: UTILS.formatMetaInformation(templateData),
			tasks: [], // Initially empty
		}

		return { success: true, template }
	} catch (error) {
		return { success: false, error: error.message }
	}
}

/**
 * Assign sequence number for task
 * @name assignSequenceNumbers
 * @returns {Object} - Response contains task object
 */
const assignSequenceNumbers = (tasks) => {
	/* Temporory fix start, because elevate-project doent have the observation capability in tasks now */
	// Filter out 'observation' type tasks
	const filteredTasks = tasks.filter((task) => task.type !== 'observation')
	// Sort tasks based on their current sequence number (ascending order)
	filteredTasks.sort((a, b) => a.sequence_no - b.sequence_no)
	let sequenceCounter = 1
	return filteredTasks.map((task) => {
		task.sequence_no = sequenceCounter++ // Reassign sequence number
		return task
	})
	/* Temporory fix end */

	// let sequenceCounter = 1
	// return tasks.map((task) => {
	// 	if (!task.sequence_no) {
	// 		task.sequence_no = sequenceCounter++
	// 	}
	// 	return task
	// })
}

/**
 * Create and Find Categories
 * @name _getOrCreateCategories
 * @param {Object} categories - Categories Data
 * @returns {Object} - Response contains categories data
 */
function _getOrCreateCategories(categories) {
	return new Promise(async (resolve, reject) => {
		try {
			// Validate and format categories
			const formattedCategories = categories.map((category) => {
				if (!category.label || !category.value) {
					throw {
						message: CONSTANTS.apiResponses.CATEGORY_SHOULD_HAVE_LABEL_AND_VALUE,
						status: HTTP_STATUS_CODE.bad_request.status,
					}
				}
				return {
					label: category.label,
					value: category.value,
					formattedName: UTILS.formatToTitleCase(category.value),
					externalId: category.value.replace(/_/g, '').toLowerCase(),
				}
			})

			// Fetch existing categories by externalId
			let existingCategories = []
			const externalIds = formattedCategories.map((cat) => cat.externalId)
			if (externalIds.length > 0) {
				existingCategories =
					(await projectCategoriesQueries.categoryDocuments({
						externalId: { $in: externalIds },
					})) || []
			}

			const existingExternalIds = existingCategories.map((cat) => cat.externalId)

			// Filter and prepare new categories for insertion
			const newCategories = formattedCategories
				.filter((cat) => !existingExternalIds.includes(cat.externalId))
				.map(({ formattedName, externalId, label }) => ({
					createdBy: CONSTANTS.common.SYSTEM,
					updatedBy: CONSTANTS.common.SYSTEM,
					isDeleted: false,
					isVisible: true,
					status: CONSTANTS.common.ACTIVE_STATUS,
					icon: '',
					noOfProjects: 0,
					name: formattedName,
					externalId: externalId,
					label: label,
					createdAt: new Date(),
					updatedAt: new Date(),
				}))

			// Insert new categories if any
			if (newCategories.length > 0) {
				const { insertedIds } = await projectCategoriesQueries.insertMany(newCategories)
				newCategories.forEach((category, index) => {
					category._id = insertedIds[index]
					existingExternalIds.push(category.externalId)
				})
			}

			// Create a lookup object for existing and new categories
			const categoryLookup = {}

			// Populate lookup with existing categories
			existingCategories.forEach((cat) => {
				categoryLookup[cat.externalId] = cat
			})

			// Add new categories to the lookup (overwrite if already exists)
			newCategories.forEach((cat) => {
				categoryLookup[cat.externalId] = cat
			})

			// Map formatted categories to the processed result using the lookup object
			const processedCategories = formattedCategories.map((category) => {
				const cat = categoryLookup[category.externalId]
				return {
					_id: cat._id,
					externalId: cat.externalId,
					name: cat.name,
				}
			})

			return resolve({ success: true, categories: processedCategories })
		} catch (error) {
			return resolve({
				success: false,
				error: error.message || error,
			})
		}
	})
}

/**
 * Create Task
 * @name createTasks
 * @param {Object} tasks - task data
 * @param {String} templateId - template Id
 * @param {String} templateExternalId - template externaldId
 * @param {String} parentId - parentId
 * @returns {Object} - Response contains task data
 */
async function createTasks(tasks, templateId, templateExternalId, parentId = null) {
	const result = { success: false, taskIds: [], externalIds: [], error: null }
	try {
		const taskIds = []
		const externalIds = []

		for (const task of tasks) {
			// Format the task data
			const taskData = {
				name: task.name,
				description: task.name,
				externalId: UTILS.generateExternalId(task.name),
				type: task.type,
				isDeleted: !task.is_mandatory,
				isDeletable: !task.is_mandatory,
				sequenceNumber: task.sequence_no,
				projectTemplateId: templateId,
				projectTemplateExternalId: templateExternalId,
				hasSubTasks: task.children?.length > 0,
				learningResources: UTILS.convertResources(task.learning_resources || []),
				parentId,
				deleted: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			// Create the task
			const taskCreationRes = await projectTemplateTaskQueries.createTemplateTask(taskData)
			// Validate the insertion result
			if (!taskCreationRes._id) {
				throw new Error(`Failed to create task: ${task.name}`)
			}

			const taskId = taskCreationRes._id
			taskIds.push(taskId)
			externalIds.push(taskData.externalId)

			// Recursively handle child tasks
			if (task.children?.length) {
				const childTaskResult = await createTasks(task.children, templateId, templateExternalId, taskId)

				// Validate the child task creation
				if (!childTaskResult.success) {
					throw new Error(
						`Failed to create child tasks for task: ${task.name}. Error: ${childTaskResult.error}`
					)
				}

				// Update task with child task sequence and children
				await projectTemplateTaskQueries.updateTaskDocument(
					{
						_id: taskId,
					},
					{
						$set: {
							children: childTaskResult.taskIds,
							taskSequence: childTaskResult.externalIds,
						},
					}
				)
			}
		}

		result.success = true
		result.taskIds = taskIds
		result.externalIds = externalIds
		return result
	} catch (error) {
		result.error = error.message || error
		return result
	}
}

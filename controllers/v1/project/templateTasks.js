/**
 * name : templateTasks.js
 * author : Aman
 * created-date : 22-July-2020
 * Description : Projects template tasks related information.
 */

// Dependencies
const csv = require('csvtojson')
const projectTemplateTasksHelper = require(MODULES_BASE_PATH + '/project/templateTasks/helper')
const utils = require('@helpers/utils')
const projectQueries = require(DB_QUERY_BASE_PATH + '/projects')
const projectTemplateQueries = require(DB_QUERY_BASE_PATH + '/projectTemplates')
const projectTemplateTaskQueries = require(DB_QUERY_BASE_PATH + '/projectTemplateTask')

/**
 * ProjectTemplateTasks
 * @class
 */

// Helper function to recursively update a task by externalId in a nested tasks array
function updateTaskInTree(tasks, targetExternalId, updateData) {
	for (let i = 0; i < tasks.length; i++) {
		if (tasks[i].externalId === targetExternalId) {
			tasks[i] = { ...tasks[i], ...updateData }
			return true // updated
		}
		if (Array.isArray(tasks[i].children) && tasks[i].children.length > 0) {
			if (updateTaskInTree(tasks[i].children, targetExternalId, updateData)) {
				return true // updated in children
			}
		}
	}
	return false // not found
}

module.exports = class ProjectTemplateTasks extends Abstract {
	/**
	 * @apiDefine errorBody
	 * @apiError {String} status 4XX,5XX
	 * @apiError {String} message Error
	 */

	/**
	 * @apiDefine successBody
	 *  @apiSuccess {String} status 200
	 * @apiSuccess {String} result Data
	 */

	constructor() {
		super('project-template-tasks')
	}

	/**
	 * @api {post} /project/v1/project/templateTasks/bulkCreate/:projectTemplateId
	 * Bulk create project template tasks.
	 * @apiVersion 1.0.0
	 * @apiGroup Project Template Tasks
	 * @apiParam {File} projectTemplateTasks Mandatory project template tasks file of type CSV.
	 * @apiSampleRequest /project/v1/project/templateTasks/bulkCreate/5f2adc57eb351a5a9c68f403
	 * @apiUse successBody
	 * @apiUse errorBody
	 */

	/**
	 * Upload project template tasks
	 * @method
	 * @name bulkCreate
	 * @returns {JSON} returns uploaded project templates.
	 */

	async bulkCreate(req) {
		return new Promise(async (resolve, reject) => {
			try {
				if (!req.files || !req.files.projectTemplateTasks) {
					return resolve({
						message: CONSTANTS.apiResponses.PROJECT_TEMPLATES_TASKS_CSV,
					})
				}

				const templateTasks = await csv().fromString(req.files.projectTemplateTasks.data.toString())
				const projectTemplateId = req.params._id

				// Check if template exists
				const existingTemplate = await database.models.projectTemplates.findOne({ _id: projectTemplateId })
				if (!existingTemplate) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: 'Project template not found',
					})
				}

				const projectTemplateTasks = await projectTemplateTasksHelper.bulkCreate(
					templateTasks,
					req.params._id,
					req.userDetails.userInformation.userId
				)

				return resolve(projectTemplateTasks)
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
	 * @api {post} /project/v1/project/templateTasks/bulkUpdate/:projectTemplateId
	 * Bulk update project template tasks.
	 * @apiVersion 1.0.0
	 * @apiGroup Project Template Tasks
	 * @apiParam {File} projectTemplateTasks Mandatory project template tasks file of type CSV.
	 * @apiSampleRequest /project/v1/project/templateTasks/bulkUpdate/5f2adc57eb351a5a9c68f403
	 * @apiUse successBody
	 * @apiUse errorBody
	 */

	/**
	 * Upload project template tasks
	 * @method
	 * @name bulkUpdate
	 * @returns {JSON} returns uploaded project templates.
	 */

	async bulkUpdate(req) {
		return new Promise(async (resolve, reject) => {
			try {
				if (!req.files || !req.files.projectTemplateTasks) {
					return resolve({
						message: CONSTANTS.apiResponses.PROJECT_TEMPLATES_TASKS_CSV,
					})
				}

				const templateTasks = await csv().fromString(req.files.projectTemplateTasks.data.toString())

				const projectTemplateTasks = await projectTemplateTasksHelper.bulkUpdate(
					templateTasks,
					req.params._id,
					req.userDetails.userInformation.userId
				)

				return resolve(projectTemplateTasks)
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
    * @api {post} /project/v1/project/templateTasks/update/:taskId 
    * Update projects template.
    * @apiVersion 1.0.0
    * @apiGroup Project Template Tasks
    * @apiSampleRequest /project/v1/project/templateTasks/update/6006b5cca1a95727dbcdf648
    * @apiHeader {String} internal-access-token internal access token 
    * @apiHeader {String} X-authenticated-user-token Authenticity token  
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "status": 200,
        "message": "template task updated successfully"
      }
    */

	/**
	 * Update project templates task
	 * @method
	 * @name update
	 * @returns {JSON} returns uploaded project template task.
	 */

	async update(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let projectTemplateTask = await projectTemplateTasksHelper.update(
					req.params._id,
					req.body,
					req.userDetails.userInformation.userId
				)

				projectTemplateTask.result = projectTemplateTask.data

				return resolve(projectTemplateTask)
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
	 * @api {post} /project/v1/project/templateTasks/bulkCreateJson/:projectTemplateId
	 * Bulk create project template tasks using JSON.
	 * @apiVersion 1.0.0
	 * @apiGroup Project Template Tasks
	 * @apiParam {Object[]} tasks Array of task objects.
	 * @apiParam {String} tasks.externalId Mandatory external ID of the task.
	 * @apiParam {String} tasks.name Mandatory name of the task.
	 * @apiParam {String} tasks.type Type of task (CONTENT/ASSESSMENT/OBSERVATION/IMPROVEMENT_PROJECT).
	 * @apiParam {String} [tasks.hasAParentTask] Whether task has a parent (YES/NO).
	 * @apiParam {String} [tasks.parentTaskId] ID of parent task if hasAParentTask is YES.
	 * @apiParam {String} [tasks.solutionId] Solution ID if task type requires it.
	 * @apiParam {String} [tasks.solutionType] Type of solution if task type requires it.
	 * @apiParam {String} [tasks.solutionSubType] Subtype of solution if task type requires it.
	 * @apiParam {Boolean} [tasks.isDeletable] Whether task can be deleted.
	 * @apiSampleRequest /project/v1/project/templateTasks/bulkCreateJson/5f2adc57eb351a5a9c68f403
	 * @apiUse successBody
	 * @apiUse errorBody
	 */

	/**
	 * Bulk create project template tasks using JSON
	 * @method
	 * @name bulkCreateJson
	 * @returns {JSON} returns created project template tasks.
	 */

	async bulkCreateJson(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let tasks = req.body.tasks
				let projectId = req.params._id
				let userId = req.userDetails.id

				// Get projectTemplateId from project document
				const project = await projectQueries.projectDocument({ _id: projectId })
				if (!project) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: 'Project not found',
					})
				}
				const projectTemplateId = project[0].projectTemplateId
				console.log('projectTemplateId', projectTemplateId)
				// Validate all task dates
				const validation = utils.validateAllTaskDates(tasks)
				if (!validation.isValid) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: validation.message,
					})
				}

				let result = await projectTemplateTasksHelper.bulkCreateJson(
					tasks,
					projectTemplateId,
					userId,
					projectId
				)
				return resolve(result)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * @api {post} /project/v1/project/templateTasks/updateTask/:projectId?externalId=externalIdValue
	 * Update a project template task and its corresponding project task.
	 * @apiVersion 1.0.0
	 * @apiGroup Project Template Tasks
	 * @apiParam {String} projectId Project ID (URL param)
	 * @apiParam {String} externalId Task external ID (query param)
	 * @apiParam {Object} body Fields to update (same as create)
	 * @apiUse successBody
	 * @apiUse errorBody
	 * @apiSampleRequest /project/v1/project/templateTasks/updateTask/5f2adc57eb351a5a9c68f403?externalId=task-1
	 */

	/**
	 * Update a project template task and its corresponding project task
	 * @method
	 * @name updateTask
	 * @returns {JSON} returns updated project template task and project task.
	 */

	async updateTask(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const projectId = req.params._id
				const externalId = req.query.externalId
				const updateData = req.body
				const userId = req.userDetails.userInformation?.userId || req.userDetails.id

				if (!projectId || !externalId) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: 'projectId and externalId are required',
					})
				}

				// Validate project
				const projectArr = await projectQueries.projectDocument({ _id: projectId })
				if (!projectArr || !projectArr.length) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: 'Project not found',
					})
				}
				const project = projectArr[0]
				const projectTemplateId = project.projectTemplateId

				// Fetch the template task by externalId and projectTemplateId
				const templateTasks = await projectTemplateTasksHelper.getTasksByExternalIdAndTemplateId(
					externalId,
					projectTemplateId
				)
				if (!templateTasks || !templateTasks.length) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: 'Template task not found',
					})
				}
				const templateTask = templateTasks[0]

				// Update the template task
				await projectTemplateTasksHelper.update(templateTask._id, updateData, userId)

				// Update the corresponding task in the project document using externalId
				const projectTasks = project.tasks || []
				const updated = updateTaskInTree(projectTasks, externalId, updateData)
				if (!updated) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: 'Task not found in project',
					})
				}

				await projectQueries.findOneAndUpdate(
					{ _id: projectId },
					{ $set: { tasks: projectTasks, updatedAt: new Date() } }
				)

				return resolve({
					status: HTTP_STATUS_CODE.ok.status,
					message: 'Task updated successfully',
					result: {
						templateTaskId: templateTask._id,
						projectId: projectId,
						externalId: externalId,
					},
				})
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
	 * @api {delete} /project/v1/project/templateTasks/delete/:projectId
	 * Delete project and associated template tasks.
	 * @apiVersion 1.0.0
	 * @apiGroup Project Template Tasks
	 * @apiParam {String} projectId Project ID (URL param)
	 * @apiSampleRequest /project/v1/project/templateTasks/delete/5f2adc57eb351a5a9c68f403
	 * @apiUse successBody
	 * @apiUse errorBody
	 */

	/**
	 * Delete project and associated template tasks
	 * @method
	 * @name delete
	 * @returns {JSON} returns deletion status
	 */

	async delete(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const projectId = req.params._id

				if (!projectId) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: 'Project ID is required',
					})
				}

				// Get project document to check status and get template ID
				const projectArr = await projectQueries.projectDocument({ _id: projectId })
				if (!projectArr || !projectArr.length) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: 'Project not found',
					})
				}

				const project = projectArr[0]

				// Check if any task has been started
				const hasStartedTasks =
					project.tasks &&
					project.tasks.some((task) => task.status && task.status !== CONSTANTS.common.NOT_STARTED_STATUS)

				if (hasStartedTasks) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: 'Cannot delete project with started tasks',
					})
				}

				const projectTemplateId = project.projectTemplateId
				const solutionId = project.solutionId
				const programId = project.programId

				// 1. Delete project document
				await database.models.projects.deleteOne({ _id: projectId })

				// 2. Get project template to fetch task IDs
				const projectTemplate = await database.models.projectTemplates.findOne({ _id: projectTemplateId })
				if (projectTemplate && projectTemplate.tasks && projectTemplate.tasks.length > 0) {
					const taskIds = projectTemplate.tasks.map((task) => task)

					// Delete specific template tasks
					await database.models.projectTemplateTasks.deleteMany({
						_id: { $in: taskIds },
					})

					// Also delete any tasks that might be marked as deleted
					await database.models.projectTemplateTasks.deleteMany({
						_id: { $in: taskIds },
						isDeleted: true,
					})

					// Clear the tasks array in the template
					await database.models.projectTemplates.updateOne(
						{ _id: projectTemplateId },
						{ $set: { tasks: [] } }
					)

					// Delete any remaining tasks for this template
					await database.models.projectTemplateTasks.deleteMany({
						projectTemplateId,
					})
				}

				// 3. Delete project template and any related templates
				const relatedTemplates = await database.models.projectTemplates.find({
					$or: [
						{ _id: projectTemplateId },
						{ externalId: projectTemplate?.externalId },
						{ title: projectTemplate?.title },
					],
				})

				// Delete all related templates
				for (const template of relatedTemplates) {
					await database.models.projectTemplates.deleteOne({ _id: template._id })
				}

				// 4. Delete solution if exists
				if (solutionId) {
					await database.models.solutions.deleteOne({ _id: solutionId })
				}

				// 5. Delete program if exists
				if (programId) {
					await database.models.programs.deleteOne({ _id: programId })
				}

				return resolve({
					status: HTTP_STATUS_CODE.ok.status,
					message: 'Project and associated data deleted successfully',
					result: {
						projectId: projectId,
						projectTemplateId: projectTemplateId,
						solutionId: solutionId || null,
						programId: programId || null,
					},
				})
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}
}

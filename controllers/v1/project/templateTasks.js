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

/**
 * ProjectTemplateTasks
 * @class
 */

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
}

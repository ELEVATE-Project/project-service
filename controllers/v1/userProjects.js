/**
 * name : userProjects.js
 * author : Aman
 * created-date : 20-July-2020
 * Description : User Projects related information.
 */

// Dependencies
const userProjectsHelper = require(MODULES_BASE_PATH + '/userProjects/helper')

/**
 * UserProjects
 * @class
 */

module.exports = class UserProjects extends Abstract {
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
		super('projects')
	}

	static get name() {
		return 'userProjects'
	}

	/**
    * @api {post} /project/v1/userProjects/sync/:projectId?lastDownloadedAt=:epochTime 
    * Sync project.
    * @apiVersion 1.0.0
    * @apiGroup User Projects
    * @apiSampleRequest /project/v1/userProjects/sync/5f731631e8d7cd3b88ac0659?lastDownloadedAt=0125747659358699520
    * @apiParamExample {json} Request:
    * {
        "title": "Project 1",
        "description": "Project 1 description",
        "tasks": [
            {
                "_id": "289d9558-b98f-41cf-81d3-92486f114a49",
                "name": "Task 1",
                "description": "Task 1 description",
                "status": "notStarted/inProgress/completed",
                "isACustomTask": false
                "startDate": "2020-09-29T09:08:41.667Z",
                "endDate": "2020-09-29T09:08:41.667Z",
                "lastModifiedAt": "2020-09-29T09:08:41.667Z",
                "type": "single/multiple",
                “isDeleted” : false,
                “attachments” : [
                {
                    "name" : "download(2).jpeg",
                    "type" : "image/jpeg",
                    "sourcePath" : "projectId/userId/imageName"
                }
                ],
                “remarks” : “Tasks completed”,
                “assignee” : “Aman”,
                "children": [
                    {
                        "_id": "289d9558-b98f-41cf-81d3-92486f114a50",
                        "name": "Task 2",
                        "description": "Task 2 description",
                        "status": "notStarted/inProgress/completed",
                        "children": [],
                        "isACustomTask": false,
                        "startDate": "2020-09-29T09:08:41.667Z",
                        "endDate": "2020-09-29T09:08:41.667Z",
                        "lastModifiedAt": "2020-09-29T09:08:41.667Z",
                        "type": "single/multiple”,
                        “isDeleted” : false
                    }
                ]
            }
        ],
    
        "programId": "",
        "programName": "New Project Program",
        "entityId" : “5beaa888af0065f0e0a10515”,
        "categories": [
            {
                "value": "5f102331665bee6a740714e8",
                "label": "teacher"
            },
            {
                "value": "",
                "label": "other"
            }
        ],
        "status": "notStarted/inProgress/completed",
        “lastDownloadedAt” : "2020-09-29T09:08:41.667Z",
        "payload": {
            "_id": "289d9558-b98f-41cf-81d3-92486f114a51"
        }
    }
    * @apiParamExample {json} Response:
    * {
    * "message": "Project updated successfully",
    * "status": 200,
    * "result" : {
    *   "programId" : "5fb669f223575a2f0cef3b33"
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

	/**
	 * Sync projects.
	 * @method
	 * @name sync
	 * @param {Object} req - request data.
	 * @param {String} req.params._id - Project id.
	 * @returns {JSON} Create Self projects.
	 */

	async sync(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let createdProject = await userProjectsHelper.sync(
					req.params._id,
					req.query.lastDownloadedAt,
					req.body,
					req.userDetails.userInformation.userId,
					req.userDetails.userToken,
					req.headers['x-app-id'] ? req.headers['x-app-id'] : req.headers.appname ? req.headers.appname : '',
					req.headers['x-app-ver']
						? req.headers['x-app-ver']
						: req.headers.appversion
						? req.headers.appversion
						: ''
				)
				return resolve(createdProject)
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
    * @api {post} /project/v1/userProjects/details/:projectId?programId=&solutionId=&templateId=TSCSLHAR02-1710148664591
    * Project Details.
    * @apiVersion 2.0.0
    * @apiGroup User Projects
    * @apiSampleRequest /project/v1/userProjects/details/5f731631e8d7cd3b88ac0659&programId=5f4e538bdf6dd17bab708173&solutionId=5f8688e7d7f86f040b77f460&templateId=IDEAIMP4
    * @apiParamExample {json} Request:
    {
        "userRole": "DEO",
        "externalId" : "TSCSLHAR02-1710148664591",
        "createdFor": [
            "0126796199493140480"
        ],
        "status": "completed",
        "isDeleted": false,
        "description": "Come See Our School!- Parent Mela vishwa",
        "title": "Come See Our School!- Parent Mela",
        "metaInformation": {
            "rationale": "",
            "primaryAudience": [
                "Community"
            ],
            "goal": "Organizing the Parent Mela in the school in order to make better community reach",
            "duration": "At the end of every quarter",
            "successIndicators": "",
            "risks": "",
            "approaches": ""
        },
        "isAPrivateProgram": false,
        "hasAcceptedTAndC": false,
        "entityId":"a4268dc5-61c3-4eab-9a89-ffaaee809147"
    }
    * @apiParamExample {json} Response:
    * {
    "message": "Successfully fetched project details",
    "status": 200,
    "result": {
        "_id": "5f97d2f6bf3a3b1c0116c80a",
        "status": "notStarted",
        "isDeleted": false,
        "categories": [
            {
                "_id": "5f102331665bee6a740714e8",
                "name": "Teachers",
                "externalId": "teachers"
            },
            {
                "name": "newCategory",
                "externalId": "",
                "_id": ""
            }
        ],
        "tasks": [
            {
                "_id": "289d9558-b98f-41cf-81d3-92486f114a49",
                "name": "Task 1",
                "description": "Task 1 description",
                "status": "notStarted",
                "isACustomTask": false,
                "startDate": "2020-09-29T09:08:41.667Z",
                "endDate": "2020-09-29T09:08:41.667Z",
                "lastModifiedAt": "2020-09-29T09:08:41.667Z",
                "type": "single",
                "isDeleted": false,
                "attachments": [
                    {
                        "name": "download(2).jpeg",
                        "type": "image/jpeg",
                        "sourcePath": "projectId/userId/imageName"
                    }
                ],
                "remarks": "Tasks completed",
                "assignee": "Aman",
                "children": [
                    {
                        "_id": "289d9558-b98f-41cf-81d3-92486f114a50",
                        "name": "Task 2",
                        "description": "Task 2 description",
                        "status": "notStarted",
                        "children": [],
                        "isACustomTask": false,
                        "startDate": "2020-09-29T09:08:41.667Z",
                        "endDate": "2020-09-29T09:08:41.667Z",
                        "lastModifiedAt": "2020-09-29T09:08:41.667Z",
                        "type": "single",
                        "isDeleted": false,
                        "externalId": "task 2",
                        "isDeleteable": false,
                        "createdAt": "2020-10-28T05:58:24.907Z",
                        "updatedAt": "2020-10-28T05:58:24.907Z",
                        "isImportedFromLibrary": false
                    }
                ],
                "externalId": "task 1",
                "isDeleteable": false,
                "createdAt": "2020-10-28T05:58:24.907Z",
                "updatedAt": "2020-10-28T05:58:24.907Z",
                "isImportedFromLibrary": false
            }
        ],
        "resources": [],
        "deleted": false,
        "lastDownloadedAt": "2020-09-29T09:08:41.667Z",
        "__v": 0,
        "description": "Project 1 description"
    }
    }
    * @apiUse successBody
    * @apiUse errorBody
    */

	/**
	 * Project details
	 * @method
	 * @name details
	 * @param {Object} req - request data.
	 * @param {String} req.params._id - Project id.
	 * @returns {JSON} Create Self projects.
	 */

	async details(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let projectDetails = await userProjectsHelper.detailsV2(
					req.params._id ? req.params._id : '',
					req.query.solutionId,
					req.userDetails.userInformation.userId,
					req.userDetails.userToken,
					req.body,
					req.headers['x-app-id'] ? req.headers['x-app-id'] : req.headers.appname ? req.headers.appname : '',
					req.headers['x-app-ver']
						? req.headers['x-app-ver']
						: req.headers.appversion
						? req.headers.appversion
						: '',
					req.query.templateId
				)

				return resolve(projectDetails)
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
    * @api {post} /project/v1/userProjects/tasksStatus/:projectId
    * User Project tasks status
    * @apiVersion 1.0.0
    * @apiGroup User Projects
    * @apiSampleRequest /project/v1/userProjects/tasksStatus/5f731631e8d7cd3b88ac0659
    * @apiParamExample {json} Request:
    * {
    *   "taskIds" : [
           "2f2ef6dd-24e9-40ab-a681-3b3167fcd2c6",
           "a18ae088-fa11-4ff4-899f-213abefb30f6"
       ]
     }
    * @apiParamExample {json} Response:
    {
    "message": "Tasks status fetched successfully",
    "status": 200,
    "result": [
        {
            "type": "assessment",
            "status": "started",
            "_id": "2f2ef6dd-24e9-40ab-a681-3b3167fcd2c6"
        },
        {
            "type": "observation",
            "status": "started",
            "_id": "a18ae088-fa11-4ff4-899f-213abefb30f6",
            "submissionId": "5fbaa71d97ccef111cbb4ee0"
        }
    ]
    }
    * @apiUse successBody
    * @apiUse errorBody
    */

	/**
	 * Tasks status
	 * @method
	 * @name tasksStatus
	 * @param {Object} req - request data.
	 * @param {String} req.params._id - Project id.
	 * @returns {JSON} status of tasks
	 */

	async tasksStatus(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let taskStatus = await userProjectsHelper.tasksStatus(req.params._id, req.body.taskIds)

				taskStatus.result = taskStatus.data

				return resolve(taskStatus)
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
    * @api {post} /project/v1/userProjects/solutionDetails/:projectId?taskId=:taskId
    * User project solution details
    * @apiVersion 1.0.0
    * @apiGroup User Projects
    * @apiSampleRequest /project/v1/userProjects/solutionDetails/5fba54dc5bf46b25a926bee5?taskId=347400e7-8a62-4dad-bc24-af7c5bd70ad1
    * @apiParamExample {json} Request:
    {
        "role" : "HM,DEO",
        "state" : "236f5cff-c9af-4366-b0b6-253a1789766a",
        "district" : "1dcbc362-ec4c-4559-9081-e0c2864c2931",
        "school" : "c5726207-4f9f-4f45-91f1-3e9e8e84d824"
    }
    * @apiParamExample {json} Response:
    * {
    "message" : "Solutions details fetched successfully",
    "status": 200,
    "result": {
        "entityId": "5beaa888af0065f0e0a10515",
        "programId": "5fba54dc2a1f7b172f066597",
        "observationId": "5d1a002d2dfd8135bc8e1617",
        "solutionId": "5d15b0d7463d3a6961f91749"
        “solutionDetails”:{
            "_id" : "60b06e30343385596ef48c25",
            "isReusable" : false,
            "externalId" : "NEW-TEST-SOLUTION",
            "name" : "NEW-TEST-SOLUTION",
            "programId" : "600ab53cc7de076e6f993724",
            "type" : "observation",
            "subType" : "district",
            "isRubricDriven" : true,
            "criteriaLevelReport" : "",
            "allowMultipleAssessemts" : false,
            "scoringSystem": ""
        }

    }
    }
    * @apiUse successBody
    * @apiUse errorBody
    */

	/**
	 * Solutions details information.
	 * @method
	 * @name status
	 * @param {Object} req - request data.
	 * @param {String} req.params._id - Project id.
	 * @param {String} req.query.taskId - task id.
	 * @returns {JSON} Solutions details
	 */

	async solutionDetails(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let solutionDetails = await userProjectsHelper.solutionDetails(
					req.userDetails.userToken,
					req.params._id,
					req.query.taskId,
					req.body
				)

				solutionDetails.result = solutionDetails.data

				return resolve(solutionDetails)
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
    * @api {post} /project/v1/userProjects/add
    * Add project.
    * @apiVersion 1.0.0
    * @apiGroup User Projects
    * @apiSampleRequest /project/v1/userProjects/add
    * @apiParamExample {json} Request:
    * {
        "title": "Project 1",
        "description": "Project 1 description",
        "tasks": [
            {
                "_id": "289d9558-b98f-41cf-81d3-92486f114a49",
                "name": "Task 1",
                "description": "Task 1 description",
                "status": "notStarted/inProgress/completed",
                "startDate": "2020-09-29T09:08:41.667Z",
                "endDate": "2020-09-29T09:08:41.667Z",
                "lastModifiedAt": "2020-09-29T09:08:41.667Z",
                "type": "single/multiple",
                “isDeleted” : false,
                “remarks” : “Tasks completed”,
                “assignee” : “Aman”,
                "children": [
                    {
                        "_id": "289d9558-b98f-41cf-81d3-92486f114a50",
                        "name": "Task 2",
                        "description": "Task 2 description",
                        "status": "notStarted/inProgress/completed",
                        "children": [],
                        "startDate": "2020-09-29T09:08:41.667Z",
                        "endDate": "2020-09-29T09:08:41.667Z",
                        "lastModifiedAt": "2020-09-29T09:08:41.667Z",
                        "type": "single/multiple”,
                        “isDeleted” : false
                    }
                ]
            }
        ],
        "programId": "",
        "programName": "New Project Program",
        "entityId" : “5beaa888af0065f0e0a10515”,
        "categories": [
            {
                "value": "5f102331665bee6a740714e8",
                "label": "teacher"
            },
            {
                "value": "",
                "label": "other"
            }
        ],
        "status": "notStarted/inProgress/completed",
        “lastDownloadedAt” : "2020-09-29T09:08:41.667Z",
        "payload": {
            "_id": "289d9558-b98f-41cf-81d3-92486f114a51"
        },
        "profileInformation" : {
            "role" : "HM,DEO",
            "state" : "236f5cff-c9af-4366-b0b6-253a1789766a",
            "district" : "1dcbc362-ec4c-4559-9081-e0c2864c2931",
            "school" : "c5726207-4f9f-4f45-91f1-3e9e8e84d824"
        }
    }
    * @apiParamExample {json} Response:
    * {
    *   "message": "Project created successfully",
    *   "status": 200,
    *   "result" : {
    *       "programId" : "5fb669f223575a2f0cef3b33"
    *       "projectId" : "5f102331665bee6a740714e8"
    *   }
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

	/**
	 * Add projects.
	 * @method
	 * @name add
	 * @param {Object} req - request data.
	 * @returns {JSON} Create Self projects.
	 */

	async add(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let createdProject = await userProjectsHelper.add(
					req.body,
					req.userDetails.userInformation.userId,
					req.userDetails.userToken,
					req.headers['x-app-id'] ? req.headers['x-app-id'] : req.headers.appname ? req.headers.appname : '',
					req.headers['x-app-ver']
						? req.headers['x-app-ver']
						: req.headers.appversion
						? req.headers.appversion
						: ''
				)

				return resolve(createdProject)
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
    * @api {get} /project/v1/userProjects/userAssigned?page=:page&limit=:limit&search=:search&filter=:assignedToMe
    * List of user assigned project.
    * @apiVersion 1.0.0
    * @apiGroup User Projects
    * @apiSampleRequest /project/v1/userProjects/userAssigned?page=1&limit=10
    * @apiParamExample {json} Response:
    * {
    "message": "User project fetched successfully",
    "status": 200,
    "result": {
        "data": [
            {
                "_id": "6049c282348d1b060c6454b7",
                "solutionId": "6049c277f026c305dd471769",
                "programId": "6049c275f026c305dd471768",
                "name": "TEST TITLE",
                "programName": "NEW",
                "externalId": "01c04166-a65e-4e92-a87b-a9e4194e771d-1615446645973",
                "type": "improvementProject"
            }
        ],
        "count": 1
    }}

    /**
      * List of user assigned projects.
      * @method
      * @name userAssigned
      * @param {Object} req - request data.
      * @returns {JSON} List of user assigned projects.
     */

	async userAssigned(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let projects = await userProjectsHelper.userAssigned(
					req.userDetails.userInformation.userId,
					req.pageSize,
					req.pageNo,
					req.searchText,
					req.query.filter
				)

				projects.result = projects.data

				return resolve(projects)
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
	 * @api {get} /project/v1/userProjects/share/:projectId?tasks=:taskId1,:taskId2
	 * Share project and task pdf report.
	 * @apiVersion 1.0.0
	 * @apiGroup User Projects
	 * @apiSampleRequest /project/v1/userProjects/share/6065ced7e9259b7f0b1f5d66?tasks=4d074de7-7059-4d99-9da9-452b0d32e081
	 * @apiParamExample {json} Response:
	 * {
	 * "message": "Report generated succesfully",
	 * "status": 200,
	 * "result" : {
	 *   "data" : {
	 *      "downloadUrl": "http://localhost:4700/dhiti/api/v1/observations/pdfReportsUrl?id=dG1wLzVhNzZjMTY5LTA5YjAtNGU3Zi04ZmNhLTg0NDc5ZmI2YTNiNC0tODUyOA=="
	 * }
	 * }
	 * }
	 * @apiUse successBody
	 * @apiUse errorBody
	 */

	/*
	 * Share project and task pdf report.
	 * @method
	 * @name share
	 * @param {Object} req - request data.
	 * @param {String} req.params._id - projectId
	 * @returns {JSON} Downloadable pdf url.
	 */

	async share(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let taskIds = req.query.tasks ? req.query.tasks.split(',') : []

				let report = await userProjectsHelper.share(
					req.params._id,
					taskIds,
					req.userDetails.userInformation.userId,
					req.headers['x-app-ver']
				)
				return resolve(report)
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
    * @api {get} /project/v1/userProjects/importedProjects/:programId
    * @apiVersion 1.0.0
    * @apiGroup Lists of User Imported Projects
    * @apiSampleRequest /project/v1/userProjects/importedProjects/60545d541fc23d6d2d44c0c9
    * @apiParamExample {json} Response:
    {
    "message": "List of imported projects fetched",
    "status": 200,
    "result": [
        {
            "_id": "60793b80bd49095a19ddeae1",
            "description": "",
            "title": "Project with learning resources",
            "projectTemplateId": "60546a4cb807066d9cddba21",
            "programInformation": {
                "_id": "60545d541fc23d6d2d44c0c9",
                "externalId": "PGM-3542-3.8.0_testing_program-2",
                "description": "3.8.0 testing program - 2",
                "name": "3.8.0 testing program - 2"
            },
            "solutionInformation": {
                "_id": "605468721fc23d6d2d44c0cb",
                "externalId": "IMP-3542_solution2",
                "description": "",
                "name": "Project with learning resources"
            }
        }
    ]}
    * @apiUse successBody
    * @apiUse errorBody
    */

	/*
	 * List of user imported projects
	 * @method
	 * @name importedProjects
	 * @returns {JSON} List of imported projects.
	 */

	async importedProjects(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let importedProjects = await userProjectsHelper.importedProjects(
					req.userDetails.userInformation.userId,
					req.params._id ? req.params._id : ''
				)

				importedProjects['result'] = importedProjects['data']

				return resolve(importedProjects)
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
   * @api {post} /project/v1/userProjects/list?page=1&limit=3&search=&filter=createdByMe
   * Lists of projects.
   * @apiVersion 0.0.1
   * @apiName Lists of projects.
   * @apiGroup Entity Types
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /project/v1/userProjects/list
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Request-Body:
   * {
        "query" : {
            "code" : "HM"
        },
        "projection" : ["_id","code"]
    }
    * @apiParamExample {json} Response: 
    {
        "message": "Successfully fetched projects",
        "status": 200,
        "result": [
            {
                "_id": "64afa1b280f9b952f4914374",
                "userId": "64b12ef31073b0dd429e19b4",
                "userRole": "",
                "status": "started",
                "isDeleted": false,
                "categories": [
                    {
                        "label": "Infrastructure",
                        "value": "5fcfa9a2457d6055e33843f1",
                        "labelTranslations": "{\"en\":\"Infrastructure\"}",
                        "name": "Infrastructure"
                    },
                    {
                        "label": "Community",
                        "value": "5fcfa9a2457d6055e33843f2",
                        "labelTranslations": "{\"en\":\"Community\"}",
                        "name": "Community"
                    },
                    {
                        "label": "Education Leader",
                        "value": "5fcfa9a2457d6055e33843f3",
                        "labelTranslations": "{\"en\":\"Education Leader\"}",
                        "name": "Education Leader"
                    }
                ],
                "createdBy": "1349b70e-44d2-4723-9f57-caf096ec1f51",
                "tasks": [],
                "updatedBy": "1349b70e-44d2-4723-9f57-caf096ec1f51",
                "learningResources": [
                    {
                        "name": "API_Decrication",
                        "id": "do_113759904287850496114",
                        "isChecked": true
                    },
                    {
                        "name": "API_Decrication",
                        "id": "do_113759897196249088113",
                        "isChecked": true
                    },
                    {
                        "name": "Content - 3",
                        "id": "do_113762457976889344169",
                        "isChecked": true
                    },
                    {
                        "name": "Content - 4",
                        "id": "do_113762458251059200170",
                        "isChecked": true
                    },
                    {
                        "name": "Content -1",
                        "id": "do_113762457386450944167",
                        "isChecked": true
                    },
                    {
                        "name": "Test Content",
                        "id": "do_11376182093890355216",
                        "isChecked": true
                    },
                    {
                        "name": "Test Content 2",
                        "id": "do_11376182438513868818",
                        "isChecked": true
                    }
                ],
                "hasAcceptedTAndC": false,
                "taskSequence": [],
                "recommendedFor": [],
                "attachments": [],
                "deleted": false,
                "title": "Test",
                "description": "test",
                "startDate": "2023-05-24T04:21:00.000Z",
                "endDate": "2023-05-27T04:21:00.000Z",
                "entityId": "7f6d36cf-3bd6-43fc-ab8e-f9157c9ebec1",
                "isAPrivateProgram": true,
                "lastDownloadedAt": "2023-07-13T07:03:14.672Z",
                "updatedAt": "2023-07-13T07:03:14.688Z",
                "createdAt": "2023-07-13T07:03:14.688Z",
                "__v": 0
            }
        ]
    }   
    */

	/**
	 * Lists of projects.
	 * @method
	 * @name list
	 * @returns {JSON} List projects.
	 */

	async list(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let projects = await userProjectsHelper.list(
					req.userDetails.userInformation.userId,
					req.pageNo,
					req.pageSize,
					req.searchText,
					req.query.filter
				)
				return resolve(projects)
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
    * @api {post} /project/v1/userProjects/importFromLibrary/:projectTemplateId&isATargetedSolution=false
    * Import project from library.
    * @apiVersion 1.0.0
    * @apiGroup User Projects
    * @apiSampleRequest /project/v1/userProjects/importFromLibrary/5f5b32cef16777642d51aaf0
    * @apiParamExample {json} Request:
    * {
        "programId" : "",
        "programName" : "My Program",
        "rating" : 2
    }
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully fetched projects",
        "status": 200,
        "result": {
            "userId": "01c04166-a65e-4e92-a87b-a9e4194e771d",
            "isDeleted": false,
            "categories": [
                {
                    "_id": "5f102331665bee6a740714eb",
                    "externalId": "community",
                    "name": "Community"
                }
            ],
            "createdBy": "01c04166-a65e-4e92-a87b-a9e4194e771d",
            "tasks": [
                {
                    "_id": "61d6690d-82cb-4db2-8191-8dd945c5e742",
                    "isDeleted": false,
                    "isDeletable": false,
                    "taskSequence": [],
                    "children": [
                        {
                            "_id": "b5068cef-eefc-4f43-8a29-ab9c2268f451",
                            "isDeleted": false,
                            "isDeletable": false,
                            "taskSequence": [],
                            "children": [],
                            "visibleIf": [
                                {
                                    "operator": "===",
                                    "_id": "5f72f9998925ec7c60f79a91",
                                    "value": "started"
                                }
                            ],
                            "deleted": false,
                            "type": "single",
                            "projectTemplateId": "5f5b32cef16777642d51aaf0",
                            "name": "Sub task 1",
                            "externalId": "Sub-task-1",
                            "description": "Sub-Task-1-Description",
                            "updatedAt": "2020-09-29T09:08:41.681Z",
                            "createdAt": "2020-09-29T09:08:41.675Z",
                            "__v": 0,
                            "status": "notStarted"
                        },
                        {
                            "_id": "988ef20f-267f-4bed-9a38-9d7dc6a320e9",
                            "isDeleted": false,
                            "isDeletable": false,
                            "taskSequence": [],
                            "children": [],
                            "visibleIf": [
                                {
                                    "operator": "===",
                                    "_id": "5f72f9998925ec7c60f79a91",
                                    "value": "started"
                                }
                            ],
                            "deleted": false,
                            "type": "single",
                            "projectTemplateId": "5f5b32cef16777642d51aaf0",
                            "name": "Sub task 2",
                            "externalId": "Sub-task-2",
                            "description": "Sub-Task-2-Description",
                            "updatedAt": "2020-09-29T09:08:41.693Z",
                            "createdAt": "2020-09-29T09:08:41.689Z",
                            "__v": 0,
                            "status": "notStarted"
                        }
                    ],
                    "visibleIf": [],
                    "deleted": false,
                    "type": "multiple",
                    "projectTemplateId": "5f5b32cef16777642d51aaf0",
                    "name": "Task 1",
                    "externalId": "task-1",
                    "description": "Task-1 Description",
                    "updatedAt": "2020-09-29T09:08:41.691Z",
                    "createdAt": "2020-09-29T09:08:41.612Z",
                    "__v": 0,
                    "status": "notStarted"
                },
                {
                    "_id": "289d9558-b98f-41cf-81d3-92486f114a49",
                    "isDeleted": false,
                    "isDeletable": false,
                    "taskSequence": [],
                    "children": [],
                    "visibleIf": [],
                    "deleted": false,
                    "type": "single",
                    "projectTemplateId": "5f5b32cef16777642d51aaf0",
                    "name": "Task 12",
                    "externalId": "Task-12",
                    "description": "Task-1 Description",
                    "updatedAt": "2020-09-29T09:08:41.667Z",
                    "createdAt": "2020-09-29T09:08:41.667Z",
                    "__v": 0,
                    "status": "notStarted"
                }
            ],
            "updatedBy": "01c04166-a65e-4e92-a87b-a9e4194e771d",
            "_id": "5f731d68920a8c3e092e6e4c",
            "deleted": false,
            "name": "Test-2",
            "description": "improving school library",
            "status": "notStarted",
            "updatedAt": "2020-09-29T11:41:28.656Z",
            "createdAt": "2020-09-11T08:18:22.077Z",
            "__v": 0,
            "solutionInformation": {
                "externalId": "01c04166-a65e-4e92-a87b-a9e4194e771d-1601379673400"
            },
            "programInformation": {
                "externalId": "My Program-1601379673400",
                "name": "My Program"
            },
            "taskReport": {},
            "entityInformation": {},
            "rationale": "sample",
            "primaryAudience": [
                "teachers",
                "head master"
            ]
        }
    }
    * @apiUse successBody
    * @apiUse errorBody
    */

	/**
	 * Import project from library.
	 * @method
	 * @name importFromLibrary
	 * @param {Object} req - request data.
	 * @param {String} req.params._id - project Template Id.
	 * @returns {JSON} import project from library.
	 */

	async importFromLibrary(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const createdProject = await userProjectsHelper.importFromLibrary(
					req.params._id,
					req.body,
					req.userDetails.userToken,
					req.userDetails.userInformation.userId,
					req.query.isATargetedSolution ? req.query.isATargetedSolution : '',
					req.query.language ? req.query.language : ''
				)

				return resolve({
					status: createdProject.status,
					message: createdProject.message,
					result: createdProject.data,
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
    * @api {post} /project/v1/userProjects/certificateCallback
    * Project certificate callback
    * @apiVersion 1.0.0
    * @apiGroup User Projects
    * @apiSampleRequest /project/v1/userProjects/certificateCallback
    * @apiParamExample {json} Request
    *   {
            "event": "sunbird-rc-create",
            "timestamp": 1660145509358,
            "data": {
                "userId": "anonymous",
                "entityType": "ProjectCertificate",
                "osid": "ce2244a4-1a17-49a0-a3f9-c151161e70bl",
                "transactionId": "1-3a4892d8-2221-4e96-9434-f4b37886126b",
                "status": "SUCCESSFUL",
                "message": ""
            },
            "webhookUrl": "http://ml-project-service:3000/v1/userProjects/certificateCallback"
        }
    * @apiParamExample {json} Response:
    /**{
            "message": "Successfully generated project certificate",
            "status": 200,
            "result": {
                "_id": "63446059eeffea2b819f036e"
            }
        }
    /**

    /**
     * Project certificate callback.
     * @method
     * @name certificateCallback
     * @param {Object} req - request data.
     * @returns {JSON} certificate details.
    */

	async certificateCallback(req) {
		return new Promise(async (resolve, reject) => {
			try {
				console.log(
					'\n<==============================CERTIFICATE CALLBACK TRIGGERED==============================>\n'
				)
				let certificateCallback = await userProjectsHelper.certificateCallback(req)
				return resolve(certificateCallback)
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
	 * Project certificate error callback.
	 * @method
	 * @name certificateCallbackError
	 * @param {Object} req - request data.
	 * @returns {JSON} certificate error details.
	 */
	async certificateCallbackError(req) {
		return new Promise(async (resolve, reject) => {
			try {
				console.log(
					'\n<==============================CERTIFICATE CALLBACK ERROR TRIGGERED==============================>\n'
				)
				const certificateCallbackError = await userProjectsHelper.certificateCallbackError(req)
				return resolve(certificateCallbackError)
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
    * @api {get} /project/v1/userProjects/certificates
    * List of user project with certificate
    * @apiVersion 1.0.0
    * @apiGroup User Projects
    * @apiSampleRequest /project/v1/userProjects/certificates
    * @apiParamExample {json} Response:
    *   {
            "message": "Successfully fetched projects",
            "status": 200,
            "result": {
                "data": [
                    {
                        "_id": "66ac9949227504a96d8dce1c",
                        "certificate": {
                            "status": "active",
                            "eligible": true,
                            "transactionId": "a0d7ce6e-7c9f-4da8-8188-40e8a6f82541",
                            "issuedOn": "2024-08-06T09:11:06.329Z",
                            "pdfPath": "https://storage.googleapis.com/mentoring-dev-storage-private/project/dff195ca-0641-4a18-bbcb-246961d34250/1/a61c8091-e70e-4083-99b8-844e5884c708/output.pdf?GoogleAccessId=sl-mentoring-dev-storage%40sl-dev-project.iam.gserviceaccount.com&Expires=1723014659&Signature=pnLcUtS6wFO3Zw4C7IuiOHTdEsWdkNoj35hE8cpM27wJX5uxEdI7ytsJNmYZugJMcZpDeHtajkOU1CH9L8m84v6cA2ZB6WgxaOPssvb11k%2Bbzix%2FvWKnlMIAVNNcVjwkez%2BQXLgokxCoDgTEK3poeN3uPBqbP6xa8G7mq8ltrH5z1OuZZtMVO5zmh7r6%2BdDjnk%2BkqkxTiNQSTRwrVYwD6H6CdI7xgd9Y2z%2BER5m%2FjDCZeHbDMGGsqohWn37zI0sj%2FPNeK04iaLwyL%2B7%2FynAMFmk5AJ0GmCC3H%2FexbmfSGVAhSOCkhVl5VmcvOD8nx%2FNiuMymZaQqM3m%2FQEhZl7UUDw%3D%3D",
                            "svgPath": "https://storage.googleapis.com/mentoring-dev-storage-private/project/25291645-6583-46ac-becb-35ce2ac1064c/1/d664feff-1d12-4877-be46-6fac41172852/template.svg?GoogleAccessId=sl-mentoring-dev-storage%40sl-dev-project.iam.gserviceaccount.com&Expires=1723014659&Signature=vxdkUbfVn4BNDJxjLukkcBK0ddOMa6NGPikyJIL397mKujfwqrTpX1IDcAZwVhy4MJK9NVRCP85BBhLZQvoTU5SkzapqgRN7xL1bQDUsxuyK7NVlRyKuVgEZ5BEJ3YmNFZesli470tUSz36CA2vcz9gfegHPujybhT5%2BxyBZ1bymA98Fy7cEUJDSalG3RL78WWz8jUkHiY%2FBMcA2QIN727zvUk8oAk4ZvZSSS8bp5EEC5Xavu6vNttcbbEUDpbzlGSemCc%2BqBGlmA2fhte3YtM%2Bb2XeHTzW4fqUlotcbATEZmpCJ37w1gco62lqOyPWn4x8Xyp3ApTJFhz3UVC2VYg%3D%3D"
                        },
                        "status": "submitted",
                        "title": "Tech Skill Club- Smart Learn",
                        "solutionId": "66a2ba2b379d453de63b9248",
                        "programId": "66a2ba1f379d453de63b9242",
                        "completedDate": "2024-08-06T09:06:07.067Z",
                        "programName": "DCPCR School Development Index 2018-19",
                        "solutionName": "Tech Skill Club- Smart Learn",
                        "userName": "priyanka"
                    }
                ],
                "count": 1,
                "certificateCount": 1
            }
        }
    /**

    /**
     * List user project details with certificate
     * @method
     * @name certificates
     * @returns {JSON} User project detaills with certificate
    */

	async certificates(req) {
		return new Promise(async (resolve, reject) => {
			try {
				// fetch projects data of user, whish has certificate on completion
				let projectDetails = await userProjectsHelper.certificates(req.userDetails.userInformation.userId)
				return resolve({
					message: projectDetails.message,
					result: projectDetails.data,
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
    * @api {post} /project/v1/userProjects/certificateReIssue
    * ReIssue project certificate (admin api)
    * @apiVersion 1.0.0
    * @apiGroup User Projects
    * @apiSampleRequest /project/v1/userProjects/certificateReIssue
    * @apiParamExample {json} Response:
    /**{
            "message": "Submitted for project certificate reIssue",
            "status": 200,
            "result": {
                "_id": "66ac9949227504a96d8dce1c"
            }
        }
    /**
     * ReIssue project certificate
     * @method
     * @name certificateReIssue
     * @returns {JSON} Reissued details
    */

	async certificateReIssue(req) {
		return new Promise(async (resolve, reject) => {
			try {
				// ReIssue certificate of given project : projectId is passed as param
				let projectDetails = await userProjectsHelper.certificateReIssue(req.params._id)
				return resolve({
					message: projectDetails.message,
					result: projectDetails.data,
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
    * @api {post} /project/v1/verifyCertificate/:_id
    * ReIssue project certificate
    * @apiVersion 1.0.0
    * @apiGroup User Projects
    * @apiSampleRequest /project/v1/userProjects/verifyCertificate/66ac9949227504a96d8dce1c
    * @apiParamExample {json} Response:
    /**{
            "message": "Certificate verified successfully",
            "status": 200,
            "result": {
                "projectId": "66ac9949227504a96d8dce1c",
                "projectName": "Tech Skill Club- Smart Learn",
                "programId": "66a2ba1f379d453de63b9242",
                "solutionId": "66a2ba2b379d453de63b9248",
                "userId": "1",
                "isCertificateVerified": true,
                "completedDate": "2024-08-06T09:06:07.067Z",
                "eligible": true,
                "certificatePdfUrl": "https://storage.googleapis.com/mentoring-dev-storage-private/project/dff195ca-0641-4a18-bbcb-246961d34250/1/a61c8091-e70e-4083-99b8-844e5884c708/output.pdf?GoogleAccessId=sl-mentoring-dev-storage%40sl-dev-project.iam.gserviceaccount.com&Expires=1722956711&Signature=XGKVOQdH0hqjlMUr3%2FwJVOeGLXS4d62TS8Y1CAOUJ1ntHxxC7FCZanukYqi%2FPpYLjPPxTMihYLrM5L1xkcpDwimRBUaDXSITTtkPVS6o9tOi7OZxFGEENY%2FYDMQsNEjPwE0C4mIN2dCjF2t9u0DupDay0cg8Byyep0mPa6UamCsPdsnvysZfNyCG4Z%2F98e4n7a7QXFhm2vt1Z1k8KCQXIMGdVtyJyNXCLrUyq5VZESkT5TUfAtup8QnNqK1hkFOKBl7H0st%2BOb2HzoICqLXgS8%2BWxFj3j8R%2F5PHfY4WM1Xc49mwp6dfJDO7skPvBLIIQ6v3WYOTm3QBjk8B7tBq%2B%2BA%3D%3D",
                "certificateSvgUrl": "https://storage.googleapis.com/mentoring-dev-storage-private/project/25291645-6583-46ac-becb-35ce2ac1064c/1/d664feff-1d12-4877-be46-6fac41172852/template.svg?GoogleAccessId=sl-mentoring-dev-storage%40sl-dev-project.iam.gserviceaccount.com&Expires=1722956711&Signature=gUGRNgykUz3Jp%2FiNC82UkSkJhOXR3E8qY58UhkvCSGmJ%2FD34AdkR8HYropHfNeX191CwV%2F7%2FNR0bvgHubCg3a2v9qDelYK5tvAwZ%2FC9pUoaIyYTdmq6yqq9m%2FbdjC%2BmBERpLT8IDVfHl7nttw%2FiIhP%2BVj8NnejVbS%2FgFa7jOe7iFwNVjxXiBspfjnq1Dh9v%2FN9d6NibyTljQx%2FLDUpJ6DfwoAwmnytZUg94%2FwuwGpgCK0FbR78UlJGSanDtJvyZ%2FGh3pkV4ulr%2BLqLfSIMjLI3yjxBVNmkLv0f%2FXP3cH8ULvRT%2BzYtWXU0yRUK%2ByJaCgF%2BIzTCXtzXLZuCLhxxnOeA%3D%3D"
            }
        }
    /**
	 * Verify project certificate
	 * @method
	 * @name verifyCertificate
	 * @param {String} projectId - projectId.
	 * @returns {JSON} certificate details.
	 */
	async verifyCertificate(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const projectId = req.params._id
				const verifyCertificateData = await userProjectsHelper.verifyCertificate(projectId)
				return resolve(verifyCertificateData)
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

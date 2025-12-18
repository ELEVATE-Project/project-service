/**
 * name : programUsers.js
 * author : Ankit Shahu
 * created-date : 9-Jan-2023
 * Description : Program Users Controller - CRUD operations for program-user mappings.
 */

// Dependencies
const programUsersHelper = require(MODULES_BASE_PATH + '/programUsers/helper')

/**
 * ProgramUsers
 * @class
 */
module.exports = class ProgramUsers extends Abstract {
	constructor() {
		super('programUsers')
	}

	static get name() {
		return 'programUsers'
	}

	/**
	 * @api {post} /project/v1/programUsers/create
	 * @apiVersion 1.0.0
	 * @apiName create
	 * @apiGroup ProgramUsers
	 * @apiHeader {String} x-auth-token Authenticity token
	 * @apiSampleRequest /project/v1/programUsers/create
	 * @apiUse successBody
	 * @apiUse errorBody
	 * @apiParamExample {json} Request-Body:
	 * {
	 *   "programId": "60a5e5d8f1b2c3d4e5f6a7b8",
	 *   "userId": "user-uuid-123",
	 *   "userProfile": {
	 *     "firstName": "John",
	 *     "lastName": "Doe",
	 *     "email": "john@example.com"
	 *   },
	 *   "userRoleInformation": {
	 *     "role": "teacher"
	 *   },
	 *   "status": "NOT_ONBOARDED",
	 *   "metadata": {}
	 * }
	 * @apiParamExample {json} Response:
	 * {
	 *   "message": "Program user created successfully",
	 *   "status": 200,
	 *   "result": {
	 *     "_id": "60a5e5d8f1b2c3d4e5f6a7b9",
	 *     "programId": "60a5e5d8f1b2c3d4e5f6a7b8",
	 *     "userId": "user-uuid-123",
	 *     "status": "NOT_ONBOARDED"
	 *   }
	 * }
	 */

	/**
	 * Create a new program user mapping.
	 * @method
	 * @name create
	 * @param {Object} req - request object.
	 * @param {Object} req.body - request body data.
	 * @param {Object} req.userDetails - logged in user details.
	 * @returns {JSON} - program user creation response.
	 */
	async create(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await programUsersHelper.create(req.body, req.userDetails)
				return resolve(result)
			} catch (error) {
				return resolve({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
	 * @api {patch} /project/v1/programUsers/update/:_id
	 * @apiVersion 1.0.0
	 * @apiName update
	 * @apiGroup ProgramUsers
	 * @apiHeader {String} x-auth-token Authenticity token
	 * @apiSampleRequest /project/v1/programUsers/update/60a5e5d8f1b2c3d4e5f6a7b9
	 * @apiUse successBody
	 * @apiUse errorBody
	 * @apiParamExample {json} Request-Body:
	 * {
	 *   "status": "ONBOARDED",
	 *   "userRoleInformation": {
	 *     "role": "mentor"
	 *   }
	 * }
	 * @apiParamExample {json} Response:
	 * {
	 *   "message": "Program user updated successfully",
	 *   "status": 200,
	 *   "result": {
	 *     "_id": "60a5e5d8f1b2c3d4e5f6a7b9",
	 *     "status": "ONBOARDED"
	 *   }
	 * }
	 */

	/**
	 * Update a program user mapping.
	 * @method
	 * @name update
	 * @param {Object} req - request object.
	 * @param {String} req.params._id - program user id.
	 * @param {Object} req.body - request body data.
	 * @param {Object} req.userDetails - logged in user details.
	 * @returns {JSON} - program user update response.
	 */
	async update(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await programUsersHelper.update(req.params._id, req.body, req.userDetails)
				return resolve(result)
			} catch (error) {
				return resolve({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
	 * @api {get} /project/v1/programUsers/read/:_id
	 * @apiVersion 1.0.0
	 * @apiName read
	 * @apiGroup ProgramUsers
	 * @apiHeader {String} x-auth-token Authenticity token
	 * @apiSampleRequest /project/v1/programUsers/read/60a5e5d8f1b2c3d4e5f6a7b9
	 * @apiUse successBody
	 * @apiUse errorBody
	 * @apiParamExample {json} Response:
	 * {
	 *   "message": "Program user fetched successfully",
	 *   "status": 200,
	 *   "result": {
	 *     "_id": "60a5e5d8f1b2c3d4e5f6a7b9",
	 *     "programId": "60a5e5d8f1b2c3d4e5f6a7b8",
	 *     "userId": "user-uuid-123",
	 *     "status": "NOT_ONBOARDED"
	 *   }
	 * }
	 */

	/**
	 * Get program user details by ID or by program ID and user ID.
	 * Handles two patterns:
	 * - /read/:_id - Get by program user ID
	 * - /read/:programId/:userId - Get by program ID and user ID
	 * @method
	 * @name read
	 * @param {Object} req - request object.
	 * @param {String} req.params._id - program user id (pattern 1).
	 * @param {String} req.params.programId - program id (pattern 2).
	 * @param {String} req.params.userId - user id (pattern 2).
	 * @param {Object} req.userDetails - logged in user details.
	 * @returns {JSON} - program user details.
	 */
	async read(req) {
		return new Promise(async (resolve, reject) => {
			try {
				// Check if it's a programId:userId pattern
				if (req.params.programId && req.params.userId && !req.params._id) {
					// Pattern: /read/:programId/:userId
					const result = await programUsersHelper.readByProgramAndUserId(
						req.params.programId,
						req.params.userId,
						req.userDetails
					)
					return resolve(result)
				} else if (req.params._id) {
					// Pattern: /read/:_id
					const result = await programUsersHelper.read(req.params._id, req.userDetails)
					return resolve(result)
				} else {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: 'Invalid parameters. Use either /:_id or /:programId/:userId',
					}
				}
			} catch (error) {
				return resolve({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
	 * @api {post} /project/v1/programUsers/list
	 * @apiVersion 1.0.0
	 * @apiName list
	 * @apiGroup ProgramUsers
	 * @apiHeader {String} x-auth-token Authenticity token
	 * @apiSampleRequest /project/v1/programUsers/list?page=1&limit=10&programId=60a5e5d8f1b2c3d4e5f6a7b8
	 * @apiUse successBody
	 * @apiUse errorBody
	 * @apiParamExample {json} Request-Body:
	 * {
	 *   "status": "ONBOARDED"
	 * }
	 * @apiParamExample {json} Response:
	 * {
	 *   "message": "Program users fetched successfully",
	 *   "status": 200,
	 *   "result": [...],
	 *   "count": 100,
	 *   "page": 1,
	 *   "limit": 10,
	 *   "totalPages": 10
	 * }
	 */

	/**
	 * List program users with filters and pagination.
	 * @method
	 * @name list
	 * @param {Object} req - request object.
	 * @param {Object} req.query - query parameters.
	 * @param {Object} req.body - request body for additional filters.
	 * @param {Object} req.userDetails - logged in user details.
	 * @returns {JSON} - paginated list of program users.
	 */
	async list(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await programUsersHelper.list(req.query, req.body, req.userDetails)
				return resolve(result)
			} catch (error) {
				return resolve({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
	 * @api {delete} /project/v1/programUsers/delete/:_id
	 * @apiVersion 1.0.0
	 * @apiName delete
	 * @apiGroup ProgramUsers
	 * @apiHeader {String} x-auth-token Authenticity token
	 * @apiSampleRequest /project/v1/programUsers/delete/60a5e5d8f1b2c3d4e5f6a7b9
	 * @apiUse successBody
	 * @apiUse errorBody
	 * @apiParamExample {json} Response:
	 * {
	 *   "message": "Program user deleted successfully",
	 *   "status": 200,
	 *   "result": {
	 *     "_id": "60a5e5d8f1b2c3d4e5f6a7b9"
	 *   }
	 * }
	 */

	/**
	 * Delete a program user mapping.
	 * Supports both patterns:
	 * - /delete/:_id - Standard delete by ID
	 * - DELETE /:_id - Standard REST DELETE
	 * @method
	 * @name delete
	 * @param {Object} req - request object.
	 * @param {String} req.params._id - program user id.
	 * @param {Object} req.userDetails - logged in user details.
	 * @returns {JSON} - deletion response.
	 */
	async delete(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await programUsersHelper.deleteResource(req.params._id, req.userDetails)
				return resolve(result)
			} catch (error) {
				return resolve({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
	 * @api {patch} /project/v1/programUsers/updateStatus/:_id
	 * @apiVersion 1.0.0
	 * @apiName updateStatus
	 * @apiGroup ProgramUsers
	 * @apiHeader {String} x-auth-token Authenticity token
	 * @apiSampleRequest /project/v1/programUsers/updateStatus/60a5e5d8f1b2c3d4e5f6a7b9
	 * @apiUse successBody
	 * @apiUse errorBody
	 * @apiParamExample {json} Request-Body:
	 * {
	 *   "status": "GRADUATED",
	 *   "statusReason": "Completed all requirements"
	 * }
	 * @apiParamExample {json} Response:
	 * {
	 *   "message": "Program user status updated successfully",
	 *   "status": 200,
	 *   "result": {
	 *     "_id": "60a5e5d8f1b2c3d4e5f6a7b9",
	 *     "status": "GRADUATED",
	 *     "prevStatus": "COMPLETED"
	 *   }
	 * }
	 */

	/**
	 * Update program user status.
	 * @method
	 * @name updateStatus
	 * @param {Object} req - request object.
	 * @param {String} req.params._id - program user id.
	 * @param {Object} req.body - request body with status.
	 * @param {Object} req.userDetails - logged in user details.
	 * @returns {JSON} - status update response.
	 */
	async updateStatus(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await programUsersHelper.updateStatus(req.params._id, req.body, req.userDetails)
				return resolve(result)
			} catch (error) {
				return resolve({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
	 * @api {patch} /project/v1/programUsers/updateMetadata/:_id
	 * @apiVersion 1.0.0
	 * @apiName updateMetadata
	 * @apiGroup ProgramUsers
	 * @apiHeader {String} x-auth-token Authenticity token
	 * @apiSampleRequest /project/v1/programUsers/updateMetadata/60a5e5d8f1b2c3d4e5f6a7b9
	 * @apiUse successBody
	 * @apiUse errorBody
	 * @apiParamExample {json} Request-Body:
	 * {
	 *   "metadata": {
	 *     "externalIdOfBoardingCompletionCategory": {
	 *       "templateExternalId": "template-123",
	 *       "tasks": [{ "taskId": "task1", "completed": true }]
	 *     }
	 *   }
	 * }
	 * @apiParamExample {json} Response:
	 * {
	 *   "message": "Program user metadata updated successfully",
	 *   "status": 200,
	 *   "result": {...}
	 * }
	 */

	/**
	 * Update program user metadata.
	 * @method
	 * @name updateMetadata
	 * @param {Object} req - request object.
	 * @param {String} req.params._id - program user id.
	 * @param {Object} req.body - request body with metadata.
	 * @param {Object} req.userDetails - logged in user details.
	 * @returns {JSON} - metadata update response.
	 */
	async updateMetadata(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await programUsersHelper.updateMetadata(req.params._id, req.body, req.userDetails)
				return resolve(result)
			} catch (error) {
				return resolve({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
	 * @api {get} /project/v1/programUsers/getByProgramId/:_id
	 * @apiVersion 1.0.0
	 * @apiName getByProgramId
	 * @apiGroup ProgramUsers
	 * @apiHeader {String} x-auth-token Authenticity token
	 * @apiSampleRequest /project/v1/programUsers/getByProgramId/60a5e5d8f1b2c3d4e5f6a7b8?page=1&limit=10&status=ONBOARDED
	 * @apiUse successBody
	 * @apiUse errorBody
	 * @apiParamExample {json} Response:
	 * {
	 *   "message": "Program users fetched successfully",
	 *   "status": 200,
	 *   "result": [...],
	 *   "count": 50,
	 *   "page": 1,
	 *   "limit": 10,
	 *   "totalPages": 5
	 * }
	 */

	/**
	 * Get program users by program ID.
	 * @method
	 * @name getByProgramId
	 * @param {Object} req - request object.
	 * @param {String} req.params._id - program id.
	 * @param {Object} req.query - query parameters.
	 * @param {Object} req.userDetails - logged in user details.
	 * @returns {JSON} - list of program users for a program.
	 */
	async getByProgramId(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await programUsersHelper.getByProgramId(req.params._id, req.query, req.userDetails)
				return resolve(result)
			} catch (error) {
				return resolve({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}
}

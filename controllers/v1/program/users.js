/*
 * name : users.js
 * author : copilot
 * created-date : 2025-12-30
 * Description : Program -> Users controller to expose programUsers APIs under /program/users
 */

// Dependencies
const programUsersHelper = require(MODULES_BASE_PATH + '/programUsers/helper')

module.exports = class Users extends Abstract {
	constructor() {
		super('programUsers')
	}

	static get name() {
		return 'programUsers'
	}

	async create(req) {
		try {
			const result = await programUsersHelper.create(req.body, req.userDetails)
			return result
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	async update(req) {
		try {
			const result = await programUsersHelper.update(req.params._id, req.body, req.userDetails)
			return result
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	async read(req) {
		try {
			if (req.params.programId && req.params.userId && !req.params._id) {
				const result = await programUsersHelper.readByProgramAndUserId(
					req.params.programId,
					req.params.userId,
					req.userDetails
				)
				return result
			} else if (req.params._id) {
				const result = await programUsersHelper.read(req.params._id, req.userDetails)
				return result
			} else {
				throw {
					status: HTTP_STATUS_CODE.bad_request.status,
					message: 'Invalid parameters. Use either /:_id or /:programId/:userId',
				}
			}
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	async list(req) {
		try {
			const result = await programUsersHelper.list(req)
			return result
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	async delete(req) {
		try {
			const result = await programUsersHelper.deleteResource(req.params._id, req.userDetails)
			return result
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	async getByProgramId(req) {
		try {
			const result = await programUsersHelper.getByProgramId(req.params._id, req.query, req.userDetails)
			return result
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}
}

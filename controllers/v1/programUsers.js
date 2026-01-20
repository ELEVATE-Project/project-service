/**
 * name : programUsers.js
 * author : Ankit Shahu
 * created-date : 9-Jan-2023
 * Description : Program Users related controller.
 */

const programUsersHelper = require(MODULES_BASE_PATH + '/programUsers/helper')

/**
 * programUsers
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
	 * Create or update program user
	 * Supports: create, update, add entity, update status
	 * @method
	 * @name createOrUpdate
	 * @param {Object} req - request object
	 * @returns {Object} response with status and result
	 */
	async createOrUpdate(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await programUsersHelper.createOrUpdate(req.body, req.userDetails)

				return resolve(result)
			} catch (error) {
				return reject({
					status: HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || 'Internal server error',
				})
			}
		})
	}

	/**
	 * Get entities from a program user with pagination and search
	 * @method
	 * @name getEntities
	 * @param {Object} req - request object
	 * @returns {Object} paginated list of entities
	 */
	async getEntities(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const { userId, programId, programExternalId, page = 1, limit = 20, search = '' } = req.query

				if (!userId || (!programId && !programExternalId)) {
					return reject({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: 'userId and either programId or programExternalId are required',
					})
				}
				// Call helper
				const result = await programUsersHelper.getEntitiesWithPagination(
					userId,
					programId,
					programExternalId,
					parseInt(page),
					parseInt(limit),
					search,
					req.userDetails
				)
				return resolve(result)
			} catch (error) {
				return reject({
					status: HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || 'Internal server error',
				})
			}
		})
	}
}

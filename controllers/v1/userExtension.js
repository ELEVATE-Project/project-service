/**
 * name : UserExtension.js
 * author : PraveenDass
 * created-date : 26-Nov-2024
 * Description :  UserExtension Controller.
 */

const csv = require('csvtojson')
const userExtensionHelper = require(MODULES_BASE_PATH + '/userExtension/helper')

module.exports = class UserExtension extends Abstract {
	constructor() {
		super('user-extension')
	}

	static get name() {
		return 'userExtension'
	}

	/**
	 * Bulk upload user.
	 * @method
	 * @name bulkUpload
	 * @param {Object} req - request data.
	 * @param {Array} req.files.userRoles - userRoles data.
	 * @returns {CSV} user uploaded data.
	 */

	bulkUpload(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let userRolesCSVData = await csv().fromString(req.files.userRoles.data.toString())

				if (!userRolesCSVData || userRolesCSVData.length < 1) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.FILE_DATA_MISSING,
					}
				}

				const { tenantAndOrgInfo, userInformation } = req.userDetails

				let newUserRoleData = await userExtensionHelper.bulkCreateOrUpdate(
					userRolesCSVData,
					userInformation,
					tenantAndOrgInfo
				)

				if (!newUserRoleData?.length) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.USER_ROLES_PROCESSING_FAILED,
					}
				}

				const fileName = `UserRole-Upload`
				let fileStream = new CSV_FILE_STREAM(fileName)
				let input = fileStream.initStream()

				;(async function () {
					await fileStream.getProcessorPromise()
					return resolve({
						isResponseAStream: true,
						fileNameWithPath: fileStream.fileNameWithPath(),
					})
				})()

				await Promise.all(
					newUserRoleData.map(async (userRole) => {
						input.push(userRole)
					})
				)

				input.push(null)
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
	 * update user extensions.
	 * @method
	 * @name update
	 * @param {Object} req - request data.
	 * @returns {Object} user extension data.
	 */

	update(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const updateUserExtension = await userExtensionHelper.update(req.body.data, req.userDetails)
				return resolve(updateUserExtension)
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

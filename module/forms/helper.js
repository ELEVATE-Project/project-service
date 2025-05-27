/**
 * name : helper.js
 * author : prajwal
 * created-date : 09-May-2024
 * Description :  Forms Helper.
 */

const formQueries = require(DB_QUERY_BASE_PATH + '/forms')
const userService = require(SERVICES_BASE_PATH + '/users')
const ObjectId = require('mongodb').ObjectID

module.exports = class FormsHelper {
	/**
	 * Get default org id.
	 * @method
	 * @name getDefaultOrgId
	 * @param {String} userToken
	 * @returns {Number} - Default Organization Id
	 */
	static getDefaultOrgId(userToken) {
		return new Promise(async (resolve, reject) => {
			try {
				// call user-service to fetch default organization details
				let defaultOrgDetails = await userService.fetchDefaultOrgDetails(
					process.env.DEFAULT_ORGANISATION_CODE,
					userToken
				)
				if (defaultOrgDetails.success && defaultOrgDetails.data) {
					return resolve(defaultOrgDetails.data.id)
				} else return resolve(null)
			} catch (error) {
				throw error
			}
		})
	}

	/**
	 * Create Form.
	 * @method
	 * @name create
	 * @param {Object} bodyData
	 * @param {Object} userDetails
	 * @returns {JSON} - Form creation data.
	 */
	static create(bodyData, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				bodyData['tenantId'] = userDetails.tenantAndOrgInfo.tenantId
				bodyData['orgId'] = userDetails.tenantAndOrgInfo.orgId
				const form = await formQueries.createForm(bodyData)
				if (!form || !form._id) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.FORM_NOT_CREATED,
					}
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.FORM_CREATED_SUCCESSFULLY,
					data: form,
					result: form,
				})
			} catch (error) {
				return resolve({
					message: error.message,
					success: false,
				})
			}
		})
	}

	/**
	 * Update Form.
	 * @method
	 * @name update
	 * @param {String} _id
	 * @param {Object} bodyData
	 * @param {Number} userDetails
	 * @returns {JSON} - Update form data.
	 */
	static update(_id, bodyData, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				// validate _id field
				_id = _id === ':_id' ? null : _id
				let filter = {}

				if (_id) {
					filter['_id'] = ObjectId(_id)
				} else {
					filter['type'] = bodyData.type
				}

				filter['tenantId'] = userDetails.tenantAndOrgInfo.tenantId

				// create update object to pass to db query
				let updateData = {}

				// avoding addition of manupulative data
				delete bodyData.tenantId
				delete bodyData.orgId

				updateData['$set'] = bodyData
				const updatedForm = await formQueries.updateOneForm(filter, updateData, { new: true })
				if (!updatedForm || !updatedForm._id) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.FORM_NOT_UPDATED,
					})
				}
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.FORM_UPDATED_SUCCESSFULLY,
					data: updatedForm,
					result: updatedForm,
				})
			} catch (error) {
				return resolve({
					message: error.message,
					success: false,
				})
			}
		})
	}

	/**
	 * Read Form.
	 * @method
	 * @name read
	 * @param {String} _id
	 * @param {Object} bodyData
	 * @param {Object} userDetails
	 * @param {String} userToken
	 * @returns {JSON} - Read form data.
	 */
	static read(_id, bodyData, userDetails, userToken) {
		return new Promise(async (resolve, reject) => {
			try {
				// validate _id field
				_id = _id === ':_id' ? null : _id
				let filter = {}

				if (_id) {
					filter['_id'] = ObjectId(_id)
				} else {
					Object.keys(bodyData).map((key) => {
						filter[`${key}`] = bodyData[`${key}`]
					})
				}

				filter['tenantId'] = userDetails.userInformation.tenantId
				filter['orgId'] = { $in: ['ALL', userDetails.userInformation.organizationId] }

				const form = await formQueries.findOneForm(filter)
				let defaultOrgForm
				if (!form || !form._id) {
					// call getDefaultOrgId() to get default organization details from user-service
					const defaultOrgId = await this.getDefaultOrgId(userToken)
					if (!defaultOrgId) {
						return resolve({
							status: HTTP_STATUS_CODE.bad_request.status,
							success: false,
							message: CONSTANTS.apiResponses.DEFAULT_ORG_ID_NOT_SET,
						})
					}
					filter = {}
					if (_id) {
						filter['_id'] = ObjectId(_id)
					} else {
						Object.keys(bodyData).map((key) => {
							filter[`${key}`] = bodyData[`${key}`]
						})
					}

					filter = {}
					if (_id) {
						filter['_id'] = ObjectId(_id)
					} else {
						Object.keys(bodyData).map((key) => {
							filter[`${key}`] = bodyData[`${key}`]
						})
					}
					filter['orgId'] = { $in: [defaultOrgId.toString()] }
					defaultOrgForm = await formQueries.findOneForm(filter)
				}
				if (!form && !defaultOrgForm) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.FORM_NOT_FOUND,
					}
				}
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.FORM_FETCHED_SUCCESSFULLY,
					data: form ? form : defaultOrgForm,
					result: form ? form : defaultOrgForm,
				})
			} catch (error) {
				return resolve({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				})
			}
		})
	}

	/**
	 * Read Form Version.
	 * @method
	 * @name readAllFormsVersion
	 * @returns {JSON} - Read form data.
	 */
	static readAllFormsVersion() {
		return new Promise(async (resolve, reject) => {
			try {
				const filter = 'all'
				const projectFields = ['_id', 'type', 'version']
				// db query to get forms version of all documents
				const getAllFormsVersion = await formQueries.formDocuments(filter, projectFields)
				if (!getAllFormsVersion || !getAllFormsVersion.length > 0) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.FORM_VERSION_NOT_FETCHED,
					}
				}
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.FORM_VERSION_FETCHED_SUCCESSFULLY,
					data: getAllFormsVersion ? getAllFormsVersion : [],
					result: getAllFormsVersion ? getAllFormsVersion : [],
				})
			} catch (error) {
				return resolve({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				})
			}
		})
	}
}

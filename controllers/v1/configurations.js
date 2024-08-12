/**
 * name : configurations.js
 * author : prajwal
 * created-date : 09-Aug-2024
 * Description : Configuration related apis.
 */

// Dependencies
const configurationsHelper = require(MODULES_BASE_PATH + '/configurations/helper')

module.exports = class Configurations extends Abstract {
	constructor() {
		super('configurations')
	}

	static get name() {
		return 'configurations'
	}

	/**
  * @api {post} /project/v1/configurations/read
  * @apiVersion 1.0.0
  * @apiName read
  * @apiGroup Admin
  * @apiHeader {String} X-auth-token Authenticity token
  * @apiSampleRequest /project/v1/configurations/read
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
    {
		"message": "Configuration fetched successfully",
		"status": 200,
		"result": {
			"_id": "66b9ad30ce28500bff2dd82f",
			"code": "keysAllowedForTargeting",
			"meta": {
				"profileKeys": [
					"state",
					"district",
					"zone"
				]
			}
		}
	}
  */

	/**
	 * Reading configuration
	 * @method
	 * @name read
	 * @returns {Object} success/failure message.
	 */

	async read(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const configDetails = await configurationsHelper.read('keysAllowedForTargeting')
				return resolve(configDetails)
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

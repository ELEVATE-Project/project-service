/**
 * name : profile.js
 * author : Mallanagouda R Biradar
 * created-date : 13-Jun-2024
 * Description :  profile Controller.
 */

// dependencies
let projectAttributesHelper = require(MODULES_BASE_PATH + '/projectAttributes/helper')

/**
 * profile service.
 * @class
 */
module.exports = class ProjectAttributes extends Abstract {
	constructor() {
		super('project-attributes')
	}
	/**
* @api {post} /project/v1/projectAttributes/create
* @apiVersion 1.0.0
* @apiName create
* @apiGroup projectAttributes
* @apiHeader {String} X-user-token Authenticity token
* @apiUse successBody
* @apiUse errorBody
* @apiParamExample {json} Response:
* {
  "message": "projectAttributes created successfully",
  "status": 200,
}
*/

	async create(req) {
		try {
			let projectAttributes = await projectAttributesHelper.create()
			if (projectAttributes.success) {
				return {
					success: true,
					message: CONSTANTS.apiResponses.PROJECT_ATTRIBUTES_CREATED,
				}
			}
		} catch (error) {
			// If an error occurs, return an error response with status, message, and the error object
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	/**
* @api {post} /project/v1/projectAttributes/find
* @apiVersion 1.0.0
* @apiName Find
* @apiGroup projectAttributes
* @apiHeader {String} X-user-token Authenticity token
* @apiUse successBody
* @apiUse errorBody
* @apiParamExample {json} Response:
* {
  "message": "projectAttributes fetched successfully",
  "status": 200,
  "result": [
  {
  Name:”duration”,
  Values;[
   {
   {
	 value: '1 week',
	label: '1 week',
	},
	{
	value: '2 week',
	label: '2 week',
	},
}
] 
}
  ]
}
*/
	async find(req) {
		// Return a new Promise, as the function is asynchronous
		try {
			const projectAttributesData = await projectAttributesHelper.find()

			// If successful, resolve the Promise with a success message and the fetched data
			return projectAttributesData
		} catch (error) {
			// If an error occurs, return an error response with status, message, and the error object
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}
}

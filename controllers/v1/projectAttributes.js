/**
 * name : projectAttributes.js
 * author : PraveenDass
 * created-date : 25-Nov-2024
 * Description :  projectAttributes Controller.
 */

// dependencies
let projectAttributesHelper = require(MODULES_BASE_PATH + '/projectAttributes/helper')

/**
 * projectAttributes service.
 * @class
 */
module.exports = class ProjectAttributes extends Abstract {
	// Adding model schema
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
			let projectAttributes = await projectAttributesHelper.create(req.userDetails)
			if (projectAttributes.success) {
				return {
					success: true,
					message: CONSTANTS.apiResponses.PROJECT_ATTRIBUTES_CREATED,
				}
			} else {
				throw {
					message: CONSTANTS.apiResponses.PROJECT_ATTRIBUTES_CREATION_FAILED,
					status: HTTP_STATUS_CODE.bad_request.status,
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
* @api {get} /project/v1/projectAttributes/find
* @apiVersion 1.0.0
* @apiName Find
* @apiGroup projectAttributes
* @apiHeader {String} X-user-token Authenticity token
* @apiUse successBody
* @apiUse errorBody
* @apiParamExample {json} Response:
* {
    "message": "Project Attributes Fetched successfully",
    "status": 200,
    "result": [
        {
            "Name": "Duration",
            "values": [
                {
                    "lable": "1 week",
                    "value": "1 Week"
                },
                {
                    "lable": "2 week",
                    "value": "2 Week"
                }
            ]
        },
*/
	async find(req) {
		try {
			const projectAttributesData = await projectAttributesHelper.find(
				req.query.language ? req.query.language : '',
				req.userDetails
			)
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

	/**
* @api {post} /project/v1/projectAttributes/update
* @apiVersion 1.0.0
* @apiName Find
* @apiGroup 
* @apiParam reqBody
* @samplerequestBody
{

    "translateData":{
      "name":"Duration",
       "data": [
        {
            "lable":"1 varamlu",
             "value":"1 Week"
        },
                {
            "lable":"2 varamlu",
             "value":"2 Week"
        }
    ]
    }
}
* @apiUse successBody
* @apiUse errorBody
* @apiParamExample {json} Response:
{
    "message": "Successfully updated the project attributes",
    "status": 200
}
**/
	async update(req) {
		try {
			const projectAttributesData = await projectAttributesHelper.update(
				req.query.code,
				req.query.language ? req.query.language : '',
				req.body,
				req.userDetails
			)

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

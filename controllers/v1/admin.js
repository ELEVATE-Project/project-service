/**
 * name : admin.js
 * author : Prajwal
 * created-date : 04-Apr-2024
 * Description : Admin related information.
 */

// Dependencies
const adminHelper = require(MODULES_BASE_PATH + '/admin/helper')

module.exports = class Admin {
	static get name() {
		return 'admin'
	}

	/**
  * @api {post} /project/v1/admin/createIndex/:_collectionName 
  * @apiVersion 1.0.0
  * @apiName createIndex
  * @apiGroup Admin
  * @apiParamExample {json} Request-Body:
    {
        "keys": [
            "scope.entities"
        ]
    }
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /project/v1/admin/createIndex/solutions
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
    {
        "message": "Keys indexed successfully",
        "status": 200
    }
  */

	/**
	 * Indexing specified keys in a model
	 * @method
	 * @name createIndex
	 * @param {Object} req - requested data.
	 * @param {String} req.params._id - collection name.
	 * @param {Array} req.body.keys - keys to be indexed.
	 * @returns {Object} success/failure message.
	 */

	async createIndex(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let collection = req.params._id
				let keys = req.body.keys

				const isIndexed = await adminHelper.createIndex(collection, keys)

				return resolve(isIndexed)
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
   * @api {post} /project/v1/admin/dbFind/:collectionName
   * List of data based on collection
   * @apiVersion 1.0.0
   * @apiGroup Admin
   * @apiSampleRequest /project/v1/admin/dbFind/projects
   * @param {json} Request-Body:
   * {
   * "query" : {
        "userId": "18155ae6-493d-4369-9668-165eb6dcaa2a",
        "_id": "601921116ffa9c5e9d0b53e5"
      },
      "projection" : ["title"],
      "limit": 100,
      "skip": 2
    }
    * @apiParamExample {json} Response:
    * {
        "message": "Data Fetched Or Updated Successfully",
        "status": 200,
        "result": [
            {
                "_id": "601921e86ffa9c5e9d0b53e7",
                "title": "Please edit this project for submitting your Prerak Head Teacher of the Block-19-20 project"
            },
            {
                "_id": "60193ce26ffa9c5e9d0b53fe",
                "title": "Please edit this project for submitting your Prerak Head Teacher of the Block-19-20 project"
            }
        ]
    * }   
    * @apiUse successBody
    * @apiUse errorBody
    */

	/**
	 * List of data based on collection
	 * @method
	 * @name dbFind
	 * @param {String} _id - MongoDB Collection Name
	 * @param {Object} req - Req Body
	 * @returns {JSON} list of data.
	 */

	async dbFind(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let result = await adminHelper.dbFind(req.params._id, req.body)

				return resolve(result)
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
   * @api {post} /project/v1/admin/deleteResource/:resourceId?type=solution
   * Deletes a resource (program/solution) after validating admin access.
   * @apiVersion 1.0.0
   * @apiGroup Admin
   * @apiSampleRequest /project/v1/admin/deleteResource/683867e60f8595db9c1b6c26?type=solution
    * @apiParamExample {json} Response:
    {
    "message": "Solution and associated resources deleted successfully",
    "status": 200,
    "result": {
        "deletedSolutionsCount": 1,
        "deletedProjectTemplatesCount": 1,
        "deletedCertificateTemplatesCount": 1,
        "deletedProjectTemplateTasksCount": 0,
        "deletedSurveysCount": 0,
        "deletedSurveySubmissionsCount": 0,
        "deletedObservationsCount": 0,
        "deletedObservationSubmissionsCount": 0,
        "deletedProjectsCount": 2,
		"deletedProgramsCount":1
    	}
	}
    * @apiUse successBody
    * @apiUse errorBody
    */
	/**
	 * Deletes a resource (program/solution) after validating admin access.
	 *
	 * @param {Object} req - Express request object containing user details, params, and query.
	 * @param {Object} req.params - Contains route parameters, specifically `_id` of the resource.
	 * @param {Object} req.query - Contains query parameters, specifically `type` (program/solution).
	 * @param {Object} req.userDetails - Contains user roles and tenant/org info.
	 * @returns {Promise<Object>} - Returns a success or failure response from the adminHelper.
	 * @throws {Object} - Throws an error object with status, message, and error details if validation or deletion fails.
	 */
	async deleteResource(req) {
		return new Promise(async (resolve, reject) => {
			try {
				// Call adminHelper's deletedResourceDetails with required identifiers
				let deleteResource = await adminHelper.deletedResourceDetails(
					req.params._id,
					req.query.type,
					req.userDetails.tenantAndOrgInfo.tenantId,
					req.userDetails.tenantAndOrgInfo.orgId,
					req.userDetails.userInformation.userId,
					req.userDetails.userToken
				)
				return resolve(deleteResource)
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
	 * @api {post} /project/v1/admin/updateRelatedOrgs 
	 * @apiVersion 1.0.0
	 * @apiName updateRelatedOrgs
	 * @apiGroup Admin
	 * @apiParamExample {json} Request-Body:
		{
			"entity": "organization",
			"eventType": "update",
			"entityId": "<org_id>",
			"changes": {
				"name": { "oldValue": "Old Org Name", "newValue": "New Org Name" },
				"related_org_details": {
						"oldValue": [
							{
								"id" : 1,
								"code" : "mys"
							}
						], 
						"newValue": [
							{
								"id" : 12,
								"code" : "blr"
							}
						]
				}
			},
			"id": "<org_id>",
			"updated_by": "<user_id>",
			"tenant_code": "<tenant_code>",
			"code": "<org_code>",
			"updated_at": "<timestamp>"
		}
	* @apiHeader {String} X-auth-token Authenticity token
	* @apiSampleRequest /project/v1/admin/updateRelatedOrgs
	* @apiUse successBody
	* @apiUse errorBody
	* @apiParamExample {json} Response:
		{
			"status": 200,
			"message": "Related orgs updated successfully",
			"result": {
				"templatesFound": 12,
				"templatesUpdated" : 12
			}
		}
	*/

	/**
	 * Updates visibleToOrganizations field in parent project templates
	 *
	 * @method POST
	 * @name updateRelatedOrgs
	 * @param {Object} req - requested data.
	 * @returns {Object} success/failure response.
	 */
	async updateRelatedOrgs(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const updatedRelatedOrgs = await adminHelper.updateRelatedOrgs(req)
				return resolve(updatedRelatedOrgs)
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

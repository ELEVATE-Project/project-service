const organizationExtensionHelper = require(MODULES_BASE_PATH + '/organizationExtension/helper.js')

module.exports = class OrganizationExtension extends Abstract {
	constructor() {
		super('organizationExtension')
	}

	static get name() {
		return 'organizationExtension'
	}

	/**
	 * @api {post} /project/v1/organizationExtension/createOrUpdate             Create Organization Extension
	 * @apiVersion 1.0.0
	 * @apiName createOrUpdate
	 * @apiGroup organizationExtension
     * @apiHeader {String} X-auth-token Authenticity token
	 * @apiParamExample {json} Request-Body:
		{
			"externalProjectResourceVisibilityPolicy" : "CURRENT",
            "projectResourceVisibilityPolicy" : "CURRENT"
		}
	* @apiSampleRequest /project/v1/organizationExtension/createOrUpdate
	* @apiUse successBody
	* @apiUse errorBody
	* @apiParamExample {json} Response:
		{
			"status": 200,
			"message": "Organization extension created successfully",
			"result": {
                "_id" : 607f191e810c19729de860ea,
                "externalProjectResourceVisibilityPolicy" : "CURRENT",
                "projectResourceVisibilityPolicy" : "CURRENT",
                "createdBy" : "SYSTEM",
                "updatedBy" : "SYSTEM",
                "tenantId" : "shikshalokam",
                "orgId" : "mys"
			}
		}
	*/

	/**
	 * @api {patch} /project/v1/organizationExtension/createOrUpdate/:_id       Update Organization Extension
	 * @apiVersion 1.0.0
	 * @apiName createOrUpdate
	 * @apiGroup organizationExtension
	 * @apiHeader {String} X-auth-token Authenticity token
	 *
	 * @apiParam (Path) {String} id Unique organization extension ID
	 *
	 * @apiParamExample {json} Request-Body:
	 * {
	 *   "externalProjectResourceVisibilityPolicy" : "ALL",
	 *   "projectResourceVisibilityPolicy" : "CURRENT"
	 * }
	 *
	 * @apiSampleRequest /project/v1/organizationExtension/createOrUpdate/607f191e810c19729de860ea
	 * @apiUse successBody
	 * @apiUse errorBody
	 *
	 * @apiParamExample {json} Success-Response:
	 * {
	 *   "status": 200,
	 *   "message": "Organization extension updated successfully",
	 *   "result": {
	 *     "_id" : "607f191e810c19729de860ea",
	 *     "externalProjectResourceVisibilityPolicy" : "ALL",
	 *     "projectResourceVisibilityPolicy" : "CURRENT",
	 *     "createdBy" : "SYSTEM",
	 *     "updatedBy" : "SYSTEM",
	 *     "tenantId" : "shikshalokam",
	 *     "orgId" : "mys"
	 *   }
	 * }
	 */
	/**
	 * Creates/Updates organization extension document
	 *
	 * @method POST/PATCH
	 * @name update
	 * @param {Object} req - requested data.
	 * @returns {Object} success/failure response.
	 */
	async createOrUpdate(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let organizationExtension
				if (req.method === CONSTANTS.common.API_REQUEST_METHODS.POST) {
					organizationExtension = await organizationExtensionHelper.createOrgExtension(req)
				} else if (req.method === CONSTANTS.common.API_REQUEST_METHODS.PATCH) {
					organizationExtension = await organizationExtensionHelper.updateOrgExtension(req)
				}
				return resolve(organizationExtension)
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
	 * @api {post} /project/v1/organizationExtension/updateRelatedOrgs 
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
	* @apiSampleRequest /project/v1/organizationExtension/updateRelatedOrgs
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
				const updatedRelatedOrgs = await organizationExtensionHelper.updateRelatedOrgs(req)
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

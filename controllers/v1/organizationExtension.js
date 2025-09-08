const organizationExtensionHelper = require(MODULES_BASE_PATH + '/organizationExtension/helper.js')

module.exports = class OrganizationExtension extends Abstract {
	constructor() {
		super('organizationExtension')
	}

	static get name() {
		return 'organizationExtension'
	}

	/**
	 * @api {post} /project/v1/organizationExtension/update             Create Organization Extension
	 * @apiVersion 1.0.0
	 * @apiName update
	 * @apiGroup organizationExtension
     * @apiHeader {String} X-auth-token Authenticity token
	 * @apiParamExample {json} Request-Body:
		{
			"externalProjectResourceVisibilityPolicy" : "CURRENT",
            "projectResourceVisibilityPolicy" : "CURRENT"
		}
	* @apiSampleRequest /project/v1/organizationExtension/update
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
	 * @api {patch} /project/v1/organizationExtension/update/:_id       Update Organization Extension
	 * @apiVersion 1.0.0
	 * @apiName update
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
	 * @apiSampleRequest /project/v1/organizationExtension/update/607f191e810c19729de860ea
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
	async update(req) {
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
	 * @api {post} /project/v1/organizationExtension/eventListener             Create default Organization Extension
	 * @apiVersion 1.0.0
	 * @apiName eventListener
	 * @apiGroup organizationExtension
     * @apiHeader {String} internal-access-token
	 * @apiParamExample {json} Request-Body:
		{
            "entity": "organization",
            "eventType": "create",
            "entityId": "1",
            "changes": {},
            "id": "1",
            "code": "mys",
            "tenant_code": "shikshalokam",
            "meta": {},
            "status": "ACTIVE",
            "deleted": false,
            "created_by": "<user_id>",
            "created_at": "<timestamp>",
            "updated_at": "<timestamp>"
        }
	* @apiSampleRequest /project/v1/organizationExtension/eventListener
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
	 * Listens to kafka event and creates organization extension document
	 *
	 * @method POST
	 * @name eventListener
	 * @param {Object} req - requested data.
	 * @returns {Object} success/failure response.
	 */
	async eventListener(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const orgExtension = await organizationExtensionHelper.createOrgExtension(req)
				return resolve(orgExtension)
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

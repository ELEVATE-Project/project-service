/**
 * name : certificateBaseTemplates.js
 * author : prajwal
 * created-date : 14-05-2024
 * Description : Certificate base template related information.
 */

//  Dependencies
const certificateBaseTemplatesHelper = require(MODULES_BASE_PATH + '/certificateBaseTemplates/helper')

module.exports = class CertificateBaseTemplates extends Abstract {
	//  Adding model schema
	constructor() {
		super('certificateBaseTemplates')
	}

	/**
    * @api {post/patch} /project/v1/certificateBaseTemplates/createOrUpdate
    * @apiVersion 1.0.0
    * @apiName Create certificate template
    * @apiGroup certificateBaseTemplates
    * @apiParamExample {json} Request-Body:
    *   {   
            "code": "SingleLogoSingleSign"
        }

    * @apiHeader {String} internal-access-token - internal access token  
    * @apiHeader {String} X-auth-user-token - Authenticity token
    * @apiSampleRequest /project/v1/certificateBaseTemplates/createOrUpdate
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    *   {
            "status": 200,
            "message": "Base template added successfully",
            "result": {
                    id": "6011136a2d25b926974d9ec9"
            }
        }
    */

	/**
	 * Create/update certificate base template.
	 * @method
	 * @name createOrUpdate
	 * @param {Object} req - requested data.
	 * @returns {JSON} Created certificate base template data.
	 */

	async createOrUpdate(req) {
		return new Promise(async (resolve, reject) => {
			try {
				if (req.method === 'POST') {
					if (req.files && req.files.file) {
						let certificateBaseTemplateData = await certificateBaseTemplatesHelper.create(
							req.body,
							req.files,
							req.userDetails.userInformation.userId
						)
						return resolve(certificateBaseTemplateData)
					} else {
						throw {
							status: HTTP_STATUS_CODE.bad_request.status,
							message: HTTP_STATUS_CODE.bad_request.message,
						}
					}
				} else if (req.method === 'PATCH') {
					let certificateBaseTemplateData = await certificateBaseTemplatesHelper.update(
						req.params._id,
						req.body,
						req.files,
						req.userDetails.userInformation.userId
					)
					certificateBaseTemplateData['result'] = certificateBaseTemplateData.data
					return resolve(certificateBaseTemplateData)
				}
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

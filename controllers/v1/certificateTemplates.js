/**
 * name : certificateTemplates.js
 * author : Vishnu
 * created-date : 24-May-2024
 * Description : Certificate template related information.
 */

//  Dependencies
const certificateTemplateHelper = require(MODULES_BASE_PATH + '/certificateTemplates/helper')

module.exports = class CertificateTemplates extends Abstract {
	//  Adding model schema
	constructor() {
		super('certificateTemplates')
	}

	/**
    * @api {post/patch} /project/v1/certificateTemplates/createOrUpdate
    * @apiVersion 1.0.0
    * @apiName Create certificate template
    * @apiGroup CertificateTemplates
    * @apiParamExample {json} Request-Body:
    *   {   "templateUrl" :"certificate/b84ac8b2-2ca9-4132-9805-f11ca474aecc/168/516a3180-a52e-44f8-bcc8-055b335715e0/22-4-2024-1716363621461_3562.svg",
            "criteria" : {
                "validationText" : "Complete validation message",
                "expression" : "C1&&C2&&C3",
                "conditions" : {
                    "C1" : 	{
                        "validationText" : "Project Should be submitted within program Enddate",
                        "expression" : "C1&&C2",
                        "conditions" : {
                            "C1" : {
                                "scope" : "project",
                                "key" : "status",
                                "operator" : "==",
                                "value" : "submitted"
                            },
                            "C2" : {
                                "scope" : "project",
                                "key" : "completedDate",
                                "operator" : "<",
                                "value" : "15-08-2022"
                            }
                        }
                    },
                    "C2" : 	{
                        "validationText" : "Evidence project level validation",
                        "expression" : "C1",
                        "conditions" : {
                            "C1" : {
                                    "scope" : "project",
                                    "key" : "attachments",
                                    "function" : "count",
                                    "filter" : {
                                        "key" : "type",
                                        "value" : "all"
                                    },
                                    "operator" : ">",
                                    "value" : 1
                            }
                        }
                    },
                    "C3" : 	{
                        "validationText" : "Evidence task level validation",
                        "expression" : "C1&&C2&&C3",
                        "conditions" : {
                            "C1" : {
                                "scope" : "task",
                                "key" : "attachments",
                                "function" : "count",
                                "filter" : {
                                    "key" : "type",
                                    "value" : "all"
                                },
                                "operator" : ">",
                                "value" : 1
                            }
                        }
                    }
                }
            },
            "issuer": {
                "name":"Karnataka"
            },
            "status" : "active",
            "solutionId" : "665071a2faa2f74c674721c4",
            "programId" : "66507116faa2f74c674721be"

        }

    * @apiHeader {String} internal-access-token - internal access token  
    * @apiHeader {String} X-auth-user-token - Authenticity token
    * @apiSampleRequest /project/v1/certificateTemplates/create
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    *   {
            "status": 200,
            "message": "Template added successfully",
            "result": {
                    id": "6011136a2d25b926974d9ec9"
            }
        }
    */

	/**
	 * Create/update certificate template.
	 * @method
	 * @name createOrUpdate
	 * @param {Object} req - requested data.
	 * @returns {JSON} Created or updated certificate template data.
	 */

	async createOrUpdate(req) {
		return new Promise(async (resolve, reject) => {
			try {
				// Check if the request method is POST
				if (req.method === 'POST') {
					// Call the create method of certificateTemplateHelper with the provided data
					let certificateTemplateData = await certificateTemplateHelper.create(req.body)
					// Resolve the promise with the created certificate template data
					return resolve(certificateTemplateData)
				} else if (req.method === 'PATCH') {
					// Call the update method of certificateTemplateHelper with the provided data
					let certificateTemplateData = await certificateTemplateHelper.update(req.params._id, req.body)
					// Resolve the promise with the updated certificate template data
					return resolve(certificateTemplateData)
				}
			} catch (error) {
				// Reject the promise with an error object containing status and message
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
    * @api {post} /project/v1/certificateTemplates/uploadTemplate/:_id?updateTemplate=
    * @apiVersion 1.0.0
    * @apiName upload certificate template
    * @apiGroup uploadCertificateTemplate
    * @apiHeader {String} internal-access-token - internal access token  
    * @apiHeader {String} X-auth-user-token - Authenticity token
    * @apiSampleRequest /project/v1/certificateTemplates/uploadTemplate
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    *   {
            "message": "File uploaded successfully",
            "status": 200,
            "result": {
                "success": true,
                "data": {
                    "templateUrl": "certificate/b84ac8b2-2ca9-4132-9805-f11ca474aecc/168/516a3180-a52e-44f8-bcc8-055b335715e0/22-4-2024-1716363621461_3562.svg"
                }
            }
        }
    */

	/**
	 * uploadTemplate.
	 * @method
	 * @name uploadTemplate
	 * @param {Object} req - requested data.
	 * @returns {JSON} file uploaded details.
	 */

	async uploadTemplate(req) {
		return new Promise(async (resolve, reject) => {
			try {
				// Check if files are provided in the request
				if (req.files && req.files.file) {
					// Call the uploadToCloud method of certificateTemplateHelper with the provided data
					let uploadedTemplateDetails = await certificateTemplateHelper.uploadToCloud(
						req.files,
						req.params._id,
						req.userDetails ? req.userDetails.userInformation.userId : '',
						req.query.updateTemplate ? req.query.updateTemplate : true
					)
					// Resolve the promise with the uploaded template details
					return resolve({
						message: CONSTANTS.apiResponses.FILE_UPLOADED,
						result: uploadedTemplateDetails,
					})
				} else {
					// Reject the promise if files are not provided in the request
					return reject({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: HTTP_STATUS_CODE.bad_request.message,
					})
				}
			} catch (error) {
				// Reject the promise with an error object containing status and message
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
    * @api {post} /project/v1/certificateTemplates/createSvg
    * @apiVersion 1.0.0
    * @apiName createSvg certificate template svg
    * @apiGroup createSvg
    * @apiHeader {String} internal-access-token - internal access token  
    * @apiHeader {String} X-auth-user-token - Authenticity token
    * @apiSampleRequest /project/v1/certificateTemplates/createSvg?baseTemplateId=
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    *   {
            "message": "Template edited successfully",
            "status": 200,
            "result": {
                "url": "https://sunbirdstagingpublic.blob.core.windows.net/samiksha/certificateTemplates/BASE_TEMPLATE/_22-10-2022-1669120782574.svg?sv=2020-10-02&st=2022-11-22T12%3A39%3A42Z&se=2023-11-22T12%3A49%3A42Z&sr=b&sp=rw&sig=gLnKb1T32swAQQ%2Bgtaaa967d6c0GIL%2FGRcGCwjvpI30%3D"
        }
}
    */

	/**
	 * generate cettificate templateSvg.
	 * @method
	 * @name createSvg
	 * @param {Object} req - requested data.
	 * @returns {JSON} -svg uploaded details.
	 */

	async createSvg(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let svgData = await certificateTemplateHelper.createSvg(req.files, req.body, req.query.baseTemplateId)
				return resolve(svgData)
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

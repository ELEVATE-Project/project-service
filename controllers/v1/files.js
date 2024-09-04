/**
 * name : files.js
 * author : Vishnu
 * created-date : 01-Sep-2023
 * Description :  Files Controller.
*/

// dependencies
let filesHelpers = require(MODULES_BASE_PATH + "/files/helper");

/**
    * Files service.
    * @class
*/

module.exports = class Files {

    /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
    */

    /**
     * @apiDefine successBody
     * @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
    */

    constructor() { }

    static get name() {
        return "files";
    }


    /**
     * @api 				- {post} /improvement-project/api/v1/cloud-services/files/preSignedUrls  
     * 						- Get signed URL.
     * @apiVersion 			- 1.0.0
     * @apiGroup 			- Files
     * @apiHeader 			- {String} X-authenticated-user-token Authenticity token
     * @apiParamExample 	- {json} Request:
     * 	{
			"files": ["uploadFile.jpg", "uploadFile2.jpg"]
      	}
     * @apiSampleRequest 	- /improvement-project/api/v1/cloud-services/files/preSignedUrls
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
			"message": "File upload urls generated successfully.",
			"status": 200,
			"result": [
				{
					"file": "test.jpeg",
					"url": {
						"signedUrl": "https://mentoring-dev-storage.s3.ap-south-1.amazonaws.com/project/64b12ef31073b0dd429e19b4/d9f5b0c1-2f12-41ed-8406-ee67a42de611/test.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIASKKP73WS3TW4VASN%2F20230901%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20230901T134659Z&X-Amz-Expires=1800&X-Amz-Signature=785d0f8e6078a22f851d4ec9441385e09fcb0f660312f45035ad31a1595bc4cb&X-Amz-SignedHeaders=host",
						"filePath": "project/64b12ef31073b0dd429e19b4/d9f5b0c1-2f12-41ed-8406-ee67a42de611/test.jpeg"
					}
				},
				{
					"file": "test0.jpeg",
					"url": {
						"signedUrl": "https://mentoring-dev-storage.s3.ap-south-1.amazonaws.com/project/64b12ef31073b0dd429e19b4/6976fe12-4739-4edc-b6d6-f3b83148d1bf/test0.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIASKKP73WS3TW4VASN%2F20230901%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20230901T134659Z&X-Amz-Expires=1800&X-Amz-Signature=04c0ec746f41e07468023aa47fe0ec807897e4dc410e04c97a925e5f901ee683&X-Amz-SignedHeaders=host",
						"filePath": "project/64b12ef31073b0dd429e19b4/6976fe12-4739-4edc-b6d6-f3b83148d1bf/test0.jpeg"
					}
				}
			]
		}
    */

    /**
      * Get signed urls.
      * @method
      * @name 									- preSignedUrls
      * @param  {Request}  						- req  request body.
      * @param  {Array}  req.body.files 		- list of file names
      * @returns {JSON} 						- Response with status and message.
    */

   	async preSignedUrls(req) {
		return new Promise(async (resolve, reject) => {

			try {

				let signedUrl =
				await filesHelpers.preSignedUrls(
					req.body.files,
					req.userDetails.userInformation.userId
				);

				signedUrl["result"] = signedUrl["data"];
				return resolve(signedUrl);

			} catch (error) {
				
				return reject({
					status:
						error.status ||
						HTTP_STATUS_CODE['internal_server_error'].status,

					message:
						error.message
						|| HTTP_STATUS_CODE.internal_server_error.message,

					errorObject: error
				})
			}
		})
   	}

    /**
     * @api {post} 					- /improvement-project/api/v1/cloud-services/files/getDownloadableUrl  
     * 								- Get downloadable URL.
     * @apiVersion 					- 1.0.0
     * @apiGroup 					- Gcp
     * @apiHeader {String} 			- X-authenticated-user-token Authenticity token
     * @apiParamExample {json} 		- Request:
     * {
     *     "filePaths": ["project/64b12ef31073b0dd429e19b4/d9f5b0c1-2f12-41ed-8406-ee67a42de611/test.jpeg"]
     * }
     * @apiSampleRequest 			-	/kendra/api/v1/cloud-services/files/getDownloadableUrl
     * @apiUse 						- successBody
     * @apiUse 						- errorBody
     * @apiParamExample {json} 		- Response:
     * {
			"message": "Downloadable Url generated",
			"status": 200,
			"result": [
				{
					"filePath": "project/64b12ef31073b0dd429e19b4/d9f5b0c1-2f12-41ed-8406-ee67a42de611/test.jpeg",
					"url": "https://mentoring-dev-storage.s3.ap-south-1.amazonaws.com/project/64b12ef31073b0dd429e19b4/d9f5b0c1-2f12-41ed-8406-ee67a42de611/test.jpeg"
				}
			]
		}
     */

    /**
      * @description				- Get Downloadable URL from cloud service.
      * @method
      * @name 						- getDownloadableUrl
      * @param  {Request}  req  	- request body.
      * @returns {JSON} 			- Response with status and message.
    */

     async getDownloadableUrl(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let downloadableUrl =
                await filesHelpers.getDownloadableUrl(
                     req.body.filePaths
                );

                return resolve(downloadableUrl)

            } catch (error) {
                return reject({
                    status:
                        error.status ||
                        HTTP_STATUS_CODE['internal_server_error'].status,

                    message:
                        error.message
                        || HTTP_STATUS_CODE.internal_server_error.message,

                    errorObject: error
                })

            }
        })

    }

};


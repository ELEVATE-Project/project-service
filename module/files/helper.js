/**
 * name : files/helper.js
 * author : prajwal
 * created-date : 25-Apr-2024
 * Description : All files related helper functionality.Including uploading file
 * to cloud service.
 */

// Dependencies
const { cloudClient } = require(PROJECT_ROOT_DIRECTORY + '/config/cloud-service')
let cloudStorage = process.env.CLOUD_STORAGE_PROVIDER

/**
 * FilesHelper
 * @class
 */

module.exports = class FilesHelper {
	/**
	 * Get downloadable url
	 * @method
	 * @name                        - getDownloadableUrl
	 * @param {Array} [filePath]    - File path
	 * @param {String} bucketName   - Bucket name
	 * @param {String} storageName  - Storage name if provided.
	 * @param {Number} expireIn     - Link expire time.
	 * @return {Object}             - Object with the payloads and the respective urls
	 */

	static getDownloadableUrl(filePath, bucketName, storageName = '', expireIn = '') {
		return new Promise(async (resolve, reject) => {
			try {
				// Throw error if filePath is not an array
				if (!Array.isArray(filePath) || filePath.length < 1) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.INPUT_IS_NOT_A_VALID_ARRAY,
					}
				}
				// Override cloud storage provider name if provided explicitly.
				if (storageName !== '') {
					cloudStorage = storageName
				}
				// Initialise expireIn with env variable if it is empty.
				if (expireIn == '') {
					expireIn = parseInt(process.env.DOWNLOADABLE_URL_EXPIRY_IN_SECONDS)
				}

				if (Array.isArray(filePath) && filePath.length > 0) {
					let result = []

					// This loop helps in getting the downloadable url for all the uploaded files
					await Promise.all(
						filePath.map(async (element) => {
							let response = {}
							response.filePath = element
							// Get the downloadable URL from the cloud client SDK.
							// {sample response} : https://sunbirdstagingpublic.blob.core.windows.net/sample-name/reports/uploadFile2.jpg?st=2023-08-05T07%3A11%3A25Z&se=2024-02-03T14%3A11%3A25Z&sp=r&sv=2018-03-28&sr=b&sig=k66FWCIJ9NjoZfShccLmml3vOq9Lt%2FDirSrSN55UclU%3D
							response.url = await cloudClient.getDownloadableUrl(
								bucketName,
								element,
								expireIn // Link ExpireIn
							)
							result.push(response)
						})
					)
					return resolve({
						success: true,
						message: CONSTANTS.apiResponses.URL_GENERATED,
						result: result,
					})
				} else {
					let result
					// Get the downloadable URL from the cloud client SDK.
					result = await cloudClient.getDownloadableUrl(
						bucketName, // bucket name
						filePath, // resource file path
						expireIn // Link Expire time
					)

					let response = [
						{
							filePath: filePath,
							url: result,
						},
					]
					return resolve({
						success: true,
						message: CONSTANTS.apiResponses.URL_GENERATED,
						result: response,
					})
				}
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Get all signed urls.
	 * @method
	 * @name preSignedUrls
	 * @param {Array} [fileNames]                         - fileNames.
	 * @param {String} bucket                             - name of the bucket
	 * @param {String} storageName                        - Storage name if provided.
	 * @param {String} folderPath                         - folderPath
	 * @param {Number} expireIn                           - Link expire time.
	 * @param {String} permission                         - Action permission
	 * @param {Boolean} isFilePathPassed                  - true/false value
	 * @returns {Array}                                   - consists of all signed urls files.
	 */

	static preSignedUrls(
		fileNames,
		bucket,
		storageName = '',
		folderPath,
		expireIn = '',
		permission = '',
		isFilePathPassed = false
	) {
		return new Promise(async (resolve, reject) => {
			try {
				let actionPermission = CONSTANTS.common.WRITE_PERMISSION
				if (!Array.isArray(fileNames) || fileNames.length < 1) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.INPUT_IS_NOT_A_VALID_ARRAY,
					}
				}

				// Override cloud storage provider name if provided explicitly.
				if (storageName !== '') {
					cloudStorage = storageName
				}

				// Override actionPermission if provided explicitly.
				if (permission !== '') {
					actionPermission = permission
				}
				// Initialise expireIn with env variable if it is empty.
				if (expireIn == '') {
					expireIn = parseInt(process.env.PRESIGNED_URL_EXPIRY_IN_SECONDS)
				}

				// Create an array of promises for signed URLs
				// {sample response} : https://sunbirdstagingpublic.blob.core.windows.net/samiksha/reports/sample.pdf?sv=2020-10-02&st=2023-08-03T07%3A53%3A53Z&se=2023-08-03T08%3A53%3A53Z&sr=b&sp=w&sig=eZOHrBBH%2F55E93Sxq%2BHSrniCEmKrKc7LYnfNwz6BvWE%3D
				const signedUrlsPromises = fileNames.map(async (fileName) => {
					let file
					let response
					if (isFilePathPassed) {
						file = fileName
						response = {
							payload: { sourcePath: file },
						}
					} else {
						file = folderPath && folderPath !== '' ? folderPath + fileName : fileName
						response = {
							file: fileName,
							payload: { sourcePath: file },
						}
					}
					response.url = await cloudClient.getSignedUrl(
						bucket, // bucket name
						file, // file path
						expireIn, // expire
						actionPermission // read/write
					)

					response.url = Array.isArray(response.url) ? response.url[0] : response.url

					return response
				})

				// Wait for all signed URLs promises to resolve
				const signedUrls = await Promise.all(signedUrlsPromises)

				// Return success response with the signed URLs
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.URL_GENERATED,
					result: signedUrls,
				})
			} catch (error) {
				return reject({
					success: false,
					message: CONSTANTS.apiResponses.FAILED_PRE_SIGNED_URL,
					error: error,
				})
			}
		})
	}
}

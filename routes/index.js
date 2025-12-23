/**
 * name : index.js
 * author : Aman Karki
 * Date : 13-July-2020
 * Description : All routes.
 */

// Dependencies
const authenticator = require(PROJECT_ROOT_DIRECTORY + '/generics/middleware/authenticator')
const pagination = require(PROJECT_ROOT_DIRECTORY + '/generics/middleware/pagination')
const addTenantAndOrgInRequest = require(PROJECT_ROOT_DIRECTORY + '/generics/middleware/addTenantAndOrgInRequest')
const checkAdminRole = require(PROJECT_ROOT_DIRECTORY + '/generics/middleware/checkAdminRole')
const fs = require('fs')
const inputValidator = require(PROJECT_ROOT_DIRECTORY + '/generics/middleware/validator')
const path = require('path')
const https = require('https')

module.exports = function (app) {
	const applicationBaseUrl = process.env.APPLICATION_BASE_URL || '/project/'
	app.use(applicationBaseUrl, authenticator)
	app.use(applicationBaseUrl, pagination)
	app.use(applicationBaseUrl, addTenantAndOrgInRequest)
	app.use(applicationBaseUrl, checkAdminRole)

	var router = async function (req, res, next) {
		if (!req.params.version) {
			next()
		} else if (!controllers[req.params.version]) {
			next()
		} else if (!controllers[req.params.version][req.params.controller]) {
			next()
		} else if (
			!(
				controllers[req.params.version][req.params.controller][req.params.method] ||
				controllers[req.params.version][req.params.controller][req.params.file][req.params.method]
			)
		) {
			next()
		} else if (req.params.method.startsWith('_')) {
			next()
		} else {
			try {
				let validationError = req.validationErrors()

				if (validationError.length) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: validationError,
					}
				}

				let result

				if (req.params.file) {
					result = await controllers[req.params.version][req.params.controller][req.params.file][
						req.params.method
					](req)
				} else {
					result = await controllers[req.params.version][req.params.controller][req.params.method](req)
				}

				if (result.isResponseAStream == true) {
					if (result.fileNameWithPath) {
						fs.exists(result.fileNameWithPath, function (exists) {
							if (exists) {
								res.setHeader(
									'Content-disposition',
									'attachment; filename=' + result.fileNameWithPath.split('/').pop()
								)
								res.set('Content-Type', 'application/octet-stream')
								fs.createReadStream(result.fileNameWithPath).pipe(res)
							} else {
								throw {
									status: 500,
									message: 'Oops! Something went wrong!',
								}
							}
						})
					} else if (result.fileURL) {
						let extName = path.extname(result.file)
						let uniqueFileName = 'File_' + UTILS.generateUniqueId() + extName
						https
							.get(result.fileURL, (fileStream) => {
								res.setHeader('Content-Disposition', `attachment; filename="${uniqueFileName}"`)
								res.setHeader('Content-Type', fileStream.headers['content-type'])
								fileStream.pipe(res)
							})
							.on('error', (err) => {
								console.error('Error downloading the file:', err)
								throw err
							})
					} else {
						throw {
							status: 500,
							message: 'Oops! Something went wrong!',
						}
					}
				} else {
					res.status(result.status ? result.status : HTTP_STATUS_CODE['ok'].status).json({
						message: result.message,
						status: result.status ? result.status : HTTP_STATUS_CODE['ok'].status,
						result: result.data,
						result: result.result,
						total: result.total,
						count: result.count,
					})
				}

				console.log('-------------------Response log starts here-------------------')
				console.log(JSON.stringify(result))
				console.log('-------------------Response log ends here-------------------')
			} catch (error) {
				res.status(error.status ? error.status : HTTP_STATUS_CODE.bad_request.status).json({
					status: error.status ? error.status : HTTP_STATUS_CODE.bad_request.status,
					message: error.message,
					result: error.result,
				})
			}
		}
	}

	app.all(applicationBaseUrl + ':version/:controller/:method', inputValidator, router)
	app.all(applicationBaseUrl + ':version/:controller/:file/:method', inputValidator, router)
	app.all(applicationBaseUrl + ':version/:controller/:method/:_id', inputValidator, router)
	app.all(applicationBaseUrl + ':version/:controller/:file/:method/:_id', inputValidator, router)

	app.use((req, res, next) => {
		res.status(HTTP_STATUS_CODE['not_found'].status).send(HTTP_STATUS_CODE['not_found'].message)
	})
}

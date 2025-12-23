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
const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()

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

				logger.debug('-------------------Response log starts here-------------------')
				try {
					logger.debug(JSON.stringify(result))
				} catch (e) {
					logger.debug(result)
				}
				logger.debug('-------------------Response log ends here-------------------')
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

	// Helper function for library category routes
	const createLibraryApiRouteHandler = (controllerMethod) => {
		return async (req, res, next) => {
			try {
				let validationError = req.validationErrors()
				if (validationError.length) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: validationError,
					}
				}

				// Route library/category requests to library/categories controller
				if (
					!controllers['v1'] ||
					!controllers['v1']['library'] ||
					!controllers['v1']['library']['categories']
				) {
					return res.status(HTTP_STATUS_CODE['not_found'].status).json({
						status: HTTP_STATUS_CODE['not_found'].status,
						message: 'Controller not found',
					})
				}

				if (!controllers['v1']['library']['categories'][controllerMethod]) {
					return res.status(HTTP_STATUS_CODE['not_found'].status).json({
						status: HTTP_STATUS_CODE['not_found'].status,
						message: 'Method not found',
					})
				}

				req.params = {
					version: 'v1',
					controller: 'library',
					file: 'categories',
					method: controllerMethod,
					_id: req.params.id || req.params._id,
				}

				const result = await controllers['v1']['library']['categories'][controllerMethod](req)

				res.status(result.status ? result.status : HTTP_STATUS_CODE['ok'].status).json({
					message: result.message,
					status: result.status ? result.status : HTTP_STATUS_CODE['ok'].status,
					result: result.data || result.result,
					total: result.total,
					count: result.count,
				})
			} catch (error) {
				res.status(error.status ? error.status : HTTP_STATUS_CODE.bad_request.status).json({
					status: error.status ? error.status : HTTP_STATUS_CODE.bad_request.status,
					message: error.message,
					result: error.result,
				})
			}
		}
	}

	// GET /categories/projects/:id -> GET /project/v1/library/categories/projects/:id
	app.get('/categories/projects/:id', inputValidator, createLibraryApiRouteHandler('projectsByCategoryId'))

	// Legacy library category routes compatibility - Projects by Category ID
	app.get(
		applicationBaseUrl + 'v1/library/categories/projects/:id',
		inputValidator,
		createLibraryApiRouteHandler('projectsByCategoryId')
	)

	// POST /categories/projects/list -> Fetch projects from multiple categories (with pagination)
	app.post('/categories/projects/list', inputValidator, createLibraryApiRouteHandler('projectList'))

	// POST /project/v1/library/categories/projects/list -> Fetch projects from multiple categories
	app.post(
		applicationBaseUrl + 'v1/library/categories/projects/list',
		inputValidator,
		createLibraryApiRouteHandler('projectList')
	)

	// POST /project/v1/library/categories/projects/bulk -> Bulk fetch projects (without pagination limits)
	app.post(
		applicationBaseUrl + 'v1/library/categories/projects/bulk',
		inputValidator,
		createLibraryApiRouteHandler('bulkProjects')
	)

	// Legacy library category routes compatibility
	// GET /project/v1/library/categories/list -> List categories
	app.get(applicationBaseUrl + 'v1/library/categories/list', inputValidator, createLibraryApiRouteHandler('list'))

	// POST /project/v1/library/categories/create -> Create category
	app.post(
		applicationBaseUrl + 'v1/library/categories/create',
		inputValidator,
		createLibraryApiRouteHandler('create')
	)

	// GET /project/v1/library/categories/details/:id -> Get category details
	app.get(
		applicationBaseUrl + 'v1/library/categories/details/:id',
		inputValidator,
		createLibraryApiRouteHandler('details')
	)

	// POST /project/v1/library/categories/update/:id -> Update category
	app.post(
		applicationBaseUrl + 'v1/library/categories/update/:id',
		inputValidator,
		createLibraryApiRouteHandler('update')
	)

	// GET /project/v1/library/categories/leaves -> Get leaf categories
	app.get(applicationBaseUrl + 'v1/library/categories/leaves', inputValidator, createLibraryApiRouteHandler('leaves'))

	// GET /project/v1/library/categories/hierarchy -> Get complete category hierarchy
	app.get(
		applicationBaseUrl + 'v1/library/categories/hierarchy',
		inputValidator,
		createLibraryApiRouteHandler('hierarchy')
	)

	// GET /project/v1/library/categories/:id/hierarchy -> Get hierarchy for specific category
	app.get(
		applicationBaseUrl + 'v1/library/categories/:id/hierarchy',
		inputValidator,
		createLibraryApiRouteHandler('categoryHierarchy')
	)

	// POST /project/v1/library/categories/bulk -> Bulk create categories
	app.post(applicationBaseUrl + 'v1/library/categories/bulk', inputValidator, createLibraryApiRouteHandler('bulk'))

	// PATCH /project/v1/library/categories/move/:id -> Move category
	app.patch(
		applicationBaseUrl + 'v1/library/categories/move/:id',
		inputValidator,
		createLibraryApiRouteHandler('move')
	)

	// GET /project/v1/library/categories/canDelete/:id -> Check if category can be deleted
	app.get(
		applicationBaseUrl + 'v1/library/categories/canDelete/:id',
		inputValidator,
		createLibraryApiRouteHandler('canDelete')
	)

	// DELETE /project/v1/library/categories/delete/:id -> Delete category
	app.delete(
		applicationBaseUrl + 'v1/library/categories/delete/:id',
		inputValidator,
		createLibraryApiRouteHandler('delete')
	)

	app.use((req, res, next) => {
		res.status(HTTP_STATUS_CODE['not_found'].status).send(HTTP_STATUS_CODE['not_found'].message)
	})
}

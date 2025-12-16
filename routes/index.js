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

	// Route aliases for /categories/* endpoints (matching specification)
	// These map to /project/v1/projectCategories/* endpoints
	// Apply middleware to /categories routes
	app.use('/categories', authenticator)
	app.use('/categories', pagination)
	app.use('/categories', addTenantAndOrgInRequest)
	app.use('/categories', checkAdminRole)

	// Helper function to create API route handlers that directly call the controller
	const createApiRouteHandler = (controllerMethod) => {
		return async (req, res, next) => {
			try {
				// Validate input
				let validationError = req.validationErrors()
				if (validationError.length) {
					throw {
						status: HTTP_STATUS_CODE.bad_request.status,
						message: validationError,
					}
				}

				// Check if controller and method exist
				if (!controllers['v1'] || !controllers['v1']['projectCategories']) {
					return res.status(HTTP_STATUS_CODE['not_found'].status).json({
						status: HTTP_STATUS_CODE['not_found'].status,
						message: 'Controller not found',
					})
				}

				if (!controllers['v1']['projectCategories'][controllerMethod]) {
					return res.status(HTTP_STATUS_CODE['not_found'].status).json({
						status: HTTP_STATUS_CODE['not_found'].status,
						message: 'Method not found',
					})
				}

				// Set params for compatibility
				req.params = {
					version: 'v1',
					controller: 'projectCategories',
					method: controllerMethod,
					_id: req.params.id || req.params._id,
				}

				// Call the controller method directly
				const result = await controllers['v1']['projectCategories'][controllerMethod](req)

				// Handle response
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

	// IMPORTANT: Specific routes must come BEFORE generic :id routes to avoid conflicts

	// Special endpoints (must come first)
	// GET /categories/hierarchy -> Get complete category tree
	app.get('/categories/hierarchy', inputValidator, createApiRouteHandler('hierarchy'))

	// GET /categories/leaves -> Get leaf categories only
	app.get('/categories/leaves', inputValidator, createApiRouteHandler('leaves'))

	// POST /categories/bulk -> Bulk create categories
	app.post('/categories/bulk', inputValidator, createApiRouteHandler('bulk'))

	// Standard REST endpoints
	// GET /categories -> List all categories (with query params for filtering)
	app.get('/categories', inputValidator, createApiRouteHandler('list'))

	// POST /categories -> Create new category
	app.post('/categories', inputValidator, createApiRouteHandler('create'))

	// Action endpoints with :id (must come before generic GET /categories/:id)
	// PATCH /categories/:id/move -> Move category to different parent
	app.patch('/categories/:id/move', inputValidator, createApiRouteHandler('move'))

	// GET /categories/:id/can-delete -> Check if category can be deleted
	app.get('/categories/:id/can-delete', inputValidator, createApiRouteHandler('canDelete'))

	// Generic :id endpoints (must come last)
	// GET /categories/:id -> Get single category details
	app.get('/categories/:id', inputValidator, createApiRouteHandler('details'))

	// PATCH /categories/:id -> Update category
	app.patch('/categories/:id', inputValidator, createApiRouteHandler('update'))

	// DELETE /categories/:id -> Delete category
	app.delete('/categories/:id', inputValidator, createApiRouteHandler('delete'))

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
	app.get('/categories/projects/:id', inputValidator, createLibraryApiRouteHandler('projects'))

	// POST /categories/projects/list -> Bulk fetch projects from multiple categories
	app.post('/categories/projects/list', inputValidator, createLibraryApiRouteHandler('projectList'))

	// POST /project/v1/library/categories/projects/list -> Bulk fetch projects
	app.post(
		applicationBaseUrl + 'v1/library/categories/projects/list',
		inputValidator,
		createLibraryApiRouteHandler('projectList')
	)

	app.use((req, res, next) => {
		res.status(HTTP_STATUS_CODE['not_found'].status).send(HTTP_STATUS_CODE['not_found'].message)
	})
}

/**
 * name : projectCategories.js
 * author : Implementation Team
 * created-date : December 2025
 * Description : Project categories controller with hierarchical support.
 */

// Dependencies
const projectCategoriesHelper = require(MODULES_BASE_PATH + '/projectCategories/helper')

/**
 * ProjectCategories service.
 * @class
 */
module.exports = class ProjectCategories extends Abstract {
	// Adding model schema
	constructor() {
		super('project-categories')
	}

	/**
	 * @api {post} /project/v1/projectCategories/create
	 * @apiVersion 1.0.0
	 * @apiName create
	 * @apiGroup ProjectCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async create(req) {
		try {
			const result = await projectCategoriesHelper.create(req.body, req.files, req.userDetails)
			if (result.success) {
				return {
					success: true,
					message: result.message,
					result: result.data,
				}
			} else {
				throw {
					message: result.message,
					status: result.status || HTTP_STATUS_CODE.bad_request.status,
				}
			}
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	/**
	 * @api {get} /project/v1/projectCategories/list
	 * @apiVersion 1.0.0
	 * @apiName list
	 * @apiGroup ProjectCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async list(req) {
		try {
			const result = await projectCategoriesHelper.list(req)
			return {
				success: true,
				message: result.message,
				result: result.data,
			}
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	/**
	 * @api {get} /project/v1/projectCategories/hierarchy
	 * @apiVersion 1.0.0
	 * @apiName hierarchy
	 * @apiGroup ProjectCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async hierarchy(req) {
		try {
			const result = await projectCategoriesHelper.getHierarchy(req)
			return {
				success: true,
				message: result.message,
				result: result.data,
			}
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	/**
	 * @api {patch} /project/v1/projectCategories/update/:id
	 * @apiVersion 1.0.0
	 * @apiName update
	 * @apiGroup ProjectCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async update(req) {
		try {
			const findQuery = {
				_id: req.params._id,
			}
			const result = await projectCategoriesHelper.update(findQuery, req.body, req.files, req.userDetails)
			if (result.success) {
				return {
					success: true,
					message: result.message,
				}
			} else {
				throw {
					message: result.message,
					status: result.status || HTTP_STATUS_CODE.bad_request.status,
				}
			}
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	/**
	 * @api {patch} /project/v1/projectCategories/move/:id
	 * @apiVersion 1.0.0
	 * @apiName move
	 * @apiGroup ProjectCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async move(req) {
		try {
			const categoryId = req.params._id
			const newParentId = req.body.newParentId || null
			const tenantId = req.body.tenantId || req.userDetails.tenantAndOrgInfo.tenantId
			const orgId = req.body.orgId || req.userDetails.tenantAndOrgInfo.orgId[0]

			const result = await projectCategoriesHelper.move(categoryId, newParentId, tenantId, orgId)
			if (result.success) {
				return {
					success: true,
					message: result.message,
					result: result.data,
				}
			} else {
				throw {
					message: result.message,
					status: result.status || HTTP_STATUS_CODE.bad_request.status,
				}
			}
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	/**
	 * @api {get} /project/v1/projectCategories/leaves
	 * @apiVersion 1.0.0
	 * @apiName leaves
	 * @apiGroup ProjectCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async leaves(req) {
		try {
			const result = await projectCategoriesHelper.getLeaves(req)
			return {
				success: true,
				message: result.message,
				result: result.data,
			}
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	/**
	 * @api {get} /project/v1/projectCategories/canDelete/:id
	 * @apiVersion 1.0.0
	 * @apiName canDelete
	 * @apiGroup ProjectCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async canDelete(req) {
		try {
			const categoryId = req.params._id
			const tenantId = req.query.tenantId || req.userDetails.tenantAndOrgInfo.tenantId
			const orgId = req.query.orgId || req.userDetails.tenantAndOrgInfo.orgId[0]

			const result = await projectCategoriesHelper.canDelete(categoryId, tenantId, orgId)
			return {
				success: true,
				message: result.data.canDelete ? 'Category can be deleted' : 'Category cannot be deleted',
				result: result.data,
			}
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	/**
	 * @api {post} /project/v1/projectCategories/bulk
	 * @apiVersion 1.0.0
	 * @apiName bulk
	 * @apiGroup ProjectCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	/**
	 * @api {delete} /project/v1/projectCategories/delete/:id
	 * @apiVersion 1.0.0
	 * @apiName delete
	 * @apiGroup ProjectCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async delete(req) {
		try {
			const categoryId = req.params._id
			const tenantId = req.query.tenantId || req.userDetails.tenantAndOrgInfo.tenantId
			const orgId = req.query.orgId || req.userDetails.tenantAndOrgInfo.orgId[0]

			const result = await projectCategoriesHelper.delete(categoryId, tenantId, orgId)
			if (result.success) {
				return {
					success: true,
					message: result.message,
					result: result.data,
				}
			} else {
				throw {
					message: result.message,
					status: result.status || HTTP_STATUS_CODE.bad_request.status,
				}
			}
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	async bulk(req) {
		try {
			const categories = req.body.categories || []
			const tenantId = req.body.tenantId || req.userDetails.tenantAndOrgInfo.tenantId
			const orgId = req.body.orgId || req.userDetails.tenantAndOrgInfo.orgId[0]

			const result = await projectCategoriesHelper.bulkCreate(categories, tenantId, orgId, req.userDetails)
			return {
				success: true,
				message: result.message,
				result: result.data,
			}
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}
}

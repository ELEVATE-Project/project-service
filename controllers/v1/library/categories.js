/**
 * name : categories.js
 * author : Implementation Team
 * created-date : December 2025
 * Description : Library categories controller with hierarchical support.
 */

// Dependencies
const libraryCategoriesHelper = require(MODULES_BASE_PATH + '/library/categories/helper')

/**
 * Library Categories service.
 * @class
 */
module.exports = class LibraryCategories extends Abstract {
	// Adding model schema
	constructor() {
		super('project-categories')
	}

	/**
	 * @api {post} /project/v1/library/categories/create
	 * @apiVersion 1.0.0
	 * @apiName create
	 * @apiGroup LibraryCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async create(req) {
		try {
			const result = await libraryCategoriesHelper.create(req.body, req.files, req.userDetails)
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
	 * @api {get} /project/v1/library/categories/list
	 * @apiVersion 1.0.0
	 * @apiName list
	 * @apiGroup LibraryCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async list(req) {
		try {
			const result = await libraryCategoriesHelper.list(req)
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
	 * @api {get} /project/v1/library/categories/hierarchy
	 * @apiVersion 1.0.0
	 * @apiName hierarchy
	 * @apiGroup LibraryCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async hierarchy(req) {
		try {
			const result = await libraryCategoriesHelper.getHierarchy(req)
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
	 * @api {get} /project/v1/library/categories/:id/hierarchy
	 * @apiVersion 1.0.0
	 * @apiName categoryHierarchy
	 * @apiGroup LibraryCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async categoryHierarchy(req) {
		try {
			const categoryId = req.params._id
			const result = await libraryCategoriesHelper.getCategoryHierarchy(categoryId, req)
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
	 * @api {post} /project/v1/library/categories/update/:id
	 * @apiVersion 1.0.0
	 * @apiName update
	 * @apiGroup LibraryCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async update(req) {
		try {
			const findQuery = {
				_id: req.params._id,
			}
			const result = await libraryCategoriesHelper.update(findQuery, req.body, req.files, req.userDetails)
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
	 * @api {patch} /project/v1/library/categories/move/:id
	 * @apiVersion 1.0.0
	 * @apiName move
	 * @apiGroup LibraryCategories
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

			const result = await libraryCategoriesHelper.move(categoryId, newParentId, tenantId, orgId)
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
	 * @api {get} /project/v1/library/categories/leaves
	 * @apiVersion 1.0.0
	 * @apiName leaves
	 * @apiGroup LibraryCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async leaves(req) {
		try {
			const result = await libraryCategoriesHelper.getLeaves(req)
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
	 * @api {get} /project/v1/library/categories/canDelete/:id
	 * @apiVersion 1.0.0
	 * @apiName canDelete
	 * @apiGroup LibraryCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async canDelete(req) {
		try {
			const categoryId = req.params._id
			const tenantId = req.query.tenantId || req.userDetails.tenantAndOrgInfo.tenantId
			const orgId = req.query.orgId || req.userDetails.tenantAndOrgInfo.orgId[0]

			const result = await libraryCategoriesHelper.canDelete(categoryId, tenantId, orgId)
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
	 * @api {post} /project/v1/library/categories/bulk
	 * @apiVersion 1.0.0
	 * @apiName bulk
	 * @apiGroup LibraryCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async bulk(req) {
		try {
			const categories = req.body.categories || []
			const tenantId = req.body.tenantId || req.userDetails.tenantAndOrgInfo.tenantId
			const orgId = req.body.orgId || req.userDetails.tenantAndOrgInfo.orgId[0]

			const result = await libraryCategoriesHelper.bulkCreate(categories, tenantId, orgId, req.userDetails)
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
	 * @api {delete} /project/v1/library/categories/delete/:id
	 * @apiVersion 1.0.0
	 * @apiName delete
	 * @apiGroup LibraryCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async delete(req) {
		try {
			const categoryId = req.params._id
			const tenantId = req.query.tenantId || req.userDetails.tenantAndOrgInfo.tenantId
			const orgId = req.query.orgId || req.userDetails.tenantAndOrgInfo.orgId[0]

			const result = await libraryCategoriesHelper.delete(categoryId, tenantId, orgId)
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
	 * @api {get} /project/v1/library/categories/details/:id
	 * @apiVersion 1.0.0
	 * @apiName details
	 * @apiGroup LibraryCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async details(req) {
		try {
			const categoryId = req.params._id
			let tenantId = req.headers.tenantid

			if (req.userDetails && req.userDetails.tenantAndOrgInfo) {
				tenantId = req.userDetails.tenantAndOrgInfo.tenantId
			}

			if (!tenantId) {
				throw {
					message: 'Tenant ID is required',
					status: HTTP_STATUS_CODE.bad_request.status,
				}
			}

			const result = await libraryCategoriesHelper.details(categoryId, tenantId)
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
	 * @api {get} /project/v1/library/categories/projects/:id
	 * @apiVersion 1.0.0
	 * @apiName projectsByCategoryId
	 * @apiGroup LibraryCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async projectsByCategoryId(req) {
		try {
			// use standard pagination middleware values
			const limit = req.pageSize
			const offset = (req.pageNo - 1) * limit
			const search = req.searchText

			const categoryId = req.params._id ? req.params._id : ''
			const sort = req.query.sort

			const libraryProjects = await libraryCategoriesHelper.projects(
				[categoryId], // Pass single ID as array
				limit,
				offset,
				search,
				sort,
				req.userDetails
			)

			return {
				success: true,
				message: libraryProjects.message,
				result: libraryProjects.data,
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
	 * @api {post} /project/v1/library/categories/projects/list
	 * @apiVersion 1.0.0
	 * @apiName projectList
	 * @apiGroup LibraryCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async projectList(req) {
		try {
			const categoryIds = req.body.categoryIds || req.body.categoryExternalIds

			if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
				throw {
					status: HTTP_STATUS_CODE.bad_request.status,
					message: 'categoryIds or categoryExternalIds array is required',
				}
			}

			const limit = req.body.limit || req.pageSize
			let offset = req.body.offset
			if (!offset) {
				const pageNo = req.body.page || req.pageNo
				offset = (pageNo - 1) * limit
			}
			const searchText = req.body.searchText || req.searchText // here we can get the searchtext on post and get request

			// Call the same consolidated helper.projects method
			const libraryProjects = await libraryCategoriesHelper.projects(
				categoryIds,
				limit,
				offset,
				searchText,
				null,
				req.userDetails
			)

			return {
				success: true,
				message: libraryProjects.message,
				result: libraryProjects.data,
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
	 * @api {post} /project/v1/library/categories/projects/bulk
	 * @apiVersion 1.0.0
	 * @apiName bulkProjects
	 * @apiGroup LibraryCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 * @apiDescription Bulk fetch projects from multiple categories without pagination limits (for bulk operations)
	 */
	async bulkProjects(req) {
		try {
			const categoryIds = req.body.categoryIds || req.body.categoryExternalIds

			if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
				throw {
					status: HTTP_STATUS_CODE.bad_request.status,
					message: 'categoryIds or categoryExternalIds array is required',
				}
			}

			// For bulk operations, use a high limit or no limit
			const limit = req.body.limit || 1000 // Higher default for bulk operations
			let offset = req.body.offset || 0
			const searchText = req.body.searchText || req.searchText

			// Call the same consolidated helper.projects method
			const libraryProjects = await libraryCategoriesHelper.projects(
				categoryIds,
				limit,
				offset,
				searchText,
				null,
				req.userDetails
			)

			return {
				success: true,
				message: libraryProjects.message || 'Bulk projects fetched successfully',
				result: libraryProjects.data,
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

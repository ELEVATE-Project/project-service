/**
 * name : categories.js
 * author : Aman
 * created-date : 16-July-2020
 * Description : Library categories related information.
 */

// Dependencies

const libraryCategoriesHelper = require(MODULES_BASE_PATH + '/library/categories/helper')

/**
 * LibraryCategories
 * @class
 */

module.exports = class LibraryCategories extends Abstract {
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

	constructor() {
		super('project-categories')
	}

	static get name() {
		return 'projectCategories'
	}

	/**
    * @api {get} /improvement-project/api/v1/library/categories/projects/:categoryExternalId?page=:page&limit=:limit&search=:search&sort=:sort 
    * List of library projects.
    * @apiVersion 1.0.0
    * @apiGroup Library Categories
    * @apiSampleRequest /improvement-project/api/v1/library/categories/projects/community?page=1&limit=1&search=t&sort=importantProject
    * @apiParamExample {json} Response:
    * {
    "message": "Successfully fetched projects",
    "status": 200,
    "result": {
        "data" : [
            {
                "_id": "5f4c91b0acae343a15c39357",
                "averageRating": 2.5,
                "noOfRatings": 4,
                "name": "Test-template",
                "externalId": "Test-template1",
                "description" : "Test template description",
                "createdAt": "2020-08-31T05:59:12.230Z"
            }
        ], 
        "count": 7
    }
    }
    * @apiUse successBody
    * @apiUse errorBody
    */

	/**
	 * List of library categories projects.
	 * @method
	 * @name projects
	 * @param {Object} req - requested data
	 * @returns {Array} Library Categories project.
	 */
	async projects(req) {
		try {
			// use standard pagination middleware values
			const categoryId = req.params._id ? req.params._id : ''

			const libraryProjects = await libraryCategoriesHelper.projects(
				[categoryId], // Pass single ID as array
				req.pageSize,
				req.pageNo,
				req.searchText,
				req.query.sort,
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
	 * @api {post} /improvement-project/api/v1/library/categories/create
	 * List of library projects.
	 * @apiVersion 1.0.0
	 * @apiGroup Library Categories
	 * @apiSampleRequest /improvement-project/api/v1/library/categories/create
	 * {json} Request body
	 * @apiParamExample {json} Response:
	 *
	 * @apiUse successBody
	 * @apiUse errorBody
	 */

	/**
	 *Create new project-category.
	 * @method
	 * @name create
	 * @param {Object} req - requested data
	 * @returns {Object} Library project category details .
	 */

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
	 * @api {post} /improvement-project/api/v1/library/categories/update/_id
	 * List of library projects.
	 * @apiVersion 1.0.0
	 * @apiGroup Library Categories
	 * @apiSampleRequest /improvement-project/api/v1/library/categories/update
	 * {json} Request body
	 * @apiParamExample {json} Response:
	 *
	 * @apiUse successBody
	 * @apiUse errorBody
	 */

	/**
	 *Create new project-category.
	 * @method
	 * @name update
	 * @param {Object} req - requested data
	 * @returns {Array} Library Categories project.
	 */

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
    * @api {get} /improvement-project/api/v1/library/categories/list 
    * List of library categories.
    * @apiVersion 1.0.0
    * @apiGroup Library Categories
    * @apiSampleRequest /improvement-project/api/v1/library/categories/list
    * @apiParamExample {json} Response:
    {
    "message": "Project categories fetched successfully",
    "status": 200,
    "result": [
        {
            "name": "Community",
            "type": "community",
            "updatedAt": "2020-11-18T16:03:22.563Z",
            "projectsCount": 0,
            "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2FprojectCategories%2Fcommunity.png?alt=media"
        },
        {
            "name": "Education Leader",
            "type": "educationLeader",
            "updatedAt": "2020-11-18T16:03:22.563Z",
            "projectsCount": 0,
            "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2FprojectCategories%2FeducationLeader.png?alt=media"
        },
        {
            "name": "Infrastructure",
            "type": "infrastructure",
            "updatedAt": "2020-11-18T16:03:22.563Z",
            "projectsCount": 0,
            "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2FprojectCategories%2Finfrastructure.png?alt=media"
        },
        {
            "name": "Students",
            "type": "students",
            "updatedAt": "2020-11-18T16:03:22.563Z",
            "projectsCount": 0,
            "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2FprojectCategories%2Fstudents.png?alt=media"
        },
        {
            "name": "Teachers",
            "type": "teachers",
            "updatedAt": "2020-11-18T16:03:22.563Z",
            "projectsCount": 0,
            "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2FprojectCategories%2Fteachers.png?alt=media"
        }
    ]}
    * @apiUse successBody
    * @apiUse errorBody
    */

	/**
	 * List of library categories
	 * @method
	 * @name list
	 * @param {Object} req - requested data
	 * @returns {Array} Library categories.
	 */

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

	// (removed) Global hierarchy endpoint: implementation removed to keep only category-specific hierarchy

	/**
	 * @api {get} /project/v1/library/categories/:id/hierarchy
	 * @apiVersion 1.0.0
	 * @apiName categoryHierarchy
	 * @apiGroup LibraryCategories
	 * @apiHeader {String} X-auth-token Authenticity token
	 * @apiUse successBody
	 * @apiUse errorBody
	 */
	async hierarchy(req) {
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

			// Call the same consolidated helper.projects method
			const libraryProjects = await libraryCategoriesHelper.projects(
				categoryIds,
				req.pageSize,
				req.pageNo,
				req.searchText,
				req.query.sort,
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
}

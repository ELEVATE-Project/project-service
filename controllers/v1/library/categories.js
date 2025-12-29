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
			// Support both single and multiple category IDs
			let categoryIds = []

			// Method 1: Single ID from path parameter (GET /categories/:id/projects)
			if (req.params._id) {
				categoryIds = [req.params._id]
			}
			// Method 2: Comma-separated IDs from query string (GET /categories/projects?ids=id1,id2,id3)
			else if (req.query.ids) {
				categoryIds = req.query.ids
					.split(',')
					.map((id) => id.trim())
					.filter((id) => id)
			}

			if (!categoryIds || categoryIds.length === 0) {
				throw {
					status: HTTP_STATUS_CODE.bad_request.status,
					message:
						'categoryIds required - provide as path param, query string (comma-separated), or request body array',
				}
			}

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
			const result = await libraryCategoriesHelper.update(req)
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
			const result = await libraryCategoriesHelper.getCategoryHierarchy(req)
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

			if (!Array.isArray(categories) || categories.length === 0) {
				throw {
					status: HTTP_STATUS_CODE.bad_request.status,
					message: 'categories required - provide a non-empty array in request body',
				}
			}

			const result = await libraryCategoriesHelper.bulkCreate(categories, req.userDetails)
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
			const result = await libraryCategoriesHelper.delete(req)
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
	 * @api {get} /project/v1/library/categories/:id
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

			const result = await libraryCategoriesHelper.details(categoryId, req.userDetails)
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

/**
 * name : categories.js
 * author : Aman
 * created-date : 16-July-2020
 * Description : Library categories related information.
 */

// Dependencies

const libraryCategoriesHelper = require(MODULES_BASE_PATH + "/library/categories/helper");

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
        super("project-categories");
    }

    static get name() {
        return "projectCategories";
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
        return new Promise(async (resolve, reject) => {
            try {
                
				const libraryProjects = await libraryCategoriesHelper.projects(
					req.params._id ? req.params._id : '',
					req.pageSize,
					req.pageNo,
					req.searchText,
					req.query.sort,
					req.query.translation,
					UTILS.convertStringToBoolean(req.query.hasSpotlight)
				)
                
                return resolve({
                    message : libraryProjects.message,
                    result : libraryProjects.data
                });

            } catch (error) {
                return reject(error);
            }
        })
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

      async create(req) {
        return new Promise(async (resolve, reject) => {
            try {
                
                const libraryProjectcategory = 
                await libraryCategoriesHelper.create(req.body);
                
                return resolve({
                    message : libraryProjectcategory.message,
                    result : libraryProjectcategory.data
                });

            } catch (error) {
                return reject(error);
            }
        })
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

      async update(req) {
        return new Promise(async (resolve, reject) => {
            try {
                
                const findQuery = {
                    "_id" : req.params._id
                }
                const libraryProjectcategory = 
                await libraryCategoriesHelper.update(findQuery,req.body);
                
                return resolve({
                    message : libraryProjectcategory.message,
                    result : libraryProjectcategory.data
                });

            } catch (error) {
                return reject(error);
            }
        })
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

      async list() {
        return new Promise(async (resolve, reject) => {
            try {
                
                let projectCategories = await libraryCategoriesHelper.list();

                projectCategories.result = projectCategories.data;

                return resolve(projectCategories);

            } catch (error) {
                return reject({
                    status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
                    message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
                    errorObject: error
                });
            }
        })
    }


};

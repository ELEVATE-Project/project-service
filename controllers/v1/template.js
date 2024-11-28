/**
 * name : wishlist.js
 * author : Saish Borkar
 * created-date : 28-Nov-2024
 * Description :  template Controller.
 */

// dependencies
const libraryCategoriesHelper = require(MODULES_BASE_PATH + "/library/categories/helper");

/**
 * UserExtension service.
 * @class
 */

module.exports = class Template  {

	static get name() {
		return 'template'
	}

	/**
* @api {post} /project/v1/template/list
* @apiVersion 1.0.0
* @apiName add
* @apiGroup template
* @apiHeader {String} X-user-token Authenticity token
* @apiUse successBody
* @apiUse errorBody
* @apiParamExample {json} Response:
* {
    "message": "Successfully fetched projects",
    "status": 200
}
*/
	async list(req) {
        return new Promise(async (resolve, reject) => {
            try {

                const options = {};

                if (req.query.duration) options.duration = req.query.duration;
                if (req.query.roles) options.roles = req.query.roles;
                
				const libraryProjects = await libraryCategoriesHelper.projects(
					req.params._id ? req.params._id : '',
					req.pageSize,
					req.pageNo,
					req.searchText,
					req.query.sort,
					req.query.translation,
					UTILS.convertStringToBoolean(req.query.hasSpotlight),
                    options
				)
                
                return resolve({
                    message : libraryProjects.message,
                    result : libraryProjects.data
                });

            } catch (error) {
                console.log(error)
                return reject(error);
            }
        })
	}

}

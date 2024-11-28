/**
 * name : wishlist.js
 * author : PraveenDass
 * created-date : 26-Nov-2024
 * Description :  wishlist Controller.
 */

// dependencies
let wishlistHelper = require(MODULES_BASE_PATH + '/wishlist/helper')

/**
 * UserExtension service.
 * @class
 */

module.exports = class Wishlist extends Abstract {
	constructor() {
		super('user-extension')
	}

	static get name() {
		return 'wishlist'
	}

	/**
* @api {post} /project/v1/wishlist/add/:projectTemplateId
* @apiVersion 1.0.0
* @apiName add
* @apiGroup wishlist
* @apiHeader {String} X-user-token Authenticity token
* @apiUse successBody
* @apiUse errorBody
* @apiParamExample {json} Response:
* {
    "message": "projecttemplates added to wishlist successfully",
    "status": 200
}
*/
	async add(req) {
		try {
			let addProjectTempleteToWishlist = await wishlistHelper.add(
				req.params._id,
				req.userDetails ? req.userDetails.userInformation.userId : ''
			)
			if (addProjectTempleteToWishlist.success) {
				return {
					success: true,
					message: CONSTANTS.apiResponses.WISHLIST_ADDED,
				}
			} else {
				throw {
					message: CONSTANTS.apiResponses.WISHLIST_NOT_ADDED,
					status: HTTP_STATUS_CODE.bad_request.status,
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
* @api {post} /project/v1/wishlist/remove/:projectTemplateId
* @apiVersion 1.0.0
* @apiName remove
* @apiGroup wishlist
* @apiHeader {String} X-user-token Authenticity token
* @apiUse successBody
* @apiUse errorBody
* @apiParamExample {json} Response:
* {
    "message": "projecttemplates removed from wishlist successfully",
    "status": 200
}
*/
	async remove(req) {
		try {
			let removeProjectTempleteToWishlist = await wishlistHelper.remove(
				req.params._id,
				req.userDetails ? req.userDetails.userInformation.userId : ''
			)
			if (removeProjectTempleteToWishlist.success) {
				return {
					success: true,
					message: CONSTANTS.apiResponses.WISHLIST_REMOVED,
				}
			} else {
				throw {
					message: CONSTANTS.apiResponses.PROJECTTEMPLATES_NOTFOUND,
					status: HTTP_STATUS_CODE.bad_request.status,
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
* @api {post} /project/v1/wishlist/list?language=ka&page=1&limit=10
* @apiVersion 1.0.0
* @apiName list
* @apiGroup wishlist
* @apiHeader {String} X-user-token Authenticity token
* @apiUse successBody
* @apiUse errorBody
* @apiParamExample {json} Response:
* {
    "message": "Wishlist fetched successfully",
    "status": 200,
    "result": {
        "data": [
            {
                "_id": "66399a3443d18862ed097ff1",
                "externalId": "TSCSLHAR02-1710148664591",
                "categories": [
                    {
                        "_id": "66399a1204785762f7e8e4c1",
                        "externalId": "educationLeader",
                        "name": "Education Leader"
                    }
                ],
                "metaInformation": {
                    "duration": "1 month"
                },
                "createdAt": "2024-05-07T03:04:20.973Z",
                "title": "Tech Skill Club- Smart Learn",
                "description": "Encourage school leaders to learn about various digital initiatives and share ideas that would be implemented in their schools."
            },
            {
                "_id": "66399e6304785762f7e8e4cb",
                "externalId": "TSCSLHAR02-1710148664592",
                "categories": [
                    {
                        "_id": "66399dff04785762f7e8e4c7",
                        "externalId": "teacher",
                        "name": "Teacher"
                    }
                ],
                "metaInformation": {
                    "duration": "2 month"
                },
                "createdAt": "2024-05-07T03:22:11.368Z",
                "title": "Tech Skill Club- Smart",
                "description": "Encourage school leaders to learn about various digital initiatives and share ideas that would be implemented in their schools."
            },
            {
                "_id": "66584b4afa28840a616722bf",
                "externalId": "IDE-1717062474456",
                "categories": [
                    {
                        "_id": "66399a1204785762f7e8e4c1",
                        "externalId": "educationLeader",
                        "name": "Education Leader"
                    },
                    {
                        "_id": "66399a1204785762f7e8e4c1",
                        "externalId": "educationLeader",
                        "name": "Education Leader"
                    }
                ],
                "metaInformation": {
                    "duration": "2 months"
                },
                "createdAt": "2024-05-30T09:47:54.642Z",
                "title": "kannadaNaadu",
                "description": "testing multilingual"
            }
        ],
        "count": 3
    }
}
*/
	async list(req) {
		try {
			let userExtensionDocuments = await wishlistHelper.list(
				req.query.language ? req.query.language : '',
				req.userDetails ? req.userDetails.userInformation.userId : '',
				req.pageSize,
				req.pageNo
			)
			return {
				success: true,
				message: userExtensionDocuments.message,
				result: userExtensionDocuments.results,
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

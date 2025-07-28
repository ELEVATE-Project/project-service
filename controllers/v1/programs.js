/**
 * name : programs.js
 * author : vishnu
 * created-date : 09-Mar-2022
 * Description : programs related information.
 */

// Dependencies
const programsHelper = require(MODULES_BASE_PATH + '/programs/helper')
const programsQueries = require(DB_QUERY_BASE_PATH + '/programs')

module.exports = class Programs extends Abstract {
	constructor() {
		super('programs')
	}
	static get name() {
		return 'programs'
	}

	/**
    * Create program.
    * @api {post} /project/v1/programs/create
    * @apiVersion 1.0.0
    * @apiName 
    * @apiGroup Programs
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @method
    * @name create
    * @param {Object} req - requested data.
    * @apiParamExample {json} Request-Body:
    * {
        "externalId" : "PROGID01",
        "name" : "DCPCR School Development Index 2018-19",
        "description" : "DCPCR School Development Index 2018-19",
        "isDeleted" : false,
        "resourceType" : [ 
            "program"
        ],
        "language" : [ 
            "English"
        ],
        "keywords" : [],
        "concepts" : [],
        "userId":"a082787f-8f8f-42f2-a706-35457ca6f1fd",
        "imageCompression" : {
            "quality" : 10
        },
        "components" : [ 
            "5b98fa069f664f7e1ae7498c"
        ],
        "scope" : {
            "state" : ["e3a58f2b3c4d719a6821b590"],
            "roles" : [ "head_master","distrct_education_officer"]
        },
        "requestForPIIConsent" : true
        }

        * @apiParamExample {json} Response:
        {
        "message": "Program created successfully",
        "status": 200,
        "result": {
            "_id": "5ff09aa4a43c952a32279234"
        }
        }


    * @returns {JSON} - created program document.
   */

	async create(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let programCreationData = await programsHelper.create(
					req.body,
					req.userDetails.userInformation.userId,
					true, //this is true for when its called via API calls
					req.userDetails
				)

				return resolve(programCreationData)
			} catch (error) {
				reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
   * Update program.
   * @api {post} /project/v1/programs/update/:programId
   * @method
   * @name update
   * @param {Object} req - requested data.
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiParamExample {json} Request-Body:
   * {
      "externalId" : "PROGID01",
      "name" : "DCPCR School Development Index 2018-19",
      "description" : "DCPCR School Development Index 2018-19",
      "isDeleted" : false,
      "resourceType" : [ 
          "program"
      ],
      "language" : [ 
          "English"
      ],
      "keywords" : [],
      "concepts" : [],
      "userId":"a082787f-8f8f-42f2-a706-35457ca6f1fd",
      "imageCompression" : {
          "quality" : 10
      },
      "components" : [ 
          "5b98fa069f664f7e1ae7498c"
      ],
      "scope" : {
          "state" : ["e3a58f2b3c4d719a6821b590"],
          "roles" : [ "head_master","distrct_education_officer"]
      },
      "requestForPIIConsent" : true
    }

    * @apiParamExample {json} Response:
    {
        "message": "Program updated successfully",
        "status": 200,
        "result": {
            "_id": "5ff09aa4a43c952a32279234"
        }
    }


   * @param {Object} 
   * @returns {JSON} - 
   */

	async update(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let programUpdationData = await programsHelper.update(
					req.params._id,
					req.body,
					req.userDetails,
					true //this is true for when its called via API calls
				)

				return resolve(programUpdationData)
			} catch (error) {
				reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
    * @api {post} /project/v1/programs/details/:programId
    * @apiVersion 1.0.0
    * @apiName 
    * @apiGroup Programs
    * @apiParamExample {json} Request-Body:
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /project/v1/programs/details/66254d3dd07c5713b46d17c1
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Programs fetched successfully",
        "status": 200,
        "result": {
            "_id": "66254d3dd07c5713b46d17c1",
            "scope" : {
                "state" : ["e3a58f2b3c4d719a6821b590"],
                "roles" : [ "head_master","distrct_education_officer"]
            },
            "resourceType": [
                "program"
            ],
            "language": [
                "English",
                "Kannada",
                "telugu"
            ],
            "keywords": [],
            "concepts": [],
            "components": [
                "5b98fa069f664f7e1ae7498c"
            ],
            "isAPrivateProgram": false,
            "isDeleted": false,
            "requestForPIIConsent": true,
            "rootOrganisations": [],
            "createdFor": [],
            "deleted": false,
            "status": "active",
            "owner": "2",
            "createdBy": "2",
            "updatedBy": "2",
            "externalId": "PROGID01",
            "name": "DCPCR School Development Index 2018-19",
            "description": "DCPCR School Development Index 2018-19",
            "imageCompression": {
                "quality": 10
            },
            "updatedAt": "2024-04-23T19:45:34.196Z",
            "createdAt": "2024-04-21T17:30:37.519Z",
            "__v": 0
        }
    }
  */

	/**
	 * Details of the program
	 * @method
	 * @name details
	 * @param {Object} req - requested data.
	 * @param {String} req.params._id - program id.
	 * @returns {Array} Program scope roles.
	 */

	async details(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let programData = await programsHelper.details(
					req.params._id,
					CONSTANTS.common.ALL, //projections
					CONSTANTS.common.NONE, //skipFields
					req.userDetails
				)

				return resolve(programData)
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
    * @api {post} /project/v1/programs/read/:programId
    * @apiVersion 1.0.0
    * @apiName 
    * @apiGroup Programs
    * @apiParamExample {json} Request-Body:
    * @apiHeader {String} X-auth-token Authenticity token
    * @apiSampleRequest /project/v1/programs/read/66254d3dd07c5713b46d17c1
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Programs fetched successfully",
        "status": 200,
        "result": {
            "_id": "66254d3dd07c5713b46d17c1",
            "scope" : {
                "state" : ["e3a58f2b3c4d719a6821b590"],
                "roles" : [ "head_master","distrct_education_officer"]
            },
            "resourceType": [
                "program"
            ],
            "language": [
                "English",
                "Kannada",
                "telugu"
            ],
            "keywords": [],
            "concepts": [],
            "components": [
                "5b98fa069f664f7e1ae7498c"
            ],
            "isAPrivateProgram": false,
            "isDeleted": false,
            "requestForPIIConsent": true,
            "rootOrganisations": [],
            "createdFor": [],
            "deleted": false,
            "status": "active",
            "owner": "2",
            "createdBy": "2",
            "updatedBy": "2",
            "externalId": "PROGID01",
            "name": "DCPCR School Development Index 2018-19",
            "description": "DCPCR School Development Index 2018-19",
            "imageCompression": {
                "quality": 10
            },
            "updatedAt": "2024-04-23T19:45:34.196Z",
            "createdAt": "2024-04-21T17:30:37.519Z",
            "__v": 0
        }
    }
  */
	/**
	 * read for internalApi
	 * @method
	 * @name read
	 * @param {Object} req - requested data.
	 * @param {String} req.params._id - program id.
	 * @returns {Promise<Object>} The helper’s response, either program data or an error object.
	 */

	async read(req) {
		return new Promise(async (resolve, reject) => {
			try {
				// Extract tenantId from either userDetails or tenantData in the body
				let tenantId = req.userDetails?.tenantAndOrgInfo?.tenantId ?? req.body?.tenantData?.tenantId
				let programData = await programsHelper.read(
					req.params._id,
					CONSTANTS.common.ALL, //projections
					CONSTANTS.common.NONE, //skipFields
					tenantId
				)

				return resolve(programData)
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}
	/**
    * @api {post} /project/v1/programs/addRolesInScope/:programId Add roles in programs
    * @apiVersion 1.0.0
    * @apiName addRolesInScope
    * @apiGroup Programs
    * @apiParamExample {json} Request-Body:
    * {
    * "roles" : ["head_master","distrct_education_officer"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiHeader {String} internal-access-token
    * If you are a System Admin use below headers.
    * @apiHeader {String} admin-auth-token
    * @apiHeader {String} tenantId
    * @apiHeader {String} orgid
    * @apiSampleRequest /project/v1/programs/addRolesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully added roles in program scope",
        "status": 200
      }
    */

	/**
	 * Add roles in program scope
	 * @method
	 * @name addRolesInScope
	 * @param {Object} req - requested data.
	 * @param {String} req.params._id - program id.
	 * @param {Array} req.body.roles - Roles to be added.
	 * @param {Object} req.userDetails - User details
	 * @returns {Array} Program scope roles.
	 */

	// Role-based logic has been removed from the current implementation, so this API is currently not in use.
	//  It may be revisited in the future based on requirements.
	async addRolesInScope(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let programUpdated = await programsHelper.addRolesInScope(
					req.params._id,
					req.body.roles,
					req.userDetails
				)

				return resolve(programUpdated)
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
    * @api {post} /project/v1/programs/addEntitiesInScope/:programId Add entities in programs
    * @apiName addEntitiesInScope
    * @apiGroup Programs
    * @apiParamExample {json} Request-Body:
    * {
        "entities": {
            "district": [
                "682303044e2812081f3426fb"
            ],
            "professional_subroles": [
                "682301604e2812081f342674",
                "682303044e2812081f3426fb"
            ],
            "professional_role": [
                "681b07b49c57cdcf03c79ae3",
                "681b0800f21c88cef9517e0e"
            ],
            "school": [
                "67c82d9553812588916410d3"
            ],
            "language": [
                "681b0800f21c88cef951890e"
            ],
            "gender": [
                "67c82d955381258891642345"
            ]
        },
        "organizations": [
            "blr"
        ]
      } 
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiHeader {String} internal-access-token
    * If you are a System Admin use below headers.
    * @apiHeader {String} admin-auth-token
    * @apiHeader {String} tenantId
    * @apiHeader {String} orgid
    * @apiSampleRequest /project/v1/programs/addEntitiesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully added entities in program scope",
        "status": 200
      }
    */

	/**
	 * Add entities in program scope
	 * @method
	 * @name addEntitiesInScope
	 * @param {Object} req - requested data.
	 * @param {String} req.params._id - program id.
	 * @param {Object} req.body - data to be added.
	 * @param {Object} req.userDetails - User details
	 * @returns {Array} Program scope roles.
	 */

	async addEntitiesInScope(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let programUpdated = await programsHelper.addEntitiesInScope(req.params._id, req.body, req.userDetails)

				return resolve(programUpdated)
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
    * @api {post} /project/v1/programs/removeRolesInScope/:programId Remove roles in programs
    * @apiVersion 1.0.0
    * @apiName removeRolesInScope
    * @apiGroup Programs
    * @apiParamExample {json} Request-Body:
    * {
    * "roles" : ["head_master","distrct_education_officer"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiHeader {String} internal-access-token
    * If you are a System Admin use below headers.
    * @apiHeader {String} admin-auth-token
    * @apiHeader {String} tenantId
    * @apiHeader {String} orgid
    * @apiSampleRequest /project/v1/programs/removeRolesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully removed roles in program scope",
        "status": 200
      }
    */

	/**
	 * Remove roles in program scope
	 * @method
	 * @name removeRolesInScope
	 * @param {Object} req - requested data.
	 * @param {String} req.params._id - program id.
	 * @param {Array} req.body.roles - Roles to be added.
	 * @param {Object} req.userDetails - User details
	 * @returns {Array} Program scope roles.
	 */

	// Role-based logic has been removed from the current implementation, so this API is currently not in use.
	//  It may be revisited in the future based on requirements.
	async removeRolesInScope(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let programUpdated = await programsHelper.removeRolesInScope(
					req.params._id,
					req.body.roles,
					req.userDetails
				)

				return resolve(programUpdated)
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
    * @api {post} /project/v1/programs/removeEntitiesInScope/:programId remove entities from programs
    * @apiVersion 1.0.0
    * @apiName removeEntitiesInScope
    * @apiGroup Programs
    * @apiParamExample {json} Request-Body:
    * {
        "entities": {
            "professional_subroles": [
                "682301254e2812081f34266c",
                "682303044e2812081f3426fb",
                "682301604e2812081f342674"
            ],
            "professional_role": [
                "681b07b49c57cdcf03c79ae3",
                "681b0800f21c88cef9517e0e"
            ]
        },
        "organizations": [
            "ALL"
        ]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiHeader {String} internal-access-token
    * If you are a System Admin use below headers.
    * @apiHeader {String} admin-auth-token
    * @apiHeader {String} tenantId
    * @apiHeader {String} orgid
    * @apiSampleRequest /project/v1/programs/removeEntitiesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully removed entities in program scope",
        "status": 200
      }
    */

	/**
	 * Remove entities in program scope
	 * @method
	 * @name removeEntitiesInScope
	 * @param {Object} req - requested data.
	 * @param {String} req.params._id - program id.
	 * @param {Object} req.body - data to be removed.
	 * @param {Object} req.userDetails - User details
	 * @returns {Array} Program scope roles.
	 */

	async removeEntitiesInScope(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let programUpdated = await programsHelper.removeEntitiesInScope(
					req.params._id,
					req.body,
					req.userDetails
				)

				return resolve(programUpdated)
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
  * @api {get} /project/v1/programs/list?page=:page&limit=:limit&search=:search
  * @apiVersion 1.0.0
  * @apiName 
  * @apiGroup Programs
  * @apiParamExample {json} Request-Body:
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /project/v1/programs/list?page=1&limit=10&search=PROGRAM01
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  {
      "message": "Program lists fetched successfully",
      "status": 200,
      "result": {
          "data": [
              {
                  "_id": "5beaaaa6af0065f0e0a10605",
                  "externalId": "APPLE-ASSESSMENT-PROGRAM",
                  "description": "Apple Program 2018",
                  "isAPrivateProgram": false
              }
          ],
          "count": 1
      }
  }
  */

	/**
	 * List programs.
	 * @method
	 * @name list
	 * @param {Object} req - Requested data.
	 * @param {Array} req.query.page - Page number.
	 * @param {Array} req.query.limit - Page Limit.
	 * @param {Array} req.query.search - Search text.
	 * @returns {JSON} List programs data.
	 */

	async list(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let listOfPrograms = await programsHelper.list(
					req.pageNo,
					req.pageSize,
					req.searchText,
					req.userDetails,
					req.query.currentOrgOnly ? req.query.currentOrgOnly : false
				)

				return resolve(listOfPrograms)
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
    * @api {get} /project/v1/programs/join/:programId 
    * @apiVersion 1.0.0
    * @apiName Program Join
    * @apiGroup Programs
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiHeader {String} X-App-Ver Appversion
    * @apiSampleRequest /project/v1/programs/join/5ffbf8909259097d48017bbf
    * {
        "externalId" : "PROGID01",
        "name" : "DCPCR School Development Index 2018-19",
        "description" : "DCPCR School Development Index 2018-19",
        "isDeleted" : false,
        "resourceType" : [ 
            "program"
        ],
        "language" : [ 
            "English"
        ],
        "keywords" : [],
        "concepts" : [],
        "userId":"a082787f-8f8f-42f2-a706-35457ca6f1fd",
        "imageCompression" : {
            "quality" : 10
        },
        "components" : [ 
            "5b98fa069f664f7e1ae7498c"
        ],
        "scope": {
            "roles": [
                "head_master","distrct_education_officer"
            ],
            "state" : ["e3a58f2b3c4d719a6821b590"]
        },
        "requestForPIIConsent" : true
      }

    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    *{
      "message": "You have joined this program successfully",
      "status": 200,
      "result": {
        "_id" : "5ffbf8909259097d48017bbf"
      }
    }
    * 
    */

	/**
	 * join program
	 * @method
	 * @name join
	 * @param {Object} req - requested data.
	 * @param {String} req.params._id - program id.
	 * @returns {Object} Program join status.
	 */

	async join(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let programJoin = await programsHelper.join(
					req.params._id,
					req.body,
					req.userDetails.userInformation.userId,
					req.userDetails.userToken,
					req.headers['x-app-id'] ? req.headers['x-app-id'] : req.headers.appname ? req.headers.appname : '',
					req.headers['x-app-ver']
						? req.headers['x-app-ver']
						: req.headers.appversion
						? req.headers.appversion
						: '',
					req.headers['internal-access-token'] ? true : req.headers.internalAccessToken ? true : false
				)
				return resolve(programJoin)
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
	 * Controller method to remove a solution ID from all program documents where it exists.
	 * Delegates the actual logic to `programsHelper.pullSolutionId()`.
	 *
	 * @param {Object} req - Express request object containing `params._id` (solutionId).
	 * @returns {Promise<Object>} - Result of the operation from the helper function.
	 */
	async pullSolutionId(req) {
		return new Promise(async (resolve, reject) => {
			try {
				// Call helper method to perform the $pull operation on programs collection
				let programData = await programsHelper.pullSolutionId(req.params._id)
				return resolve(programData)
			} catch (error) {
				return reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}
}

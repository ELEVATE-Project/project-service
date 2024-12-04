/**
 * name         : users.js
 * author       : Vishnu
 * created-date : 04-Oct-2024
 * Description  : User related information.
 */
// Dependencies
const usersHelper = require(MODULES_BASE_PATH + '/users/helper')
module.exports = class Users {
	static get name() {
		return 'users'
	}

	/**
   * @api {post} /project/api/v1/users/solutions/:programId?page=:page&limit=:limit&search=:searchText
   * @apiVersion 1.0.0
   * @apiName User solutions
   * @apiGroup Users
   * @apiHeader {String} X-auth-token Authenticity token
   * @apiSampleRequest /project/api/v1/users/solutions/5ff438b04698083dbfab7284?page=1&limit=10
   * @apiParamExample {json} Request-Body:
   * {
        "state": "665d8df5c6892808846230e7",
        "district": "668240135fb8bc3e93ceae39",
        "block": "6682771aa845ef3e891db070",
        "cluster": "668242835fb8bc3e93ceae44",
        "role": "mentee,program_creator,block_education_officer,principle,district_education_officer"
    }
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response:
   * {
        "message": "Program solutions fetched successfully",
        "status": 200,
        "result": {
            "programName": "Certificate test VVP4",
            "programId": "66bb85bebf682a1f367c55b9",
            "programEndDate": "2025-12-16T18:29:59.000Z",
            "description": "The discipline studies the sound system of Sanskrit, including the rules governing the sounds and their combinations. It analyzes how sounds are produced and how they interact within the language.",
            "rootOrganisations": "",
            "data": [
                {
                    "_id": "66bf077ae74aa1727af8b1d4",
                    "language": [
                        "English"
                    ],
                    "name": "Certificate_Testing_VVP5",
                    "entityType": "state",
                    "type": "improvementProject",
                    "externalId": "sol-1-IM-5",
                    "endDate": "2025-12-16T18:29:59.000Z",
                    "projectTemplateId": "66bf07a1e74aa1727af8b1dc",
                    "certificateTemplateId": "66bf0822e74aa1727af8b1e7",
                    "link": "beb6e72ad73a097b9d7910e45a613431",
                    "projectId": "66bf5f3b1f4f6aa3de42d312"
                }
            ],
            "count": 2,
            "requestForPIIConsent": true
        }
    }
   **/

	/**
	 * User targeted solutions.
	 * @method
	 * @name solutions
	 * @param  {req}  - requested data.
	 * @returns {json} List of targeted solutions.
	 */

	solutions(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let targetedSolutions = await usersHelper.solutions(
					req.params._id,
					req.body,
					req.pageSize,
					req.pageNo,
					req.searchText,
					req.userDetails.userInformation.userId
				)

				return resolve(targetedSolutions)
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
      * @api {post} /project/v1/users/programs?isAPrivateProgram=true&page=:page&limit=:limit&search=:search 
      * Program List
      * @apiVersion 1.0.0
      * @apiGroup Users
      * @apiHeader {String} X-auth-token Authenticity token
      * @apiSampleRequest /project/v1/users/programs?isAPrivateProgram=false&page=:page&limit=:limit&search=:search 
      * @apiUse successBody
      * @apiUse errorBody
      * @apiParamExample {json} Request:
      *{
            "state": "665d8df5c6892808846230e7",
            "district": "668240135fb8bc3e93ceae39",
            "block": "6682771aa845ef3e891db070",
            "cluster": "668242835fb8bc3e93ceae44",
            "role": "head_master,district_education_officer"
        }
       * @apiParamExample {json} Response:
       * {
       * "message": "Users programs fetched successfully",
         "status": 200,
         "result": {
             "data": [
                 {
                     "_id": "5ff438b04698083dbfab7284",
                     "externalId": "TEST_SCOPE_PROGRAM",
                     "name": "TEST scope in program",
                     "metaInformation" : {
                        "state" : ["Karnataka"],
                        "recommendedFor" : ["District Education Officer", "Head Master"]
                     }
                 }
             ],
             "count": 1,
             "description": "View and participate in educational programs active in your location and designed for your role"
         }
     }
     */

	/**
	 * List of targeted user programs
	 * @method
	 * @name programs
	 * @param  {Request} req request body.
	 * @param {String} req.pageNo - pageNo
	 * @param {String} req.pageSize - pageSize
	 * @param {String} req.searchText - searchText
	 * @param {String} req.query.isAPrivateProgram - isAPrivateProgram
	 * @param {String} req.query.getProjectsCount - getProjectsCount under the program
	 * @returns {Object} list of targeted user programs.
	 */

	programs(req) {
		return new Promise(async (resolve, reject) => {
			try {
				let isAPrivateProgram = UTILS.convertStringToBoolean(req.query.isAPrivateProgram)
				req.query.getProjectsCount = UTILS.convertStringToBoolean(req.query.getProjectsCount)

				if (isAPrivateProgram) {
					let programsData = await usersHelper.privatePrograms(
						req.userDetails.userInformation.userId,
						req.query.language ? req.query.language : '',
						req.query.getProjectsCount ? req.query.getProjectsCount : false
					)
					return resolve(programsData)
				} else {
					let programs = await usersHelper.programs(
						req.body,
						req.pageNo,
						req.pageSize,
						req.searchText,
						req.userDetails.userInformation.userId
					)

					programs.result = programs.data
					return resolve(programs)
				}
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

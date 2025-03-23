/**
 * name : scp.js
 * author : Priyanka Pradeep
 * created-date : 24-Dec-2024
 * Description : SCP related information.
 */

// Dependencies

const scpHelper = require(MODULES_BASE_PATH + '/scp/helper')

/**
 * SCP
 * @class
 */

module.exports = class Scp {
	static get name() {
		return 'scp'
	}

	/**
	 * @description Publish the Template and Task from SCP.
	 * @method
	 * @name    publishTemplateAndTask
	 * @param {Object} req   Request data.
	 * @apiParamExample {json} Request:
	 * {
	 *   "data": {
	 *     "title": "my project through api",
	 *     "categories": [
	 *       { "label": "Teachers", "value": "teachers" },
	 *       { "label": "Community", "value": "community" },
	 *       { "label": "Infrastructure", "value": "infrastructure" },
	 *       { "label": "New Category", "value": "new_category" }
	 *     ],
	 *     "objective": "hello world",
	 *     "recommended_duration": {
	 *       "number": "4",
	 *       "duration": "weeks"
	 *     },
	 *     "keywords": "testprojects, hello",
	 *     "recommended_for": [
	 *       { "label": "Teachers", "value": "teachers" },
	 *       { "label": "Elementary School Head Master (Eshm)", "value": "elementary_school_head_master" },
	 *       { "label": "Education Leader", "value": "education_leader" },
	 *       { "label": "Head Master/Mistress (Hm)", "value": "head_master/mistress" }
	 *     ],
	 *     "tasks": [
	 *       {
	 *         "id": "cf345163-5425-4a2d-a498-b6242d4b5f91",
	 *         "type": "content",
	 *         "name": "task 1 description",
	 *         "is_mandatory": true,
	 *         "allow_evidences": true,
	 *         "evidence_details": {},
	 *         "sequence_no": 1,
	 *         "learning_resources": [
	 *           { "name": "task learning 1", "url": "https://example.com/path/to/resource#section?key=value" },
	 *           { "name": "task learning 2", "url": "https://example.com" }
	 *         ],
	 *         "children": [],
	 *         "solution_details": {}
	 *       }
	 *     ]
	 *   },
	 *   "callBackUrl": "http://localhost:6001/scp/v1/resource/publishCallback"
	 * }
	 * @returns {Object} Response data.
	 * @apiParamExample {json} Response:
	 * {
	 *   "message": "Template and Tasks Created Successfully",
	 *   "status": 200,
	 *   "result": [
	 *     {
	 *       "_id": "64b529375bfa678a0f257936"
	 *     }
	 *   ]
	 * }
	 */

	async publishTemplateAndTasks(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const response = await scpHelper.publishTemplateAndTasks(req.body.data, req.body.callBackUrl)

				return resolve(response)
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

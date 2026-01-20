/**
 * name : deletionAuditLogs.js.
 * author : Mallanagouda R Biradar
 * created-date : 25-July-2025
 * Description : deletionAuditLogs related information.
 */

module.exports = class deletionAuditLogs extends Abstract {
	/**
	 * @apiDefine errorBody
	 * @apiError {String} status 4XX,5XX
	 * @apiError {String} message Error
	 */

	/**
	 * @apiDefine successBody
	 *  @apiSuccess {String} status 200
	 * @apiSuccess {String} result Data
	 */

	constructor() {
		super('deletionAuditLogs')
	}

	static get name() {
		return 'deletionAuditLogs'
	}
}

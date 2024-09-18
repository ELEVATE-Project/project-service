/**
 * name : helper.js
 * author : prajwal
 * created-date : 10-Jun-2024
 * Description : Programs users related helper functionality.
 */

// Dependencies

/**
 * ProgramUsersHelper
 * @class
 */

const programUsersQueries = require(DB_QUERY_BASE_PATH + '/programUsers')

module.exports = class ProgramUsersHelper {
	/**
	 * check if user joined a program or not and consentShared
	 * @method
	 * @name checkForUserJoinedProgramAndConsentShared
	 * @param {String} programId - Program Id.
	 * @param {String} userId - User Id
	 * @returns {Object} result.
	 */

	static checkForUserJoinedProgramAndConsentShared(programId, userId) {
		return new Promise(async (resolve, reject) => {
			try {
				let result = {}
				const query = {
					userId: userId,
					programId: programId,
				}

				//Check data present in programUsers collection.
				let programUsers = await programUsersQueries.programUsersDocument(query, ['_id', 'consentShared'])
				result.joinProgram = programUsers.length > 0 ? true : false
				result.consentShared = programUsers.length > 0 ? programUsers[0].consentShared : false
				return resolve(result)
			} catch (error) {
				return reject(error)
			}
		})
	}
}

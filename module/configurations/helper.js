/**
 * name         : helper.js
 * author       : Vishnu
 * created-date : 12-Aug-2024
 * Description  : Configuration controller helper.
 */

// Dependencies
/**
 * ConfigurationsHelper
 * @class
 */
const configurationQueries = require(DB_QUERY_BASE_PATH + '/configurations')
module.exports = class ConfigurationsHelper {
	/**
	 * Read configuration.
	 * @method
	 * @name read
	 * @param {String} code - Configuration code.
	 * @returns {JSON}      - success/failure message.
	 */
	static read(code) {
		return new Promise(async (resolve, reject) => {
			try {
				// filter for fetching data
				const filter = {
					code: code,
				}

				const configurationDetails = await configurationQueries.findDocument(filter, ['code', 'meta'])

				// check if configuration is present or not
				if (!configurationDetails.length > 0) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.CONFIGURATION_NOT_AVAILABLE,
					})
				}
				return resolve({
					message: CONSTANTS.apiResponses.CONFIGURATION_FETCHED_SUCCESSFULLY,
					result: configurationDetails[0],
				})
			} catch (error) {
				return resolve({
					status: error.status ? error.status : HTTP_STATUS_CODE.internal_server_error.status,
					success: false,
					message: error.message,
					data: {},
				})
			}
		})
	}
}

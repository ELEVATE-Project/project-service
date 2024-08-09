/**
 * name : configurations.js
 * author : prajwal
 * created-date : 09-Aug-2024
 * Description : Configuration related apis.
 */

module.exports = class Configurations extends Abstract {
	constructor() {
		super('configurations')
	}

	static get name() {
		return 'configurations'
	}

	async read(req) {
		return new Promise(async (resolve, reject) => {
			try {
				// const metaKey = req.params.key
				const responseObj = {
					code: 'keysAllowedForTargeting',
					meta: {
						profileKeys: ['district', 'state', 'roles', 'school', 'block'],
					},
				}
				return resolve({
					message: CONSTANTS.apiResponses.CONFIGURATION_FETCHED_SUCCESSFULLY,
					result: responseObj,
				})
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

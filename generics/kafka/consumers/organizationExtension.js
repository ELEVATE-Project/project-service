// module dependencies
const adminHelper = require(MODULES_BASE_PATH + '/admin/helper')
const orgExtensionHelper = require(MODULES_BASE_PATH + '/organizationExtension/helper')

/**
 * consumer message received.
 * @function
 * @name messageReceived
 * @param {String} message - consumer data
 * @returns {Promise} return a Promise.
 */
const messageReceived = function (message) {
	return new Promise(async function (resolve, reject) {
		try {
			let parsedMessage = JSON.parse(message.value)
			if (
				Object.keys(parsedMessage).length > 0 &&
				parsedMessage.entity &&
				parsedMessage.entity === 'organization' &&
				parsedMessage.eventType
			) {
				parsedMessage = {
					body: { ...parsedMessage },
				}
				if (parsedMessage.body.eventType === CONSTANTS.common.CREATE_EVENT_TYPE) {
					await orgExtensionHelper.createOrgExtension(parsedMessage)
				}

				if (parsedMessage.body.eventType === CONSTANTS.common.UPDATE_EVENT_TYPE) {
					await adminHelper.updateRelatedOrgs(parsedMessage)
				}
			}
			return resolve('Message Received')
		} catch (error) {
			console.log(error)
			return reject(error)
		}
	})
}

/**
 * If message is not received.
 * @function
 * @name errorTriggered
 * @param {Object} error - error object
 * @returns {Promise} return a Promise.
 */

const errorTriggered = function (error) {
	return new Promise(function (resolve, reject) {
		try {
			return resolve(error)
		} catch (error) {
			return reject(error)
		}
	})
}

module.exports = {
	messageReceived: messageReceived,
	errorTriggered: errorTriggered,
}

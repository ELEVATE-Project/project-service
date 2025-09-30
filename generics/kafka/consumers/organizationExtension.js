// module dependencies
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
			// Parse the incoming Kafka message value from string to JSON
			let parsedMessage = JSON.parse(message.value)

			// Proceed only if parsedMessage is non-empty, has 'entity', and 'eventType'
			if (
				Object.keys(parsedMessage).length > 0 && // Check if object has keys
				parsedMessage.entity && // Ensure entity field exists
				parsedMessage.entity === 'organization' && // Entity must be 'organization'
				parsedMessage.eventType // Ensure eventType field exists
			) {
				// Wrap parsedMessage into an object with a 'body' property for downstream helpers
				parsedMessage = {
					body: { ...parsedMessage },
				}

				// If the event type is CREATE, call orgExtensionHelper to handle creation logic
				if (parsedMessage.body.eventType === CONSTANTS.common.CREATE_EVENT_TYPE) {
					await orgExtensionHelper.create(parsedMessage)
				}

				// If the event type is UPDATE, call adminHelper to handle update logic
				if (parsedMessage.body.eventType === CONSTANTS.common.UPDATE_EVENT_TYPE) {
					await orgExtensionHelper.updateRelatedOrgs(parsedMessage)
				}
			}

			// Successfully processed message
			return resolve('Message Received')
		} catch (error) {
			// Log and reject if any error occurs during processing
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

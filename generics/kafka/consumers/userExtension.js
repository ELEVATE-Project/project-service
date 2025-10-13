/**
 * name : userExtension.js
 * author : Vishnu
 * created-date : 13-Oct-2025
 * Description :  consumer for user extension related change events.
 */
// module dependencies
const userExtensionHelper = require(MODULES_BASE_PATH + '/userExtension/helper')

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
				parsedMessage.entity === 'user' && // Entity must be 'user'
				parsedMessage.eventType // Ensure eventType field exists
			) {
				const { eventType, oldValues = {}, newValues = {} } = parsedMessage
				// Handle only UPDATE events
				if (eventType === CONSTANTS.common.UPDATE_EVENT_TYPE) {
					let removedRoleTitles = []
					const oldOrganizations = oldValues.organizations || []
					const newOrganizations = newValues.organizations || []

					oldOrganizations.forEach((oldOrganization) => {
						const matchingNewOrganization = newOrganizations.find(
							(newOrganization) => newOrganization.id === oldOrganization.id
						)

						if (matchingNewOrganization) {
							const oldRoleTitles = (oldOrganization.roles || []).map((role) => role.title) || []
							const newRoleTitles = (matchingNewOrganization.roles || []).map((role) => role.title) || []

							// Identify roles that were removed
							removedRoleTitles = oldRoleTitles.filter(
								(oldRoleTitle) => !newRoleTitles.includes(oldRoleTitle)
							)
						}
					})

					if (removedRoleTitles.length > 0) {
						const userUpdateData = {
							userId: parsedMessage.entityId,
							removedRoles: removedRoleTitles,
							tenant_id: parsedMessage.oldValues.tenant_code,
							username: parsedMessage.oldValues.username,
						}
						await userExtensionHelper.removeRolesFromProgramMapping(userUpdateData)
					}
				}

				// Handle Delete events
				if (
					eventType === CONSTANTS.common.DELETE_EVENT_TYPE &&
					parsedMessage.tenant_code &&
					parsedMessage.tenant_code != ''
				) {
					await userExtensionHelper.delete(parsedMessage.entityId, parsedMessage.tenant_code)
				}
			}

			// Successfully processed message
			return resolve('Message Received')
		} catch (error) {
			// Log and reject if any error occurs during processing
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

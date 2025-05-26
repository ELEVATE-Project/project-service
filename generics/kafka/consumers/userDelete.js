/**
 * name : userDelete.js
 * author : Priyanka Pradeep
 * created-date : 26-May-2025
 * Description : user delete event consumer.
 */

//dependencies
const userProjectsHelper = require(MODULES_BASE_PATH + '/userProjects/helper')
/**
 * consumer message received.
 * @function
 * @name messageReceived
 * @param {Object} message - consumer data
 * {
    "entity": "user",
    "eventType": "delete",
    "entityId": 101,
    "changes": {},
    "created_by": 4,
    "organization_id": 22,
    "tenant_code": "shikshagraha",
    "status": "INACTIVE",
    "deleted": true,
    "id": 101,
    "username" : "user_shqwq1ssddw"
	}
 * @returns {Promise} return a Promise.
 */

var messageReceived = function (message) {
	return new Promise(async function (resolve, reject) {
		try {
			let parsedMessage = JSON.parse(message.value)
			if (
				parsedMessage.entity === CONSTANTS.common.DELETE_EVENT_ENTITY &&
				parsedMessage.eventType === CONSTANTS.common.DELETE_EVENT_TYPE
			) {
				let userDataDeleteStatus = await userProjectsHelper.deleteUserPIIData(parsedMessage)
				if (userDataDeleteStatus.status === 200) {
					return resolve('Message Processed.')
				} else {
					return resolve('Failed to Process message.')
				}
			}
		} catch (error) {
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

var errorTriggered = function (error) {
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

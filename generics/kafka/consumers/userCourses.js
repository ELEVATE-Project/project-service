/**
 * name : userCourses.js
 * author : PraveenDass
 * created-date : 22-Jul-2025
 * Description : User courses consumer.
 */
const userCoursesHelper = require(MODULES_BASE_PATH + '/userCourses/helper')

/**
 * user delete consumer message received.
 * @function
 * @name messageReceived
 * @param {Object} message - consumer data
 * {
 *   highWaterOffset:63
 *   key:null
 *   offset:62
 *   partition:0
 *   topic:'elevate-user-courses-dev'
 *   value:{
        type: "course",
        eventType: "update",
        status: "INPROGRESS", // Choose one: STARTED, COMPLETED, INPROGRESS
        entityId: "687deb262e2744735cac2df3", //solutionId
        userId: 5,
        organization_id: "SOT",
        tenantId: "shikshagraha"
      }
 * }
 * @returns {Promise} return a Promise.
 */
var messageReceived = function (message) {
	return new Promise(async function (resolve, reject) {
		try {
			let parsedMessage = JSON.parse(message.value)
			let userDataUpdateSatus = await userCoursesHelper.syncUserCourse(parsedMessage)
			if (userDataUpdateSatus.status === 200) {
				return resolve('Message Processed.')
			} else {
				return resolve('Message Processed.')
			}
		} catch (error) {
			return reject(error)
		}
	})
}

var errorTriggered = function (error) {
	return new Promise(function (resolve, reject) {
		try {
			return resolve('Error Processed')
		} catch (error) {
			return reject(error)
		}
	})
}

module.exports = {
	messageReceived: messageReceived,
	errorTriggered: errorTriggered,
}

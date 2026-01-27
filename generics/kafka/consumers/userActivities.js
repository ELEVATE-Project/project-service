/**
 * name : submissions.js
 * author : Aman Jung Karki
 * created-date : 22-Nov-2020
 * Description : Submission consumer.
 */

//dependencies

const programUsersService = require(SERVICES_BASE_PATH + '/programUsers')
const ObjectId = global.ObjectId || require('mongoose').Types.ObjectId

/**
 * submission consumer message received.
 * @function
 * @name messageReceived
 * @param {String} message - consumer data
 * @returns {Promise} return a Promise.
 */

var messageReceived = function (message) {
	return new Promise(async function (resolve, reject) {
		try {
			// let parsedMessage = JSON.parse(message.value)
			// let userId = parsedMessage.userId
			// let project = parsedMessage.projects
			// let createdBy = project.createdBy
			// let projectProgramId = project.programId
			// let programExternalId = project.programExternalId
			// let hierarchy = []
			// if (userId != createdBy) {
			// 	hierarchy.push({
			// 		level: 0,
			// 		id: createdBy,
			// 	})
			// }
			// //let programUsersRef = await programUsersService.findByUserAndProgram(userId, projectProgramId);
			// //if (!programUsersRef) {
			// let result = await programUsersService.createOrUpdate({
			// 	userId: userId,
			// 	hierarchy: hierarchy,
			// 	programId: projectProgramId,
			// 	programExternalId: project.programExternalId,
			// 	entities: [],
			// 	status: 'IN_PROGRESS',
			// 	metaInformation: {
			// 		idpAssignedAt: new Date(),
			// 		idpAssignedBy: createdBy,
			// 		idpProjectId: project._id,
			// 	},
			// 	createdBy: createdBy,
			// 	updatedBy: createdBy,
			// 	referenceFrom: new ObjectId(project.referenceFrom),
			// 	tenantId: project.tenantId,
			// 	orgId: project.orgId,
			// })

			// if (result.result._id) {
			// 	console.log('PARTICIPANT_PROGRAMUSERS_ASSIGNED', result.result._id)
			// 	if (project.referenceFrom) {
			// 		let result2 = await programUsersService.updateEntity(
			// 			createdBy,
			// 			project.referenceFrom,
			// 			'',
			// 			`${userId}`,
			// 			{
			// 				status: 'IN_PROGRESS',
			// 				participantProgramUserReference: result.result._id,
			// 			},
			// 			project.tenantId
			// 		)
			// 		if (result2._id) {
			// 			console.log('LC_PROGRAMUSERS_ENTITY_UPDATED', result2._id)
			// 		} else {
			// 			console.log('LC_PROGRAMUSERS_ENTITY_ASSIGNMENT_FAILED', result2)
			// 		}
			// 	}
			// } else {
			// 	console.log('PARTICIPANT_PROGRAMUSERS_ASSIGNMENT_FAILED', result.result)
			// }

			return resolve('Message Received')
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

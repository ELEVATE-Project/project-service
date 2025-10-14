/**
 * name : userExtension.js
 * author : Vishnu
 * created-date : 13-Oct-2025
 * Description :  consumer for user extension related event capture.
 */
// module dependencies
const userExtensionHelper = require(MODULES_BASE_PATH + '/userExtension/helper')

/**
 * Sample Kafka message which will be processed by this consumer
 * {
  "entity": "user",
  "eventType": "update",
  "entityId": 1634,
  "oldValues": {
    "id": 1634,
    "email": "2a6f1d34e5cba6c3b55c7f9d4f80a9d7dfc0d12af3b9045e9e4c14c229f9b87a1c3a9f8b3c2b7e8c1f8b3a7e4f2c9b8d1",
    "email_verified": false,
    "name": "Nevil Mathew",
    "username": "nevil.mathew_x4d8ph",
    "phone": null,
    "phone_code": null,
    "location": null,
    "about": null,
    "share_link": null,
    "status": "ACTIVE",
    "image": null,
    "has_accepted_terms_and_conditions": false,
    "languages": null,
    "preferred_language": "en",
    "custom_entity_text": null,
    "tenant_code": "default",
    "meta": null,
    "created_at": "2025-09-29T19:28:04.526Z",
    "updated_at": "2025-09-29T19:28:04.526Z",
    "deleted_at": null,
    "organizations": [
      {
        "id": 1,
        "name": "MentorEd",
        "code": "default_code",
        "description": "Organization for the default tenant",
        "status": "ACTIVE",
        "related_orgs": [],
        "tenant_code": "default",
        "meta": null,
        "created_by": null,
        "updated_by": 1,
        "roles": [
          {
            "id": 5,
            "title": "mentee",
            "label": "Mentee Role",
            "user_type": 0,
            "status": "ACTIVE",
            "organization_id": 1,
            "visibility": "PUBLIC",
            "tenant_code": "default",
            "translations": null
          },
          {
            "id": 7,
            "title": "org_admin",
            "label": "Organization Administrator",
            "user_type": 1,
            "status": "ACTIVE",
            "organization_id": 1,
            "visibility": "PUBLIC",
            "tenant_code": "default",
            "translations": null
          }
        ]
      }
    ]
  },
  "newValues": {
    "organizations": [
      {
        "id": 1,
        "name": "MentorEd",
        "code": "default_code",
        "description": "Organization for the default tenant",
        "status": "ACTIVE",
        "related_orgs": [],
        "tenant_code": "default",
        "meta": null,
        "created_by": null,
        "updated_by": 1,
        "roles": [
          {
            "id": 4,
            "title": "mentor",
            "label": "Mentor Role",
            "user_type": 0,
            "status": "ACTIVE",
            "organization_id": 1,
            "visibility": "PUBLIC",
            "tenant_code": "default",
            "translations": null
          },
          {
            "id": 5,
            "title": "mentee",
            "label": "Mentee Role",
            "user_type": 0,
            "status": "ACTIVE",
            "organization_id": 1,
            "visibility": "PUBLIC",
            "tenant_code": "default",
            "translations": null
          },
          {
            "id": 7,
            "title": "org_admin",
            "label": "Organization Administrator",
            "user_type": 1,
            "status": "ACTIVE",
            "organization_id": 1,
            "visibility": "PUBLIC",
            "tenant_code": "default",
            "translations": null
          }
        ]
      }
    ]
  },
  "created_at": "2025-09-29T19:28:04.526Z",
  "updated_at": "2025-09-29T19:28:04.526Z"
}


 */

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

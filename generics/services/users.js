/**
 * name : users.js
 * author : Vishnu
 * Date : 07-April-2022
 * Description : All users related api call.
 */

//dependencies
const request = require('request')
const interfaceServiceUrl = process.env.INTERFACE_SERVICE_URL

// Function to read the user profile based on the given userId
const profile = function (userId = '', userToken = '') {
	return new Promise(async (resolve, reject) => {
		try {
			// Construct the URL for the user service
			let url = interfaceServiceUrl + process.env.USER_SERVICE_BASE_URL + CONSTANTS.endpoints.USER_READ
			// Append the userId to the URL if it is provided
			if (userId !== '') {
				url = url + '/' + userId
			}

			// Set the options for the HTTP GET request
			const options = {
				headers: {
					'content-type': 'application/json',
					internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
				},
			}
			if (userToken !== '') {
				options.headers['x-auth-token'] = userToken
			}
			request.get(url, options, userReadCallback)
			let result = {
				success: true,
			}
			function userReadCallback(err, data) {
				if (err) {
					result.success = false
				} else {
					let response = JSON.parse(data.body)
					if (response.responseCode === HTTP_STATUS_CODE['ok'].code) {
						result['data'] = response.result
					} else {
						result.success = false
					}
				}
				return resolve(result)
			}
			setTimeout(function () {
				return resolve(
					(result = {
						success: false,
					})
				)
			}, CONSTANTS.common.SERVER_TIME_OUT)
		} catch (error) {
			return reject(error)
		}
	})
}

/**
 *
 * @function
 * @name locationSearch
 * @param {object} filterData -  location search filter object.
 * @param {Boolean} formatResult -  format result or not.
 * @returns {Promise} returns a promise.
 */

// const locationSearch = function ( filterData, formatResult = false ) {
//   return new Promise(async (resolve, reject) => {
//       try {

//         let bodyData={};
//         bodyData["request"] = {};
//         bodyData["request"]["filters"] = filterData;
//         const url =
//         userServiceUrl + CONSTANTS.endpoints.GET_LOCATION_DATA;
//         const options = {
//             headers : {
//                 "content-type": "application/json"
//             },
//             json : bodyData
//         };

//         request.post(url,options,requestCallback);

//         let result = {
//             success : true
//         };

//         function requestCallback(err, data) {
//             if (err) {
//                 result.success = false;
//             } else {
//                 let response = data.body;

//                 if( response.responseCode === CONSTANTS.common.OK &&
//                     response.result &&
//                     response.result.response &&
//                     response.result.response.length > 0
//                 ) {
//                     if ( formatResult ) {
//                         let entityResult =new Array;
//                         response.result.response.map(entityData => {
//                             let data = {};
//                             data._id = entityData.id;
//                             data.entityType = entityData.type;
//                             data.metaInformation = {};
//                             data.metaInformation.name = entityData.name;
//                             data.metaInformation.externalId = entityData.code
//                             data.registryDetails = {};
//                             data.registryDetails.locationId = entityData.id;
//                             data.registryDetails.code = entityData.code;
//                             entityResult.push(data);
//                         });
//                         result["data"] = entityResult;
//                         result["count"] = response.result.count;
//                     } else {
//                         result["data"] = response.result.response;
//                         result["count"] = response.result.count;
//                     }

//                 } else {
//                     result.success = false;
//                 }
//             }
//             return resolve(result);
//         }

//         setTimeout(function () {
//             return resolve (result = {
//                 success : false
//              });
//         }, CONSTANTS.common.SERVER_TIME_OUT);

//       } catch (error) {
//           return reject(error);
//       }
//   })
// }
/**
 * get Parent Entities of an entity.
 * @method
 * @name getParentEntities
 * @param {String} entityId - entity id
 * @returns {Array} - parent entities.
 */

// async function getParentEntities( entityId, iteration = 0, parentEntities ) {

//     if ( iteration == 0 ) {
//         parentEntities = [];
//     }

//     let filterQuery = {
//         "id" : entityId
//     };

//     let entityDetails = await locationSearch(filterQuery);
//     if ( !entityDetails.success ) {
//         return parentEntities;
//     } else {

//         let entityData = entityDetails.data[0];
//         if ( iteration > 0 ) parentEntities.push(entityData);
//         if ( entityData.parentId ) {
//             iteration = iteration + 1;
//             entityId = entityData.parentId;
//             await getParentEntities(entityId, iteration, parentEntities);
//         }
//     }

//     return parentEntities;

// }

/**
 * get user profileData without token.
 * @method
 * @name profileReadPrivate
 * @param {String} userId - user Id
 * @returns {JSON} - User profile details
 */
// const profileReadPrivate = function (userId) {
// 	return new Promise(async (resolve, reject) => {
// 		try {
// 			//  <--- Important : This url endpoint is private do not use it for regular workflows --->
// 			let url = userServiceUrl + CONSTANTS.endpoints.USER_READ_PRIVATE + '/' + userId
// 			const options = {
// 				headers: {
// 					'content-type': 'application/json',
// 				},
// 			}
// 			request.get(url, options, userReadCallback)
// 			let result = {
// 				success: true,
// 			}
// 			function userReadCallback(err, data) {
// 				if (err) {
// 					result.success = false
// 				} else {
// 					let response = JSON.parse(data.body)
// 					if (response.responseCode === HTTP_STATUS_CODE['ok'].code) {
// 						result['data'] = response.result
// 					} else {
// 						result.success = false
// 					}
// 				}
// 				return resolve(result)
// 			}
// 			setTimeout(function () {
// 				return resolve(
// 					(result = {
// 						success: false,
// 					})
// 				)
// 			}, CONSTANTS.common.SERVER_TIME_OUT)
// 		} catch (error) {
// 			return reject(error)
// 		}
// 	})
// }

/**
 * get subEntities of matching type by recursion.
 * @method
 * @name getSubEntitiesBasedOnEntityType
 * @param parentIds {Array} - Array of entity Ids- for which we are finding sub entities of given entityType
 * @param entityType {string} - EntityType.
 * @returns {Array} - Sub entities matching the type .
 */

// async function getSubEntitiesBasedOnEntityType( parentIds, entityType, result ) {

//     if( !parentIds.length > 0 ){
//         return result;
//     }
//     let bodyData={
//         "parentId" : parentIds
//     };

//     let entityDetails = await locationSearch(bodyData);
//     if( !entityDetails.success ) {
//         return (result);
//     }

//     let entityData = entityDetails.data;
//     let parentEntities = [];
//     entityData.map(entity => {
//     if( entity.type == entityType ) {
//         result.push(entity.id)
//     } else {
//         parentEntities.push(entity.id)
//     }
//     });

//     if( parentEntities.length > 0 ){
//         await getSubEntitiesBasedOnEntityType(parentEntities,entityType,result)
//     }

//     let uniqueEntities = _.uniq(result);
//     return uniqueEntities;
// }

/**
 * get user roles data token.
 * @method
 * @name getUserRoles
 * @param {Object} roles - {"roles":"all"}
 * @returns {Array} - All user roles
 */
// const getUserRoles = function (filterData = 'all', projection = 'all', skipFields = 'none') {
// 	return new Promise(async (resolve, reject) => {
// 		try {
// 			let url = userServiceUrl + CONSTANTS.endpoints.LIST_USER_ROLES
// 			const options = {
// 				headers: {
// 					'content-type': 'application/json',
// 					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
// 				},
// 				json: {
// 					query: filterData,
// 					projection: projection,
// 					skipFields: skipFields,
// 				},
// 			}
// 			request.get(url, options, requestCallback)
// 			let result = {
// 				success: true,
// 			}
// 			function requestCallback(err, data) {
// 				if (err) {
// 					result.success = false
// 				} else {
// 					let response = JSON.parse(data.body)
// 					if (response.responseCode === HTTP_STATUS_CODE.ok.code) {
// 						result['data'] = response.result
// 					} else {
// 						result.success = false
// 					}
// 				}
// 				return resolve(result)
// 			}
// 			setTimeout(function () {
// 				return resolve(
// 					(result = {
// 						success: false,
// 					})
// 				)
// 			}, CONSTANTS.common.SERVER_TIME_OUT)
// 		} catch (error) {
// 			return reject(error)
// 		}
// 	})
// }

/**
 * Fetches the default organization details for a given organization code/id.
 * @param {string} organisationIdentifier - The code/id of the organization.
 * @param {String} userToken - user token
 * @returns {Promise} A promise that resolves with the organization details or rejects with an error.
 */

const fetchDefaultOrgDetails = function (organisationIdentifier, userToken) {
	return new Promise(async (resolve, reject) => {
		try {
			let url
			if (!isNaN(organisationIdentifier)) {
				url =
					interfaceServiceUrl +
					process.env.USER_SERVICE_BASE_URL +
					CONSTANTS.endpoints.ORGANIZATION_READ +
					'?organisation_id=' +
					organisationIdentifier
			} else {
				url =
					interfaceServiceUrl +
					process.env.USER_SERVICE_BASE_URL +
					CONSTANTS.endpoints.ORGANIZATION_READ +
					'?organisation_code=' +
					organisationIdentifier
			}
			const options = {
				headers: {
					internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
				},
			}
			request.get(url, options, userReadCallback)
			let result = {
				success: true,
			}
			function userReadCallback(err, data) {
				if (err) {
					result.success = false
				} else {
					let response = JSON.parse(data.body)
					if (response.responseCode === HTTP_STATUS_CODE['ok'].code) {
						result['data'] = response.result
					} else {
						result.success = false
					}
				}

				return resolve(result)
			}
			setTimeout(function () {
				return resolve(
					(result = {
						success: false,
					})
				)
			}, CONSTANTS.common.SERVER_TIME_OUT)
		} catch (error) {
			return reject(error)
		}
	})
}

module.exports = {
	profile: profile,
	// locationSearch : locationSearch,
	// getParentEntities : getParentEntities,
	// profileReadPrivate: profileReadPrivate,
	// getSubEntitiesBasedOnEntityType : getSubEntitiesBasedOnEntityType,
	// getUserRoles: getUserRoles,
	fetchDefaultOrgDetails: fetchDefaultOrgDetails,
}

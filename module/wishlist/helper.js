const userExtensionQueries = require(DB_QUERY_BASE_PATH + '/userExtension')
const projectTemplateQueries = require(DB_QUERY_BASE_PATH + '/projectTemplates')

module.exports = class UserExtensioHelper {
	/**
	 * add wishlist
	 * @method
	 * @name add
	 * @param {projectTempleteId} - projectTempleteId
	 * @param {userId} -            userId
	 * @returns {Object} .
	 */
	static async add(projectTempleteId, userId) {
		try {
			let wishlistItem = {
				_id: projectTempleteId,
				createdAt: new Date(),
			}

			// Find the userExtension document for the given userId
			let userExtensionDocument = await userExtensionQueries.userExtensionDocument({ userId })

			let updateuserExtensionDocument
			if (userExtensionDocument && userExtensionDocument.length > 0) {
				// If the document exists, update the wishlist by appending the new item
				updateuserExtensionDocument = await userExtensionQueries.findAndUpdate(
					{ userId },
					{ $addToSet: { wishlist: wishlistItem } }
				)
			} else {
				// If no document exists, create a new one
				const newUserExtension = {
					userId,
					wishlist: [wishlistItem],
				}
				updateuserExtensionDocument = await userExtensionQueries.createUserExtension(newUserExtension)
			}
			if (updateuserExtensionDocument) {
				return {
					success: true,
					message: CONSTANTS.apiResponses.WISHLIST_ADDED,
				}
			} else {
				throw {
					message: CONSTANTS.apiResponses.WISHLIST_NOT_ADDED,
					status: HTTP_STATUS_CODE.bad_request.status,
				}
			}
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	/**
	 * remove wishlist
	 * @method
	 * @name remove
	 * @param {projectTempleteId} - pprojectTempleteId
	 * @param {userId} -            userId
	 * @returns {Object} .
	 */
	static async remove(projectTempleteId, userId) {
		try {
			// Find the userExtension document for the given userId
			let userExtensionDocument = await userExtensionQueries.userExtensionDocument({ userId })

			if (userExtensionDocument) {
				// If the document exists, update the wishlist by removing the specified item
				let updatedDocument = await userExtensionQueries.findAndUpdate(
					{ userId, wishlist: { $elemMatch: { _id: projectTempleteId } } },
					{ $pull: { wishlist: { _id: projectTempleteId } } },
					{ new: true }
				)
				if (updatedDocument) {
					return {
						success: true,
						message: CONSTANTS.apiResponses.WISHLIST_REMOVED,
					}
				} else {
					throw {
						message: CONSTANTS.apiResponses.PROJECTTEMPLATES_NOTFOUND,
						status: HTTP_STATUS_CODE.bad_request.status,
					}
				}
			} else {
				throw {
					message: CONSTANTS.apiResponses.USEREXTENSION_NOTFOUND,
					status: HTTP_STATUS_CODE.bad_request.status,
				}
			}
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}

	/**
	 * list wishlist
	 * @method
	 * @name list
	 * @param {String} language  -languageCode
	 * @param {String}  userId   -userId
	 * @param {Number} pageSize  -pageSize
	 * @param {Number} pageNo    -pageNo
	 * @returns {Object}          list of wishlist
	 */

	static async list(language, userId, pageSize = 100, pageNo = 1) {
		try {
			//Find user's wishlist projectTempleteIds
			let userExtensionDocument = await userExtensionQueries.userExtensionDocument({ userId })

			if (userExtensionDocument) {
				//Get the projectTempleteIds
				let projectTemplateIDs = userExtensionDocument[0].wishlist.map((item) => new ObjectId(item._id))
				let aggregateData = []
				//Match Query
				let matchQuery = {
					$match: {
						_id: { $in: projectTemplateIDs },
					},
				}
				aggregateData.push(matchQuery)

				// projection aggregate for multilingual
				let titleField = language ? `$translation.${language}.title` : '$title'
				let descriptionField = language ? `$translation.${language}.description` : '$description'

				aggregateData.push(
					{
						$project: {
							_id: 1,
							title: { $ifNull: [titleField, '$title'] },
							description: { $ifNull: [descriptionField, '$description'] },
							externalId: 1,
							createdAt: 1,
							categories: 1,
							'metaInformation.duration': 1,
						},
					},
					{
						//Pagination
						$facet: {
							totalCount: [{ $count: 'count' }],
							data: [{ $skip: pageSize * (pageNo - 1) }, { $limit: pageSize }],
						},
					},
					{
						//Count  and project the response data
						$project: {
							data: 1,
							count: {
								$arrayElemAt: ['$totalCount.count', 0],
							},
						},
					}
				)

				let projectTempleteDocumetation = await projectTemplateQueries.getAggregate(aggregateData)
				return {
					success: true,
					results: projectTempleteDocumetation,
				}
			} else {
				throw {
					message: CONSTANTS.apiResponses.USEREXTENSION_NOTFOUND,
					status: HTTP_STATUS_CODE.bad_request.status,
				}
			}
		} catch (error) {
			return {
				status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
				message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
				errorObject: error,
			}
		}
	}
}

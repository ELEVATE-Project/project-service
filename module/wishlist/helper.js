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
				// Check if the wishlist item already exists
				const wishlistExists = userExtensionDocument[0].wishlist.some(
					(item) => item._id.toString() === projectTempleteId.toString()
				)

				if (wishlistExists) {
					return {
						success: false,
						message: CONSTANTS.apiResponses.WISHLIST_ALREADY_ADDED,
					}
				}
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

			if (!userExtensionDocument || userExtensionDocument.length === 0) {
				throw {
					message: CONSTANTS.apiResponses.USER_EXTENSION_NOT_FOUND,
				}
			}

			// Check if the projectTemplateId exists in the wishlist
			const wishlistExists = userExtensionDocument[0].wishlist.some(
				(item) => item._id.toString() === projectTempleteId.toString()
			)

			if (!wishlistExists) {
				// If the item is not in the wishlist, return a specific message
				throw {
					message: CONSTANTS.apiResponses.PROJECT_TEMPLATE_NOT_IN_WISHLIST,
					status: HTTP_STATUS_CODE.bad_request.status,
				}
			}

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
					message: CONSTANTS.apiResponses.PROJECT_TEMPLATE_NOT_FOUND,
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

	static async list(language, userId, pageSize, pageNo) {
		try {
			// Find user's wishlist projectTemplateIds
			let userExtensionDocument = await userExtensionQueries.userExtensionDocument({ userId })

			// If no user extension document is found or if it's empty
			if (!userExtensionDocument || userExtensionDocument.length === 0) {
				return {
					success: true,
					message: CONSTANTS.apiResponses.USER_EXTENSION_NOT_FOUND,
					results: {
						data: [],
						count: 0,
					},
				}
			}

			// Get the projectTemplateIds
			let projectTemplateIDs = userExtensionDocument[0].wishlist.map((item) => new ObjectId(item._id))

			// If projectTemplateIDs is empty
			if (!projectTemplateIDs.length) {
				return {
					success: true,
					message: CONSTANTS.apiResponses.PROJECT_TEMPLATE_ID_NOT_FOUND,
					results: {
						data: [],
						count: 0,
					},
				}
			}

			let aggregateData = []
			// Match Query
			let matchQuery = {
				$match: {
					_id: { $in: projectTemplateIDs },
				},
			}
			aggregateData.push(matchQuery)

			// Projection aggregate for multilingual
			let titleField = language ? `$translations.${language}.title` : '$title'
			let descriptionField = language ? `$translations.${language}.description` : '$description'

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
					// Pagination
					$facet: {
						totalCount: [{ $count: 'count' }],
						data: [{ $skip: pageSize * (pageNo - 1) }, { $limit: pageSize }],
					},
				},
				{
					// Count and project the response data
					$project: {
						data: 1,
						count: {
							$ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0],
						},
					},
				}
			)

			let projectTemplateDocuments = await projectTemplateQueries.getAggregate(aggregateData)

			// Return success response with data and count or "Not found" message if no data is returned
			if (!projectTemplateDocuments[0] || projectTemplateDocuments[0].data.length === 0) {
				return {
					success: true,
					message: CONSTANTS.apiResponses.PROJECT_TEMPLATE_NOT_FOUND,
					results: {
						data: [],
						count: 0,
					},
				}
			}

			return {
				success: true,
				message: CONSTANTS.apiResponses.WISHLIST_FETCHED,
				results: projectTemplateDocuments[0],
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
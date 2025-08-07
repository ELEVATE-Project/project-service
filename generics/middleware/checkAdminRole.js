/**
 * name : checkAdminRole.js
 * author : Mallanagouda R Biradar
 * Date : 7-Aug-2025
 * Description : checkAdminRole middleware.
 */

const jwt = require('jsonwebtoken')

module.exports = async function (req, res, next) {
	// Define paths that require admin role validation
	let adminPath = ['admin/deleteResource']
	// Initialize response object for error formatting
	let rspObj = {}
	// Flag to check if the current request path needs admin validation
	let checkAdminRole = false

	// Check if the incoming request path matches any admin paths
	await Promise.all(
		adminPath.map(async function (path) {
			if (req.path.includes(path)) {
				checkAdminRole = true
			}
		})
	)

	// If path needs admin check, validate the user's role using JWT token
	if (checkAdminRole) {
		// Get token from request headers
		token = req.headers['x-auth-token']
		// If no token found, return unauthorized error
		if (!token) {
			rspObj.errCode = CONSTANTS.apiResponses.TOKEN_MISSING_CODE
			rspObj.errMsg = CONSTANTS.apiResponses.TOKEN_MISSING_MESSAGE
			rspObj.responseCode = HTTP_STATUS_CODE['unauthorized'].status
			return res.status(HTTP_STATUS_CODE['unauthorized'].status).send(respUtil(rspObj))
		}

		let decodedToken
		try {
			// Decode and verify JWT token using secret key
			decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
			// If token is invalid or expired, return unauthorized
		} catch (error) {
			return res.status(HTTP_STATUS_CODE.unauthorized.status).send(
				respUtil({
					errCode: CONSTANTS.apiResponses.TOKEN_MISSING_CODE,
					errMsg: CONSTANTS.apiResponses.TOKEN_MISSING_MESSAGE,
					responseCode: HTTP_STATUS_CODE['unauthorized'].status,
				})
			)
		}

		// Extract roles from decoded token payload
		let fetchRoleFromToken = decodedToken.data.organizations[0].roles

		// Convert roles array to list of role titles
		let roles = fetchRoleFromToken.map((roles) => {
			return roles.title
		})

		// Check if user has the admin role
		if (roles.includes(CONSTANTS.common.ADMIN_ROLE)) {
			// If admin, allow the request to continue
			return next()
		} else {
			// If not admin, throw forbidden error
			throw {
				status: HTTP_STATUS_CODE.forbidden.status,
				message: CONSTANTS.apiResponses.ADMIN_TOKEN_MISSING_MESSAGE,
			}
		}
	}

	next()
	return
}

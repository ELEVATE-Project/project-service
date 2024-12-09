/**
 * name : authenticator.js
 * author : vishnu
 * Date : 05-Aug-2020
 * Description : Authentication middleware.
 */

// dependencies
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

var respUtil = function (resp) {
	return {
		status: resp.errCode,
		message: resp.errMsg,
		currentDate: new Date().toISOString(),
	}
}

var removedHeaders = [
	'host',
	'origin',
	'accept',
	'referer',
	'content-length',
	'accept-encoding',
	'accept-language',
	'accept-charset',
	'cookie',
	'dnt',
	'postman-token',
	'cache-control',
	'connection',
]

module.exports = async function (req, res, next, token = '') {
	removedHeaders.forEach(function (e) {
		delete req.headers[e]
	})

	var token = req.headers['x-auth-token']
	if (!req.rspObj) req.rspObj = {}
	var rspObj = req.rspObj

	// Allow search endpoints for non-logged in users.
	let guestAccess = false
	let guestAccessPaths = [
		'/dataPipeline/',
		'/templates/details',
		'userProjects/certificateCallback',
		'userProjects/certificateCallbackError',
		'cloud-services/files/download',
	]
	await Promise.all(
		guestAccessPaths.map(async function (path) {
			if (req.path.includes(path)) {
				guestAccess = true
			}
		})
	)

	if (guestAccess == true && !token) {
		next()
		return
	}

	let internalAccessApiPaths = ['/templates/bulkCreate', '/projectAttributes/update']
	let performInternalAccessTokenCheck = false
	await Promise.all(
		internalAccessApiPaths.map(async function (path) {
			if (req.path.includes(path)) {
				performInternalAccessTokenCheck = true
			}
		})
	)

	if (performInternalAccessTokenCheck) {
		if (req.headers['internal-access-token'] !== process.env.INTERNAL_ACCESS_TOKEN) {
			rspObj.errCode = CONSTANTS.apiResponses.TOKEN_MISSING_CODE
			rspObj.errMsg = CONSTANTS.apiResponses.TOKEN_MISSING_MESSAGE
			rspObj.responseCode = HTTP_STATUS_CODE['unauthorized'].status
			return res.status(HTTP_STATUS_CODE['unauthorized'].status).send(respUtil(rspObj))
		}
		if (!token) {
			next()
			return
		}
	}

	if (!token) {
		rspObj.errCode = CONSTANTS.apiResponses.TOKEN_MISSING_CODE
		rspObj.errMsg = CONSTANTS.apiResponses.TOKEN_MISSING_MESSAGE
		rspObj.responseCode = HTTP_STATUS_CODE['unauthorized'].status
		return res.status(HTTP_STATUS_CODE['unauthorized'].status).send(respUtil(rspObj))
	}

	rspObj.errCode = CONSTANTS.apiResponses.TOKEN_INVALID_CODE
	rspObj.errMsg = CONSTANTS.apiResponses.TOKEN_INVALID_MESSAGE
	rspObj.responseCode = HTTP_STATUS_CODE['unauthorized'].status

	// <---- For Elevate user service user compactibility ---->
	try {
		decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
	} catch (err) {
		return res.status(HTTP_STATUS_CODE['unauthorized'].status).send(respUtil(rspObj))
	}
	if (!decodedToken) {
		return res.status(HTTP_STATUS_CODE['unauthorized'].status).send(respUtil(rspObj))
	}

	// Path to config.json
	const configFilePath = path.resolve(__dirname, '../../', 'config.json')

	// Initialize variables
	let configData = {}
	let defaultTokenExtraction = false

	// Check if config.json exists
	if (fs.existsSync(configFilePath)) {
		// Read and parse the config.json file
		const rawData = fs.readFileSync(configFilePath)
		try {
			configData = JSON.parse(rawData)
			if (!configData.authTokenUserInformation) {
				defaultTokenExtraction = true
			}
			configData = configData.authTokenUserInformation
		} catch (error) {
			console.error('Error parsing config.json:', error)
		}
	} else {
		// If file doesn't exist, set defaultTokenExtraction to false
		defaultTokenExtraction = true
	}

	let userInformation = {}
	// Create user details to request
	req.userDetails = {
		userToken: token,
	}

	// performing default token data extraction
	if (defaultTokenExtraction) {
		userInformation = {
			userId: decodedToken.data.id.toString(),
			userName: decodedToken.data.name,
			organizationId: decodedToken.data.organization_id,
			firstName: decodedToken.data.name,
		}
	} else {
		// Iterate through each key in the config object
		for (let key in configData) {
			if (configData.hasOwnProperty(key)) {
				let keyValue = getNestedValue(decodedToken, configData[key])
				if (key === 'userId') {
					keyValue = keyValue.toString()
				}
				// For each key in config, assign the corresponding value from decodedToken
				userInformation[key] = keyValue
			}
		}
	}
	// Update user details object
	req.userDetails.userInformation = userInformation

	// Helper function to access nested properties
	function getNestedValue(obj, path) {
		return path.split('.').reduce((acc, part) => acc && acc[part], obj)
	}

	next()
}

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
const isBearerRequired = process.env.IS_AUTH_TOKEN_BEARER === 'true'

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

	if (!req.rspObj) req.rspObj = {}
	var rspObj = req.rspObj

	token = req.headers['x-auth-token']

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

	// Check if a Bearer token is required for authentication
	if (isBearerRequired) {
		const [authType, extractedToken] = token.split(' ')
		if (authType.toLowerCase() !== 'bearer') {
			rspObj.errCode = CONSTANTS.apiResponses.TOKEN_INVALID_CODE
			rspObj.errMsg = CONSTANTS.apiResponses.TOKEN_INVALID_MESSAGE
			rspObj.responseCode = HTTP_STATUS_CODE['unauthorized'].status
			return res.status(HTTP_STATUS_CODE['unauthorized'].status).send(respUtil(rspObj))
		}
		token = extractedToken?.trim()
	} else {
		token = token?.trim()
	}

	rspObj.errCode = CONSTANTS.apiResponses.TOKEN_INVALID_CODE
	rspObj.errMsg = CONSTANTS.apiResponses.TOKEN_INVALID_MESSAGE
	rspObj.responseCode = HTTP_STATUS_CODE['unauthorized'].status

	// <---- For Elevate user service user compactibility ---->
	let decodedToken = null
	try {
		if (process.env.AUTH_METHOD === CONSTANTS.common.AUTH_METHOD.NATIVE) {
			try {
				// If using native authentication, verify the JWT using the secret key
				decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
			} catch (err) {
				// If verification fails, send an unauthorized response
				return res.status(HTTP_STATUS_CODE['unauthorized'].status).send(respUtil(rspObj))
			}
		} else if (process.env.AUTH_METHOD === CONSTANTS.common.AUTH_METHOD.KEYCLOAK_PUBLIC_KEY) {
			// If using Keycloak with a public key for authentication
			const keycloakPublicKeyPath = `${process.env.KEYCLOAK_PUBLIC_KEY_PATH}/`
			const PEM_FILE_BEGIN_STRING = '-----BEGIN PUBLIC KEY-----'
			const PEM_FILE_END_STRING = '-----END PUBLIC KEY-----'

			// Decode the JWT to extract its claims without verifying
			const tokenClaims = jwt.decode(token, { complete: true })

			if (!tokenClaims || !tokenClaims.header) {
				// If the token does not contain valid claims or header, send an unauthorized response
				return res.status(HTTP_STATUS_CODE['unauthorized'].status).send(respUtil(rspObj))
			}

			// Extract the key ID (kid) from the token header
			const kid = tokenClaims.header.kid

			// Construct the path to the public key file using the key ID
			let filePath = path.resolve(__dirname, keycloakPublicKeyPath, kid.replace(/\.\.\//g, ''))

			// Read the public key file from the resolved file path
			const accessKeyFile = await fs.promises.readFile(filePath, 'utf8')

			// Ensure the public key is properly formatted with BEGIN and END markers
			const cert = accessKeyFile.includes(PEM_FILE_BEGIN_STRING)
				? accessKeyFile
				: `${PEM_FILE_BEGIN_STRING}\n${accessKeyFile}\n${PEM_FILE_END_STRING}`
			let verifiedClaims
			try {
				// Verify the JWT using the public key and specified algorithms
				verifiedClaims = jwt.verify(token, cert, { algorithms: ['sha1', 'RS256', 'HS256'] })
			} catch (err) {
				// If the token is expired or any other error occurs during verification
				if (err.name === 'TokenExpiredError') {
					console.error(err)
					return res.status(HTTP_STATUS_CODE['unauthorized'].status).send(respUtil(rspObj))
				}
			}

			// Extract the external user ID from the verified claims
			const externalUserId = verifiedClaims.sub.split(':').pop()

			const data = {
				id: externalUserId,
				// roles: roles,
				name: verifiedClaims.name,
				organization_id: verifiedClaims.org || null,
			}

			// Ensure decodedToken is initialized as an object
			decodedToken = decodedToken || {}
			decodedToken['data'] = data
		}
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

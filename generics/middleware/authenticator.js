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
const userService = require('../services/users')

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

	let internalAccessApiPaths = [
		'/templates/bulkCreate',
		'/projectAttributes/update',
		'/scp/publishTemplateAndTasks',
		'/library/categories/create',
		'/library/categories/update',
		'/programs/create',
		'/programs/update',
		'/admin/createIndex',
		'/solutions/create',
		'/solutions/update',
		'/forms/create',
		'/forms/update',
		'/templateTasks/bulkCreate',
		'/certificateBaseTemplates/createOrUpdate',
		'/certificateTemplates/createOrUpdate',
		'certificateTemplates/uploadTemplate',
		'/certificateTemplates/createSvg',
	]
	let performInternalAccessTokenCheck = false
	let adminHeader = false
	if (process.env.ADMIN_ACCESS_TOKEN) {
		adminHeader = req.headers[process.env.ADMIN_TOKEN_HEADER_NAME]
	}

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
	let userInformation = {}
	try {
		if (process.env.AUTH_METHOD === CONSTANTS.common.AUTH_METHOD.NATIVE) {
			try {
				// If using native authentication, verify the JWT using the secret key
				decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
			} catch (err) {
				// If verification fails, send an unauthorized response
				rspObj.errCode = CONSTANTS.apiResponses.TOKEN_MISSING_CODE
				rspObj.errMsg = CONSTANTS.apiResponses.TOKEN_MISSING_MESSAGE
				rspObj.responseCode = HTTP_STATUS_CODE['unauthorized'].status
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
				rspObj.errCode = CONSTANTS.apiResponses.TOKEN_MISSING_CODE
				rspObj.errMsg = CONSTANTS.apiResponses.TOKEN_MISSING_MESSAGE
				rspObj.responseCode = HTTP_STATUS_CODE['unauthorized'].status
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
					rspObj.errCode = CONSTANTS.apiResponses.TOKEN_INVALID_CODE
					rspObj.errMsg = CONSTANTS.apiResponses.TOKEN_INVALID_MESSAGE
					rspObj.responseCode = HTTP_STATUS_CODE['unauthorized'].status
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

		if (!decodedToken) {
			rspObj.errCode = CONSTANTS.apiResponses.TOKEN_MISSING_CODE
			rspObj.errMsg = CONSTANTS.apiResponses.TOKEN_MISSING_MESSAGE
			rspObj.responseCode = HTTP_STATUS_CODE['unauthorized'].status
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

		// Create user details to request
		req.userDetails = {
			userToken: token,
		}

		// performing default token data extraction
		if (defaultTokenExtraction) {
			if (!decodedToken.data.organization_id) {
				const orgId = req.get(process.env.ORG_ID_HEADER_NAME)
				if (orgId && orgId != '') {
					decodedToken.data.organization_id = orgId.toString()
				} else decodedToken.data.organization_id = null
			}
			userInformation = {
				userId:
					typeof decodedToken.data.id == 'string' ? decodedToken.data.id : decodedToken.data.id.toString(),
				userName: decodedToken.data.name,
				organizationId: decodedToken.data.organization_id ? decodedToken.data.organization_id.toString() : null,
				firstName: decodedToken.data.name,
				roles: decodedToken.data.roles.map((role) => role.title),
				tenantId: decodedToken.data.tenant_id.toString(),
			}
		} else {
			// Iterate through each key in the config object
			for (let key in configData) {
				let stringTypeKeys = ['userId', 'tenantId', 'organizationId']
				if (configData.hasOwnProperty(key)) {
					let keyValue = getNestedValue(decodedToken, configData[key])
					if (stringTypeKeys.includes(key)) {
						keyValue = keyValue.toString()
					}
					// For each key in config, assign the corresponding value from decodedToken
					userInformation[key] = keyValue
				}
			}
			if (userInformation.roles && Array.isArray(userInformation.roles) && userInformation.roles.length) {
				userInformation.roles = userInformation.roles.map((role) => role.title)
			}
		}

		// throw error if tenant_id or organization_id is not present in the decoded token
		if (
			!decodedToken.data.tenant_id ||
			!(decodedToken.data.tenant_id.toString().length > 0) ||
			!decodedToken.data.organization_id ||
			!(decodedToken.data.organization_id.toString().length > 0)
		) {
			rspObj.errCode = CONSTANTS.apiResponses.TENANTID_AND_ORGID_REQUIRED_IN_TOKEN_CODE
			rspObj.errMsg = CONSTANTS.apiResponses.TENANTID_AND_ORGID_REQUIRED_IN_TOKEN_MESSAGE
			rspObj.responseCode = HTTP_STATUS_CODE['bad_request'].status
			return res.status(HTTP_STATUS_CODE['bad_request'].status).send(respUtil(rspObj))
		}

		/**
		 * Validate if provided orgId(s) belong to the tenant by checking against related_orgs.
		 *
		 * @param {String} tenantId - ID of the tenant
		 * @param {String} orgId - Comma separated string of org IDs or 'ALL'
		 * @returns {Object} - Success with validOrgIds array or failure with error object
		 */
		async function validateIfOrgsBelongsToTenant(tenantId, orgId) {
			let orgIdArr = orgId?.split(',') || []
			let orgDetails = await userService.fetchDefaultOrgDetails(tenantId)
			let validOrgIds = null

			if (orgIdArr.includes('ALL') || orgIdArr.includes('all')) {
				validOrgIds = ['ALL']
			} else {
				if (
					!orgDetails ||
					!orgDetails.success ||
					!orgDetails.data ||
					!(Object.keys(orgDetails.data).length > 0) ||
					!orgDetails.data.related_orgs ||
					!(orgDetails.data.related_orgs > 0)
				) {
					let errorObj = {}
					errorObj.errCode = CONSTANTS.apiResponses.ORG_DETAILS_FETCH_UNSUCCESSFUL_CODE
					errorObj.errMsg = CONSTANTS.apiResponses.ORG_DETAILS_FETCH_UNSUCCESSFUL_MESSAGE
					errorObj.responseCode = HTTP_STATUS_CODE['bad_request'].status
					return { success: false, errorObj: errorObj }
				}

				// convert the types of items to string
				orgDetails.data.related_orgs = orgDetails.data.related_orgs.map(String)
				// aggregate valid orgids

				let relatedOrgIds = orgDetails.data.related_orgs

				validOrgIds = orgIdArr.filter((id) => relatedOrgIds.includes(id))

				if (!(validOrgIds.length > 0)) {
					rspObj.errCode = CONSTANTS.apiResponses.TENANTID_AND_ORGID_REQUIRED_IN_TOKEN_CODE
					rspObj.errMsg = CONSTANTS.apiResponses.TENANTID_AND_ORGID_REQUIRED_IN_TOKEN_MESSAGE
					rspObj.responseCode = HTTP_STATUS_CODE['bad_request'].status
					return res.status(HTTP_STATUS_CODE['bad_request'].status).send(respUtil(rspObj))
				}
			}

			return { success: true, validOrgIds: validOrgIds }
		}
		/**
		 * Extract tenantId and orgId from incoming request or decoded token.
		 *
		 * Priority order: body -> query -> headers -> decoded token data
		 *
		 * @param {Object} req - Express request object
		 * @param {Object} decodedTokenData - Decoded JWT token data
		 * @returns {Object} - Success with tenantId and orgId or failure object
		 */
		function getTenantIdAndOrgIdFromTheTheReqIntoHeaders(req, decodedTokenData) {
			// Step 1: Check in the request body
			if (req.body && req.body.tenantId && req.body.orgId) {
				return { success: true, tenantId: req.body.tenantId, orgId: req.body.orgId }
			}

			// Step 2: Check in query parameters if not found in body
			if (req.query.tenantId && req.query.orgId) {
				return { success: true, tenantId: req.query.tenantId, orgId: req.query.orgId }
			}

			// Step 3: Check in headers if not found in query params
			if (req.headers['tenantid'] && req.headers['orgid']) {
				return { success: true, tenantId: req.headers['tenantid'], orgId: req.headers['orgid'] }
			}

			// Step 4: Check in user token (already decoded) if still not found
			if (decodedTokenData && decodedTokenData.tenantId && decodedTokenData.orgId) {
				return { success: true, tenantId: decodedTokenData.tenantId, orgId: decodedTokenData.orgId }
			}

			return { sucess: false }
		}

		let userRoles = decodedToken.data.roles.map((role) => role.title)

		if (performInternalAccessTokenCheck) {
			decodedToken.data['tenantAndOrgInfo'] = {}
			// validate SUPER_ADMIN
			if (adminHeader) {
				if (adminHeader != process.env.ADMIN_ACCESS_TOKEN) {
					return res.status(HTTP_STATUS_CODE['unauthorized'].status).send(respUtil(rspObj))
				}
				decodedToken.data.roles.push({ title: CONSTANTS.common.ADMIN_ROLE })

				let result = getTenantIdAndOrgIdFromTheTheReqIntoHeaders(req, decodedToken.data)
				if (!result.success) {
					rspObj.errCode = reqMsg.ADMIN_TOKEN.MISSING_CODE
					rspObj.errMsg = reqMsg.ADMIN_TOKEN.MISSING_MESSAGE
					rspObj.responseCode = responseCode.unauthorized.status
					return res.status(responseCode.unauthorized.status).send(respUtil(rspObj))
				}

				req.headers['tenantid'] = result.tenantId
				req.headers['orgid'] = result.orgId

				let validateOrgsResult = await validateIfOrgsBelongsToTenant(
					req.headers['tenantid'],
					req.headers['orgid']
				)

				if (!validateOrgsResult.success) {
					return res
						.status(HTTP_STATUS_CODE['unauthorized'].status)
						.send(respUtil(validateOrgsResult.errorObj))
				}

				req.headers['orgid'] = validateOrgsResult.validOrgIds
			} else if (userRoles.includes(CONSTANTS.common.TENANT_ADMIN)) {
				req.headers['tenantid'] = decodedToken.data.tenant_id.toString()

				let orgId = req.body.orgId || req.headers['orgid']

				if (!orgId) {
					rspObj.errCode = CONSTANTS.apiResponses.INVALID_TENANT_AND_ORG_CODE
					rspObj.errMsg = CONSTANTS.apiResponses.INVALID_TENANT_AND_ORG_MESSAGE
					rspObj.responseCode = HTTP_STATUS_CODE['bad_request'].status
					return res.status(HTTP_STATUS_CODE['bad_request'].status).send(respUtil(rspObj))
				}

				req.headers['orgid'] = orgId

				let validateOrgsResult = await validateIfOrgsBelongsToTenant(
					req.headers['tenantid'],
					req.headers['orgid']
				)
				if (!validateOrgsResult.success) {
					return res.status(responseCode['unauthorized'].status).send(respUtil(validateOrgsResult.errorObj))
				}
				req.headers['orgid'] = validateOrgsResult.validOrgIds
			} else if (userRoles.includes(CONSTANTS.common.ORG_ADMIN)) {
				req.headers['tenantid'] = decodedToken.data.tenant_id.toString()
				req.headers['orgid'] = [decodedToken.data.organization_id.toString()]
			} else {
				rspObj.errCode = reqMsg.INVALID_ROLE.INVALID_CODE
				rspObj.errMsg = reqMsg.INVALID_ROLE.INVALID_MESSAGE
				rspObj.responseCode = responseCode.unauthorized.status
				return res.status(responseCode['unauthorized'].status).send(respUtil(rspObj))
			}

			decodedToken.data.tenantAndOrgInfo['tenantId'] = req.headers['tenantid'].toString()
			decodedToken.data.tenantAndOrgInfo['orgId'] = req.headers['orgid']
		}
	} catch (err) {
		rspObj.errCode = CONSTANTS.apiResponses.TOKEN_MISSING_CODE
		rspObj.errMsg = CONSTANTS.apiResponses.TOKEN_MISSING_MESSAGE
		rspObj.responseCode = HTTP_STATUS_CODE['unauthorized'].status
		return res.status(HTTP_STATUS_CODE['unauthorized'].status).send(respUtil(rspObj))
	}
	if (!decodedToken) {
		rspObj.errCode = CONSTANTS.apiResponses.TOKEN_MISSING_CODE
		rspObj.errMsg = CONSTANTS.apiResponses.TOKEN_MISSING_MESSAGE
		rspObj.responseCode = HTTP_STATUS_CODE['unauthorized'].status
		return res.status(HTTP_STATUS_CODE['unauthorized'].status).send(respUtil(rspObj))
	}

	// Update user details object
	req.userDetails.userInformation = userInformation
	if (decodedToken.data.tenantAndOrgInfo) {
		req.userDetails.tenantAndOrgInfo = decodedToken.data.tenantAndOrgInfo
	}
	// Helper function to access nested properties
	function getNestedValue(obj, path) {
		return path.split('.').reduce((acc, part) => acc && acc[part], obj)
	}

	next()
}

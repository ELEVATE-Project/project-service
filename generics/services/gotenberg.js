//dependencies
const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')
const projectQueries = require(DB_QUERY_BASE_PATH + '/projects')

/**
 * Generates options for making a request to Gotenberg service to convert HTML content.
 * @returns {Object} The options object for the HTTP request.
 */
function getGotenbergConnection() {
	let options = {
		method: 'POST',
		uri: process.env.GOTENBERG_URL + '/forms/chromium/convert/html',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		resolveWithFullResponse: true,
		encoding: null,
		json: true,
		formData: '',
	}

	return options
}

/**
 * Generates options for making a request to Gotenberg service to generate a PDF certificate.
 * @param {Boolean} asyncMode - Defines if the certificate callback is in async or sync mode.
 * @returns {Object} The options object for Gotneberg request.
 */

function gotenbergConnectionForCertificate(asyncMode = true) {
	// Define the options object for the Gotenberg connection
	let options = {
		uri: process.env.GOTENBERG_URL + '/forms/libreoffice/convert', // Gotenberg URI for converting LibreOffice documents
		headers: {
			'Content-Type': 'multipart/form-data', // Set the Content-Type header for multipart/form-data
		},
		responseType: 'arraybuffer', // Set the response type to arraybuffer
	}

	// If asyncMode is true, configure the callback URLs for Gotenberg webhooks
	if (asyncMode) {
		// Construct the base URL for the callback
		const callbackBaseUrl = `${process.env.ELEVATE_PROJECT_SERVICE_URL}/${process.env.SERVICE_NAME}`

		const callbackUrl = callbackBaseUrl + CONSTANTS.endpoints.PROJECT_CERTIFICATE_API_CALLBACK

		const errorCallBackUrl = callbackBaseUrl + CONSTANTS.endpoints.PROJECT_CERTIFICATE_API_CALLBACK_ERROR

		options.headers['Gotenberg-Webhook-Url'] = callbackUrl
		options.headers['Gotenberg-Webhook-Error-Url'] = errorCallBackUrl
		options['responseType'] = ''
	}

	return options
}

/**
 * Project certificate creation
 * @function
 * @name createCertificate
 * @param {Object} bodyData - Body data.
 * @param {Boolean} asyncMode - Defines if the certificate callback is async or sync.
 * @returns {JSON} - Certificate creation details.
 */

const createCertificate = function (bodyData, asyncMode = true) {
	return new Promise(async (resolve, reject) => {
		try {
			let result = {
				success: true,
				data: {},
			}

			// Prepare the form data with the SVG template
			const formData = new FormData()
			formData.append('files', fs.createReadStream(bodyData.svgTemplatePath))

			// Get Gotenberg options for certificate generation
			const gotenbergOptionsForCertificate = await gotenbergConnectionForCertificate(asyncMode)

			// Send a POST request to Gotenberg to generate the PDF
			const response = await axios.post(gotenbergOptionsForCertificate.uri, formData, {
				headers: {
					...gotenbergOptionsForCertificate.headers,
					...formData.getHeaders(),
				},
				responseType: gotenbergOptionsForCertificate.responseType,
			})
			console.log('\n<==============================GOTENBERG SERVICE TRIGGERED==============================>\n')
			console.log(
				'\n<==============================GOTENBERG SERVICE RESPONSE==============================>\n',
				response
			)

			if (!asyncMode && (!response || !response.data)) {
				result['success'] = false
				result['message'] = CONSTANTS.apiResponses.CERTIFICATE_GENERATION_FAILED
				await projectQueries.findOneAndUpdate(
					{
						_id: bodyData.projectId,
					},
					{
						$set: {
							'certificate.transactionId': response.headers['gotenberg-trace'],
							'certificate.transactionIdCreatedAt': new Date(),
						},
					}
				)
				return resolve(result)
			}

			if (!asyncMode) {
				result['data']['gotenbergResponse'] = response
			}

			// Add the transaction ID from the response headers to the result
			result['data']['transactionId'] = response.headers['gotenberg-trace']

			// Resolve the promise with the result
			return resolve(result)
		} catch (error) {
			// Reject the promise with the error
			return reject(error)
		}
	})
}

module.exports = {
	getGotenbergConnection: getGotenbergConnection,
	gotenbergConnectionForCertificate: gotenbergConnectionForCertificate,
	createCertificate: createCertificate,
}

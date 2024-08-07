//dependencies
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const common_handler = require(GENERICS_FILES_PATH + '/helpers/common_handler')
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
			// Define the temporary folder path for the certificate
			const certificateTempFolderPath = path.resolve(__dirname + '/../../certificateTempFolder')

			// Remove the temporary folder if it exists
			if (fs.existsSync(certificateTempFolderPath)) {
				fs.rmSync(certificateTempFolderPath, { recursive: true, force: true })
			}

			// Create the temporary folder
			fs.mkdirSync(certificateTempFolderPath)

			// Generate UUID for svg file
			const dynamicUUIDForSvgFile = UTILS.generateUniqueId()

			// Define the path for the SVG template
			const svgTemplatePath = certificateTempFolderPath + `/${dynamicUUIDForSvgFile}_template.svg`

			// Write the populated SVG template to the file
			fs.writeFileSync(svgTemplatePath, bodyData.populatedSVGTemplate)

			// Read the SVG template and convert it to a single line string
			fs.readFileSync(svgTemplatePath, 'utf-8', (error, data) => {
				if (error) {
					// If there's an error reading the file, clean up and throw an error
					if (fs.existsSync(certificateTempFolderPath)) {
						fs.rmSync(certificateTempFolderPath, { recursive: true, force: true })
					}
					throw {
						message: CONSTANTS.apiResponses.CERTIFICATE_GENERATION_FAILED,
					}
				}

				// Replace all whitespace with a single space and trim the string
				const singleLineSvg = data.replace(/\s+/g, ' ').trim()

				// Write the single line SVG back to the file
				fs.writeFileSync(svgTemplatePath, singleLineSvg, 'utf-8', (error) => {
					if (error) {
						// If there's an error writing the file, clean up and throw an error
						if (fs.existsSync(certificateTempFolderPath)) {
							fs.rmSync(certificateTempFolderPath, { recursive: true, force: true })
						}
						throw {
							message: CONSTANTS.apiResponses.CERTIFICATE_GENERATION_FAILED,
						}
					}
				})
			})

			let result = {
				success: true,
			}

			const svgUploadDetails = await common_handler.uploadPdfToCloud(
				`${dynamicUUIDForSvgFile}_template.svg`,
				bodyData.userId,
				certificateTempFolderPath
			)

			if (!svgUploadDetails || svgUploadDetails.data == '') {
				result['success'] = false
				result['message'] = CONSTANTS.apiResponses.FAILED_TO_CREATE_DOWNLOADABLEURL
				return resolve(result)
			}

			// Update the project in the database
			await projectQueries.findOneAndUpdate(
				{
					_id: bodyData.projectId,
				},
				{
					$set: {
						'certificate.svgPath': svgUploadDetails.data,
					},
				}
			)

			// Prepare the form data with the SVG template
			const formData = new FormData()
			formData.append('files', fs.createReadStream(svgTemplatePath))

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
							['certificate.transactionIdCreatedAt']: new Date(),
						},
					}
				)
				return resolve(result)
			}
			// If not in async mode, handle the response data
			if (!asyncMode) {
				// Generate UUID for pdf file
				const dynamicUUIDForPdfFile = UTILS.generateUniqueId()

				// Define the path for the output PDF
				const certificatePdfPath = certificateTempFolderPath + `/${dynamicUUIDForPdfFile}_output.pdf`

				// Write the response data (PDF) to the file
				fs.writeFileSync(certificatePdfPath, response.data)

				// Upload the PDF and SVG template to the cloud
				const pdfUploadDetails = await common_handler.uploadPdfToCloud(
					`${dynamicUUIDForPdfFile}_output.pdf`,
					bodyData.userId,
					certificateTempFolderPath
				)

				let updateObject = {
					$set: {},
				}

				// If the PDF upload was successful, update the project details
				if (pdfUploadDetails.success && pdfUploadDetails.data != '') {
					updateObject['$set']['certificate.pdfPath'] = pdfUploadDetails.data
					updateObject['$set']['certificate.issuedOn'] = new Date()

					// Update the project in the database
					let updatedProject = await projectQueries.findOneAndUpdate(
						{
							_id: bodyData.projectId,
						},
						updateObject
					)
				}

				// Clean up the temporary folder
				if (fs.existsSync(certificateTempFolderPath)) {
					fs.rmSync(certificateTempFolderPath, { recursive: true, force: true })
				}
			}

			// Add the transaction ID from the response headers to the result
			result['data'] = {
				transactionId: response.headers['gotenberg-trace'],
			}

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

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

function gotenbergConnectionForCertificate(projectId, userId, asyncMode = true) {
	let options = {
		uri: process.env.GOTENBERG_URL + '/forms/libreoffice/convert',
		headers: {
			'Content-Type': 'multipart/form-data',
		},
		responseType: 'arraybuffer',
	}

	const callbackUrl =
		'http://localhost:' +
		process.env.APPLICATION_PORT +
		'/' +
		process.env.SERVICE_NAME +
		CONSTANTS.endpoints.PROJECT_CERTIFICATE_API_CALLBACK +
		`/${projectId}?userId=${userId}`
	const errorCallBackUrl =
		'http://localhost:' +
		process.env.APPLICATION_PORT +
		'/' +
		process.env.SERVICE_NAME +
		CONSTANTS.endpoints.PROJECT_CERTIFICATE_API_CALLBACK_ERROR

	if (asyncMode) {
		options.headers['Gotenberg-Webhook-Url'] = callbackUrl
		options.headers['Gotenberg-Webhook-Error-Url'] = errorCallBackUrl
		options['responseType'] = ''
	}

	return options
}

module.exports = {
	getGotenbergConnection: getGotenbergConnection,
	gotenbergConnectionForCertificate: gotenbergConnectionForCertificate,
}

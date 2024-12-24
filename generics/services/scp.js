/**
 * name : scp.js
 * author : Priyanka Pradeep
 * Date : 20-dec-2024
 * Description : All scp related api call.
 */

//dependencies
const request = require('request')

// Function to callback to SCP service
const resourcePublishCallBack = function (callBackUrl, resourceId, templateId) {
	return new Promise(async (resolve, reject) => {
		try {
			// Construct the URL for the user service
			const url = `${callBackUrl}?resource_id=${resourceId}&published_id=${templateId.toString()}`

			// Set the options for the HTTP POST request
			const options = {
				headers: {
					'content-type': 'application/json',
					internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
				},
			}

			request.post(url, options, scpPublishCallback)
			let result = {
				success: true,
			}
			function scpPublishCallback(err, data) {
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
	resourcePublishCallBack,
}

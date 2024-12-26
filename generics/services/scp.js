/**
 * name : scp.js
 * author : Priyanka Pradeep
 * Date : 20-dec-2024
 * Description : All scp related api call.
 */

//dependencies
const request = require('request')

// Function to callback to SCP service
/**
 *
 * @function
 * @name resourcePublishCallBack
 * @param {String} callBackUrl -  Call back url
 * @param {String} resourceId -  resource id
 * @param {String} templateId -  template id
 * @returns {Promise} returns a promise.
 */
const resourcePublishCallBack = function (callBackUrl, resourceId, templateId) {
	// Construct the URL for the user service
	const url = `${callBackUrl}?resource_id=${resourceId}&published_id=${templateId.toString()}`

	return new Promise((resolve, reject) => {
		try {
			const options = {
				headers: {
					'content-type': 'application/json',
					internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
				},
			}

			const scpCallBack = function (err, data) {
				let result = {
					success: true,
				}

				if (err) {
					result.success = false
				} else {
					let response = JSON.parse(data.body)
					if (response.status === HTTP_STATUS_CODE['ok'].status) {
						result['data'] = response.result
					} else {
						result.success = false
					}
				}
				return resolve(result)
			}

			request.get(url, options, scpCallBack)
		} catch (error) {
			return reject(error)
		}
	})
}

module.exports = {
	resourcePublishCallBack,
}

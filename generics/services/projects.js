/**
 * name : projects.js
 * author : prajwal
 * Date : 09-September-2024
 * Description : All projects related api call.
 */

const request = require('request')
const projectServiceUrl = process.env.ELEVATE_PROJECT_SERVICE_URL

// Function to read the user profile based on the given userId
const profileRead = function (userToken) {
	return new Promise(async (resolve, reject) => {
		try {
			// Construct the URL for the user service
			let url = `${projectServiceUrl}/${process.env.SERVICE_NAME}${CONSTANTS.endpoints.PROFILE_READ}`
			console.log(url, 'url profileRead************************8')
			// Set the options for the HTTP GET request
			const options = {
				headers: {
					'content-type': 'application/json',
					'x-auth-token': userToken,
				},
			}
			request.get(url, options, userReadCallback)
			let result = {
				success: true,
			}
			// Handle callback fucntion
			function userReadCallback(err, data) {
				if (err) {
					console.log(err, 'err inside profileRead****************')
					result.success = false
				} else {
					console.log(data.body, 'data.body profileRead**************')
					let response = JSON.parse(data.body)
					if (response.status === HTTP_STATUS_CODE.ok.status) {
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
			console.log(error, 'error line no 53 profileRead***************************')
			return reject(error)
		}
	})
}

module.exports = {
	profileRead: profileRead,
}

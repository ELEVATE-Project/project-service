/**
 * name : requests.js
 * author : prajwal
 * Date : 03 - Dec - 2025
 * Description : Generic request methods
 */
const request = require('request')
const parser = require('xml2json')

var post = function (
	url,
	body,
	token = '',
	internalAccessToken = false,
	internalAccessTokenKey = 'internal-access-token'
) {
	return new Promise((resolve, reject) => {
		try {
			let headers = {
				'content-type': 'application/json',
			}
			if (internalAccessToken) {
				headers[internalAccessTokenKey] = process.env.INTERNAL_ACCESS_TOKEN
			}

			if (token != '') {
				headers['x-auth-token'] = token
			}

			const options = {
				headers: headers,
				body: JSON.stringify(body),
			}

			request.post(url, options, (err, data) => {
				let result = {
					success: true,
				}

				if (err) {
					result.success = false
				} else {
					let response = data.body
					if (data.headers['content-type'].split(';')[0] !== 'application/json') {
						response = parser.toJson(data.body)
					} else if (/text\/xml|application\/xml/.test(data.headers['content-type'])) {
						response = parser.toJson(response, { object: true })
					}

					response = JSON.parse(response)
					result.data = response
				}

				return resolve(result)
			})
		} catch (error) {
			return reject(error)
		}
	})
}

module.exports = {
	post: post,
}

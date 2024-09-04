/**
 * name : cloud-services/files/validator/v1.js
 * author : prajwal
 * created-date : 28-Apr-2024
 * Description : Files validator.
 */

module.exports = (req) => {
	let filesValidator = {
		preSignedUrls: function () {
			req.checkBody('request').exists().withMessage('request data is required')
		},
	}

	if (filesValidator[req.params.method]) {
		filesValidator[req.params.method]()
	}
}

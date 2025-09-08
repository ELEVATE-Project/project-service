module.exports = (req) => {
	let organizationExtensionValidator = {
		update: function () {
			// Extra validation only if method = "POST"
			if (req.method === CONSTANTS.common.API_REQUEST_METHODS.POST) {
				req.checkBody('projectResourceVisibilityPolicy')
					.exists()
					.withMessage('projectResourceVisibilityPolicy is required')

				req.checkBody('externalProjectResourceVisibilityPolicy')
					.exists()
					.withMessage('externalProjectResourceVisibilityPolicy is required')
			}

			// Extra validation only if method = "PATCH"
			if (req.method === CONSTANTS.common.API_REQUEST_METHODS.PATCH) {
				req.checkParams('_id')
					.exists()
					.withMessage('orgExtension _id is required')
					.isMongoId()
					.withMessage('Invalid orgExtension _id')
			}
		},
	}

	if (organizationExtensionValidator[req.params.method]) {
		organizationExtensionValidator[req.params.method]()
	}
}

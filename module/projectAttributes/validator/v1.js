/**
 * name : v1.js
 * author : PraveenDass
 * created-date : 26-Nov-2024
 * Description : Projects Attributes validation.
 */

module.exports = (req) => {
	let projectsAttributesValidator = {
		update: function () {
			req.checkQuery('code').exists().withMessage('required code'),
				// Check if the request body is empty
				req
					.checkBody()
					.custom(() => {
						if (!Object.keys(req.body).length) {
							throw new Error('Request body cannot be empty.')
						}
						return true
					})
					.withMessage('Request body cannot be empty.'),
				//  both translateData and data are not present together
				req
					.checkBody()
					.custom(() => {
						if (req.body.translateData && req.body.data) {
							throw new Error('Both translateData and data cannot be present at the same time.')
						}
						return true
					})
					.withMessage('Both translateData and data cannot be present at the same time.')
			// Check validation for translateData
			req
				.checkBody('translateData')
				.custom((projectAttributes) => {
					if (projectAttributes) {
						if (
							!projectAttributes.name ||
							!projectAttributes.data ||
							!Array.isArray(projectAttributes.data) ||
							projectAttributes.data.length === 0
						) {
							throw new Error('translateData must include a non-empty name and data array.')
						}
					}
					return true
				})
				.withMessage('Invalid translateData format'),
				// Check validation for without translateData

				req
					.checkBody('data')
					.custom((projectAttributes) => {
						if (projectAttributes) {
							if (!Array.isArray(projectAttributes) || projectAttributes.length === 0) {
								throw new Error('data must be a non-empty array.')
							}
						}
						return true
					})
					.withMessage('Invalid data format')
		},
	}

	if (projectsAttributesValidator[req.params.method]) {
		projectsAttributesValidator[req.params.method]()
	}
}

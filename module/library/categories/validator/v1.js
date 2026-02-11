/**
 * name : v1.js
 * author : Aman
 * created-date : 05-Aug-2020
 * Description : Projects categories validation.
 */

module.exports = (req) => {
	let projectsValidator = {
		create: function () {
			req.checkBody('externalId').exists().withMessage('externalId is required')
			req.checkBody('name').exists().withMessage('name is required')
			req.checkBody('description').optional().isString().withMessage('description must be a string')
			req.checkBody('keywords').optional().isArray().withMessage('keywords must be an array')
			if (req.body.keywords) {
				req.body.keywords.forEach((keyword, index) => {
					req.checkBody(`keywords[${index}]`)
						.isString()
						.withMessage(`keyword at index ${index} must be a string`)
				})
			}
			req.checkBody('parent_id').optional().isMongoId().withMessage('parent_id must be a valid ObjectId')
			req.checkBody('hasChildCategories')
				.not()
				.exists()
				.withMessage('hasChildCategories cannot be set in request body')
			req.checkBody('sequenceNumber')
				.optional()
				.isInt({ min: 0 })
				.withMessage('sequenceNumber must be a non-negative integer')
		},
		update: function () {
			req.checkParams('_id').exists().withMessage('required category id')
		},
	}

	if (projectsValidator[req.params.method]) {
		projectsValidator[req.params.method]()
	}
}

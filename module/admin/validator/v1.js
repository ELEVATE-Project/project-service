/**
 * name : v1.js
 * author : Prajwal
 * created-date : 15-Apr-2024
 * Description : Admin.
 */

module.exports = (req) => {
	let adminValidator = {
		createIndex: function () {
			req.checkParams('_id').exists().withMessage('required collection name')
			req.checkBody('keys').exists().withMessage('keys required')
		},
		deletedResourceDetails: function () {
			req.checkParams('_id').exists().withMessage('required resource id')
			req.checkQuery('type')
				.exists()
				.withMessage('Resource type is required (program/solution)')
				.isIn(['program', 'solution'])
				.withMessage('Invalid resource type. Must be "program" or "solution"')
		},
	}

	if (adminValidator[req.params.method]) {
		adminValidator[req.params.method]()
	}
}

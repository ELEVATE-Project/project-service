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
		deleteResource: function () {
			req.checkParams('_id').exists().withMessage('required resource id')
			req.checkQuery('type')
				.exists()
				.withMessage('Resource type is required (program/solution)')
				.isIn(['program', 'solution'])
				.withMessage('Invalid resource type. Must be "program" or "solution"')
		},
		updateRelatedOrgs: function () {
			req.checkBody('changes').exists().withMessage('changes object is required')
			req.checkBody('changes.related_org_details')
				.exists()
				.withMessage('changes.related_org_details object is required')
			req.checkBody('changes.related_org_details.newValue')
				.exists()
				.withMessage('changes.related_org_details.newValue is required')
				.isArray()
				.withMessage('changes.related_org_details.newValue must be an array')
		},
	}

	if (adminValidator[req.params.method]) {
		adminValidator[req.params.method]()
	}
}

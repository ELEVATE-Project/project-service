/**
 * name : v1.js
 * author : Implementation Team
 * created-date : December 2025
 * Description : Project categories validation with hierarchy support.
 */

module.exports = (req) => {
	let projectCategoriesValidator = {
		create: function () {
			req.checkBody('externalId').exists().withMessage('externalId is required')
			req.checkBody('name').exists().withMessage('name is required')
			// parentId is optional - if not provided, category is root
		},
		update: function () {
			req.checkParams('_id').exists().withMessage('required category id')
		},
		move: function () {
			req.checkParams('_id').exists().withMessage('required category id')
			// newParentId is optional - null means move to root
		},
		canDelete: function () {
			req.checkParams('_id').exists().withMessage('required category id')
		},
		bulk: function () {
			req.checkBody('categories').exists().withMessage('categories array is required')
			req.checkBody('categories').isArray().withMessage('categories must be an array')
		},
		list: function () {
			// Optional validations for query params
			if (req.query.level !== undefined) {
				req.checkQuery('level').isInt().withMessage('level must be an integer')
			}
		},
		hierarchy: function () {
			// Optional validations
			if (req.query.maxDepth !== undefined) {
				req.checkQuery('maxDepth').isInt().withMessage('maxDepth must be an integer')
			}
		},
		leaves: function () {},
		details: function () {
			req.checkParams('_id').exists().withMessage('required category id')
		},
	}

	if (projectCategoriesValidator[req.params.method]) {
		projectCategoriesValidator[req.params.method]()
	}
}

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

			// parent id can be passed as either `parent_id` or `parentId`
			if (req.query.parent_id !== undefined) {
				req.checkQuery('parent_id').isMongoId().withMessage('parent_id must be a valid id')
			}

			if (req.query.parentId !== undefined) {
				req.checkQuery('parentId').isMongoId().withMessage('parentId must be a valid id')
			}

			// Optional single id filter
			if (req.query.id !== undefined) {
				req.checkQuery('id').isMongoId().withMessage('id must be a valid id')
			}
		},
		hierarchy: function () {
			// Optional validations
			if (req.query.maxDepth !== undefined) {
				req.checkQuery('maxDepth').isInt().withMessage('maxDepth must be an integer')
			}

			if (req.query.parent_id !== undefined) {
				req.checkQuery('parent_id').isMongoId().withMessage('parent_id must be a valid id')
			}

			if (req.query.parentId !== undefined) {
				req.checkQuery('parentId').isMongoId().withMessage('parentId must be a valid id')
			}
		},
		leaves: function () {
			// leaves can accept optional parent id/level filters
			if (req.query.parent_id !== undefined) {
				req.checkQuery('parent_id').isMongoId().withMessage('parent_id must be a valid id')
			}

			if (req.query.parentId !== undefined) {
				req.checkQuery('parentId').isMongoId().withMessage('parentId must be a valid id')
			}

			if (req.query.level !== undefined) {
				req.checkQuery('level').isInt().withMessage('level must be an integer')
			}
		},
		details: function () {
			req.checkParams('_id').exists().withMessage('required category id')
			if (req.params._id !== undefined) {
				req.checkParams('_id').isMongoId().withMessage('category id must be a valid id')
			}
		},

		projectsByCategoryId: function () {
			// expect category id in params
			req.checkParams('_id').exists().withMessage('required category id')
			if (req.params._id !== undefined) {
				req.checkParams('_id').isMongoId().withMessage('category id must be a valid id')
			}
		},

		projectList: function () {
			// Accepts either categoryIds (array of ids) or categoryExternalIds (array of strings)
			if (!req.body.categoryIds && !req.body.categoryExternalIds) {
				req.checkBody('categoryIds')
					.exists()
					.withMessage('categoryIds or categoryExternalIds array is required')
			} else {
				if (req.body.categoryIds !== undefined) {
					req.checkBody('categoryIds').isArray().withMessage('categoryIds must be an array')
					// validate each id if provided
					if (Array.isArray(req.body.categoryIds)) {
						req.body.categoryIds.forEach((id, idx) => {
							if (id !== undefined && id !== null && id !== '') {
								req.checkBody(`categoryIds[${idx}]`)
									.isMongoId()
									.withMessage('each categoryId must be a valid id')
							}
						})
					}
				}

				if (req.body.categoryExternalIds !== undefined) {
					req.checkBody('categoryExternalIds').isArray().withMessage('categoryExternalIds must be an array')
				}
			}
		},
	}

	if (projectCategoriesValidator[req.params.method]) {
		projectCategoriesValidator[req.params.method]()
	}
}

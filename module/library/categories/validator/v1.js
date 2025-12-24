/**
 * name : v1.js
 * author : Aman
 * created-date : 05-Aug-2020
 * Description : Projects categories validation.
 */

module.exports = (req) => {
	let libraryCategoriesValidator = {
		/**
		 * Create: Validate required fields for new category
		 * - externalId: required, unique
		 * - name: required
		 * - parentId: optional (null = root category)
		 * - icon: optional
		 * - sequenceNumber: optional
		 */
		create: function () {
			req.checkBody('externalId').exists().withMessage('externalId is required')
			req.checkBody('name').exists().withMessage('name is required')
			if (req.body.parentId) {
				req.checkBody('parentId').isMongoId().withMessage('parentId must be a valid MongoDB ObjectId')
			}
			if (req.body.sequenceNumber !== undefined) {
				req.checkBody('sequenceNumber').isInt().withMessage('sequenceNumber must be an integer')
			}
		},

		/**
		 * Update: Validate category ID and optional fields
		 */
		update: function () {
			req.checkParams('_id').exists().withMessage('required category id')
			if (req.body.name !== undefined) {
				req.checkBody('name').notEmpty().withMessage('name cannot be empty')
			}
			if (req.body.externalId !== undefined) {
				req.checkBody('externalId').notEmpty().withMessage('externalId cannot be empty')
			}
		},

		/**
		 * Details: Validate category ID
		 */
		details: function () {
			req.checkParams('_id').exists().withMessage('required category id')
		},

		/**
		 * Delete: Validate category ID
		 */
		delete: function () {
			req.checkParams('_id').exists().withMessage('required category id')
		},

		/**
		 * Move: Validate category ID and newParentId
		 */
		move: function () {
			req.checkParams('_id').exists().withMessage('required category id')
			if (req.body.newParentId !== null && req.body.newParentId !== undefined) {
				req.checkBody('newParentId').isMongoId().withMessage('newParentId must be a valid MongoDB ObjectId')
			}
		},

		/**
		 * Bulk: Validate categories array
		 */
		bulk: function () {
			req.checkBody('categories').exists().withMessage('categories array is required')
			req.checkBody('categories').isArray().withMessage('categories must be an array')
			req.checkBody('categories').notEmpty().withMessage('categories array cannot be empty')
		},

		/**
		 * List: Optional query parameters validation
		 */
		list: function () {
			if (req.query.parentId) {
				req.checkQuery('parentId').isMongoId().withMessage('parentId must be a valid MongoDB ObjectId')
			}
			if (req.query.level !== undefined) {
				req.checkQuery('level').isInt().withMessage('level must be an integer')
			}
			if (req.query.page) {
				req.checkQuery('page').isInt({ min: 1 }).withMessage('page must be a positive integer')
			}
			if (req.query.limit) {
				req.checkQuery('limit').isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100')
			}
		},

		/**
		 * (removed) Hierarchy validator: full-tree hierarchy endpoint removed
		 */

		/**
		 * CategoryHierarchy: Validate category ID
		 */
		categoryHierarchy: function () {
			req.checkParams('_id').exists().withMessage('required category id')
			if (req.query.maxDepth) {
				req.checkQuery('maxDepth').isInt({ min: 1, max: 10 }).withMessage('maxDepth must be between 1 and 10')
			}
		},

		/**
		 * Leaves: Optional query parameters
		 */
		leaves: function () {
			if (req.query.page) {
				req.checkQuery('page').isInt({ min: 1 }).withMessage('page must be a positive integer')
			}
			if (req.query.limit) {
				req.checkQuery('limit').isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100')
			}
		},

		/**
		 * ProjectsByCategoryId: Validate category ID
		 */
		projectsByCategoryId: function () {
			req.checkParams('_id').exists().withMessage('required category id')
			if (req.query.page) {
				req.checkQuery('page').isInt({ min: 1 }).withMessage('page must be a positive integer')
			}
			if (req.query.limit) {
				req.checkQuery('limit').isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100')
			}
		},

		/**
		 * ProjectList: Validate categoryIds array
		 */
		projectList: function () {
			// At least one of categoryIds or categoryExternalIds must be provided
			if (!req.body.categoryIds && !req.body.categoryExternalIds) {
				req.checkBody('categoryIds')
					.exists()
					.withMessage('categoryIds or categoryExternalIds array is required')
			}
			if (req.body.categoryIds) {
				if (!Array.isArray(req.body.categoryIds)) {
					req.checkBody('categoryIds')
						.custom(() => false)
						.withMessage('categoryIds must be an array')
				}
			}
			if (req.body.categoryExternalIds) {
				if (!Array.isArray(req.body.categoryExternalIds)) {
					req.checkBody('categoryExternalIds')
						.custom(() => false)
						.withMessage('categoryExternalIds must be an array')
				}
			}
			if (req.body.page) {
				req.checkBody('page').isInt({ min: 1 }).withMessage('page must be a positive integer')
			}
			if (req.body.limit) {
				req.checkBody('limit').isInt({ min: 1, max: 1000 }).withMessage('limit must be between 1 and 1000')
			}
		},
	}

	if (libraryCategoriesValidator[req.params.method]) {
		libraryCategoriesValidator[req.params.method]()
	}
}

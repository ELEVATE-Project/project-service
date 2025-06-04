/**
 * name : v1.js
 * author : Aman
 * created-date : 19-Jan-2021
 * Description : Solutions validation.
 */

module.exports = (req) => {
	let solutionsValidator = {
		create: function () {
			req.checkBody('programExternalId').exists().withMessage('required program externalId')
			req.checkBody('scope')
				.exists()
				.withMessage('required solution scope')
				.notEmpty()
				.withMessage('solution scope cannot be empty')
			req.checkBody('externalId').exists().withMessage('required solution externalId')
			req.checkBody('name').exists().withMessage('required solution name')
		},
		addRolesInScope: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required solution id')
				.isMongoId()
				.withMessage('Invalid solution ID')
			req.checkBody('roles').exists().withMessage('required solution roles to be added')
		},
		removeRolesInScope: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required solution id')
				.isMongoId()
				.withMessage('Invalid solution ID')
			req.checkBody('roles').exists().withMessage('required solution roles to remove')
		},
		update: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required solution id')
				.isMongoId()
				.withMessage('Invalid solution ID')
		},
		detailsBasedOnRoleAndLocation: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required solution id')
				.isMongoId()
				.withMessage('Invalid solution ID')
		},
		fetchLink: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required solution id')
				.isMongoId()
				.withMessage('Invalid solution ID')
		},
		verifyLink: function () {
			req.checkParams('_id').exists().withMessage('required solution link')
		},
		addEntitiesInScope: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required solution id')
				.isMongoId()
				.withMessage('Invalid solution ID')
			req.checkBody('entities').exists().withMessage('required entities to add')
		},
		removeEntitiesInScope: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required solution id')
				.isMongoId()
				.withMessage('Invalid solution ID')
			req.checkBody('entities').exists().withMessage('required entities to remove')
		},
		verifySolution: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required solution id')
				.isMongoId()
				.withMessage('Invalid solution ID')
			// req.checkBody('entities').exists().withMessage('required entities to remove')
			// req.checkBody('role').exists().withMessage('roles required')
			// req.checkBody('entityType').exists().withMessage('entityType required')
		},
		forUserRoleAndLocation: function () {
			req.checkBody('role').exists().withMessage('roles required')
		},
		targetedSolutions: function () {},
		isTargetedBasedOnUserProfile: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required solution id')
				.isMongoId()
				.withMessage('Invalid solution ID')
			req.checkBody('entities').exists().withMessage('required entities to remove')
			req.checkBody('role').exists().withMessage('roles required')
			// req.checkBody('entityType').exists().withMessage('entityType required')
		},
		getDetails: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required solution id')
				.isMongoId()
				.withMessage('Invalid solution ID')
		},
		details: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required solution id')
				.isMongoId()
				.withMessage('Invalid solution ID')
			// 	req.checkBody('entities').exists().withMessage('required entities')
			// req.checkBody('role').exists().withMessage('roles required')
			// req.checkBody('entityType').exists().withMessage('entityType required')
			// req.checkBody('entityTypeId').exists().withMessage('entityTypeId required')
		},
	}

	if (solutionsValidator[req.params.method]) {
		solutionsValidator[req.params.method]()
	}
}

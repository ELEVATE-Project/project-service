module.exports = (req) => {
	let programsValidator = {
		create: function () {
			req.checkBody('externalId').exists().withMessage('required program externalId')
			req.checkBody('name').exists().withMessage('required program name')
			req.checkBody('requestForPIIConsent').exists().withMessage('required requestForPIIConsent value of program')
			req.checkBody('scope')
				.exists()
				.withMessage('required solution scope')
				.notEmpty()
				.withMessage('solution scope cannot be empty')
		},
		update: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required program id')
				.isMongoId()
				.withMessage('Invalid program ID')
		},
		addRolesInScope: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required program id')
				.isMongoId()
				.withMessage('Invalid program ID')
			req.checkBody('roles').exists().withMessage('required program roles to be added')
		},
		addEntitiesInScope: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required program id')
				.isMongoId()
				.withMessage('Invalid program ID')
			req.checkBody('entities').exists().withMessage('required entities to be added')
		},
		removeRolesInScope: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required program id')
				.isMongoId()
				.withMessage('Invalid program ID')
			req.checkBody('roles').exists().withMessage('required program roles to be added')
		},
		removeEntitiesInScope: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required program id')
				.isMongoId()
				.withMessage('Invalid program ID')
			req.checkBody('entities').exists().withMessage('required entities to be added')
		},
		join: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required program id')
				.isMongoId()
				.withMessage('Invalid program ID')
			// req.checkBody("userRoleInformation").exists().withMessage("required userRoleInformation to be added");
		},
		details: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required program id')
				.isMongoId()
				.withMessage('Invalid program ID')
		},
		getProgramDetails: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required program id')
				.isMongoId()
				.withMessage('Invalid program ID')
		},
	}

	if (programsValidator[req.params.method]) {
		programsValidator[req.params.method]()
	}
}

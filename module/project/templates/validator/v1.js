/**
 * name : v1.js
 * author : Aman
 * created-date : 31-July-2020
 * Description : Projects templates validation.
 */

module.exports = (req) => {
	let projectTemplateValidator = {
		importProjectTemplate: function () {
			req.checkParams('_id').exists().withMessage('required project template id')
			// req.checkQuery('solutionId').exists().withMessage("required solution id");
		},
		update: function () {
			// Check if metaInformation exists before validating duration
			if (req.body.metaInformation && req.body.metaInformation.duration) {
				req.checkBody('metaInformation.duration')
					.custom((value) => isValidDurationFormat(value))
					.withMessage(
						'Invalid duration format. Expected format: {number} {unit} (e.g., "2 weeks", "1 month")'
					)
			}
		},
		createChildProjectTemplate: function () {
			req.checkQuery('programExternalId').exists().withMessage('required programExternalId')
			req.checkBody('projectTemplateExternalIds')
				.exists()
				.withMessage('required projectTemplateExternalIds')
				.isArray()
				.withMessage('projectTemplateExternalIds must be an array')
				.notEmpty()
				.withMessage('projectTemplateExternalIds cannot be empty')
		},
	}

	if (projectTemplateValidator[req.params.method]) {
		projectTemplateValidator[req.params.method]()
	}

	// Function to validate duration format
	function isValidDurationFormat(duration) {
		const regex = /^\d+\s(day|days|week|weeks|month|months|year|years)$/i
		return regex.test(duration)
	}
}

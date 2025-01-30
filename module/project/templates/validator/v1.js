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
			req.checkBody('metaInformation.duration')
				.exists()
				.withMessage('Duration is required')
				.custom((value) => isValidDurationFormat(value))
				.withMessage('Invalid duration format. Expected format: {number} {unit} (e.g., "2 weeks", "1 month")')
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

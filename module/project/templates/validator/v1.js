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

		publishTemplateAndTask: function () {
			req.checkBody('data').exists().withMessage('required project template data')
			req.checkBody('callBackUrl').exists().withMessage('required callback URL')
			req.checkBody('data.title').notEmpty().withMessage('title is required and cannot be empty')
			req.checkBody('data.categories').notEmpty().withMessage('categories is required and cannot be empty')
			req.checkBody('data.recommended_for').notEmpty().withMessage('recommended_for is required and cannot be empty')
			req.checkBody('data.tasks').notEmpty().withMessage('tasks is required and cannot be empty')
			req.checkBody('data.id').notEmpty().withMessage('id is required and cannot be empty')
			req.checkBody('data.user_id').notEmpty().withMessage('user_id is required and cannot be empty')
		}
	}

	if (projectTemplateValidator[req.params.method]) {
		projectTemplateValidator[req.params.method]()
	}
}

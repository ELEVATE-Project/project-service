/**
 * name : v1.js
 * author : Priyanka Pradeep
 * created-date : 24-dec-2024
 * Description : SCP.
 */

module.exports = (req) => {
	let scpValidator = {
		publishTemplateAndTasks: function () {
			req.checkBody('data').exists().withMessage('required project template data')
			req.checkBody('callBackUrl').exists().withMessage('required callback URL')
			req.checkBody('data.title').notEmpty().withMessage('title is required and cannot be empty')
			req.checkBody('data.categories').notEmpty().withMessage('categories is required and cannot be empty')
			req.checkBody('data.recommended_for')
				.notEmpty()
				.withMessage('recommended_for is required and cannot be empty')
			req.checkBody('data.tasks').notEmpty().withMessage('tasks is required and cannot be empty')
			req.checkBody('data.id').notEmpty().withMessage('id is required and cannot be empty')
			req.checkBody('data.user_id').notEmpty().withMessage('user_id is required and cannot be empty')
		},
	}

	if (scpValidator[req.params.method]) {
		scpValidator[req.params.method]()
	}
}

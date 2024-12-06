/**
 * name : v1.js
 * author : Aman
 * created-date : 25-Aug-2020
 * Description : Projects.
 */

module.exports = (req) => {
	let projectsValidator = {
		sync: function () {
			req.checkParams('_id').exists().withMessage('required project id')
			req.checkQuery('lastDownloadedAt').exists().withMessage('required last downloaded at')
		},
		tasksStatus: function () {
			req.checkParams('_id').exists().withMessage('required project id')
		},
		solutionDetails: function () {
			req.checkParams('_id').exists().withMessage('required project id')
			req.checkQuery('taskId').exists().withMessage('required task id')
		},
		add: function () {
			req.checkBody('program.name').exists().withMessage('required program name')
			// req.checkBody('program.startDate').exists().withMessage('required program start date')
			// req.checkBody('program.conversation').exists().withMessage('required program conversation')
			// req.checkBody('projects')
			// 	.exists()
			// 	.withMessage('required projects array')
			// 	.isArray()
			// 	.withMessage('projects must be an array')
		},
		share: function () {
			req.checkParams('_id').exists().withMessage('required project id')
		},
		certificateReIssue: function () {
			req.checkParams('_id').exists().withMessage('required project id')
		},
		verifyCertificate: function () {
			req.checkParams('_id').exists().withMessage('required project id')
		},
		update: function () {
			req.checkParams('_id').exists().withMessage('required project id')
		},
	}

	if (projectsValidator[req.params.method]) {
		projectsValidator[req.params.method]()
	}
}

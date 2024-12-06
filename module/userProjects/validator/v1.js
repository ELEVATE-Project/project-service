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
			req.checkBody('title').exists().withMessage('required project title')
		},
		addStory: function () {
			req.checkParams('_id').exists().withMessage('required project id')
			req.checkBody('story')
				.exists()
				.withMessage('Story key is required')
				.custom((value) => {
					if (typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length === 0) {
						throw new Error('Story key should not be an empty object')
					}
					return true
				})
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
	}

	if (projectsValidator[req.params.method]) {
		projectsValidator[req.params.method]()
	}
}

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
			// Throw error if entityId is passed in the body
			if (req.body && req.body.entityId !== undefined) {
				req.checkBody('entityId').custom(() => {
					throw new Error('entityId is not allowed in this request')
				})
			}
			// Throw error if entityInformation is passed in the body
			if (req.body && req.body.entityInformation !== undefined) {
				req.checkBody('entityInformation').custom(() => {
					throw new Error('entityInformation is not allowed in this request')
				})
			}
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
			req.checkBody('program.source')
				.exists()
				.withMessage('required program source')
				.custom((source) => {
					// Check if 'source' exists and is a non-empty object
					if (typeof source !== 'object' || source === null || !(Object.keys(source).length > 0)) {
						return false
					}
					return true
				})
				.withMessage('program source cannot be null or empty')
			req.checkBody('projects')
				.isArray()
				.withMessage('projects must be an array')
				.custom((projects) => {
					if (!projects || !Array.isArray(projects)) {
						return false // 'projects' is not an array
					}

					// Validate each project
					return projects.every((project) => {
						// Validate that the project has a 'source'
						if (!project.hasOwnProperty('source')) {
							return false
						}

						if (!(Object.keys(project['source']).length > 0)) {
							return false
						}

						// Validate 'tasks' if it exists
						if (project.tasks) {
							// Ensure 'tasks' is an array
							if (!Array.isArray(project.tasks)) {
								return false // 'tasks' exists but is not an array
							}

							// Ensure each task has a 'source'
							return project.tasks.every((task) => task.hasOwnProperty('source'))
						}

						// No 'tasks', just validate 'source'
						return true
					})
				})
				.withMessage('each project and each task in the project must have a source, and tasks must be an array')

			// req.checkBody('program.startDate').exists().withMessage('required program start date')
			// req.checkBody('program.conversation').exists().withMessage('required program conversation')
			// req.checkBody('projects')
			// 	.exists()
			// 	.withMessage('required projects array')
			// 	.isArray()
			// 	.withMessage('projects must be an array')
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
		update: function () {
			req.checkParams('_id').exists().withMessage('required project id')
			// Throw error if entityId is passed in the body
			if (req.body && req.body.entityId !== undefined) {
				req.checkBody('entityId').custom(() => {
					throw new Error('entityId is not allowed in this request')
				})
			}
			// Throw error if entityInformation is passed in the body
			if (req.body && req.body.entityInformation !== undefined) {
				req.checkBody('entityInformation').custom(() => {
					throw new Error('entityInformation is not allowed in this request')
				})
			}
		},
		deleteUserPIIData: function () {
			req.checkBody('id').exists().withMessage('required id of the user')
		},
		pushSubmissionToTask: function () {
			req.checkParams('_id').exists().withMessage('required project id'),
				req.checkQuery('taskId').exists().withMessage('required task id')
		},
	}

	if (projectsValidator[req.params.method]) {
		projectsValidator[req.params.method]()
	}
}

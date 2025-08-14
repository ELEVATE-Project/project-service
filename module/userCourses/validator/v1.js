module.exports = (req) => {
	let userCoursesValidator = {
		createOrUpdate: function () {
			req.checkBody('status').exists().withMessage('required status')
			req.checkBody('entityId').exists().withMessage('required solutionId')
		},
	}
	if (userCoursesValidator[req.params.method]) userCoursesValidator[req.params.method]()
}

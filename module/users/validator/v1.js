module.exports = (req) => {
	let userValidator = {
		solutions: function () {
			req.checkParams('_id').exists().withMessage('required Program id')
		},
		programs: function () {
			req.checkParams('isAPrivateProgram').exists().withMessage('required isAPrivateProgram')
		},
	}

	if (userValidator[req.params.method]) {
		userValidator[req.params.method]()
	}
}

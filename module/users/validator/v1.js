module.exports = (req) => {
	let userValidator = {
		solutions: function () {
			req.checkParams('_id').exists().withMessage('required Program id')
		},
	}

	if (userValidator[req.params.method]) {
		userValidator[req.params.method]()
	}
}

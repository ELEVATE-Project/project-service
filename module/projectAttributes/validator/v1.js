/**
 * name : v1.js
 * author : PraveenDass
 * created-date : 26-Nov-2024
 * Description : Projects Attributes validation.
 */

module.exports = (req) => {
	let projectsAttributesValidator = {
		update: function () {
			req.checkQuery('code').exists().withMessage('required code')
		},
	}

	if (projectsAttributesValidator[req.params.method]) {
		projectsAttributesValidator[req.params.method]()
	}
}

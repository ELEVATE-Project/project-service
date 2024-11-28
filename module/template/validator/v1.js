/**
 * name : v1.js
 * author : Saish
 * created-date : 28-Nov-2024
 * Description : template validations
 */

module.exports = (req) => {
	let templateValidator = {
		list: function () {},
	}

	if (templateValidator[req.params.method]) {
		templateValidator[req.params.method]()
	}
}

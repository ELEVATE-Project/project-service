/**
 * name : v1.js
 * author : Aman
 * created-date : 05-Aug-2020
 * Description : Projects categories validation.
 */

module.exports = (req) => {
	let projectsValidator = {
		create: function () {
			req.checkBody('externalId').exists().withMessage('externalId is required')
			req.checkBody('name').exists().withMessage('name is required')
		},
		update: function () {
			req.checkParams('_id').exists().withMessage('required category id')
		},
		projects: function () {
			req.checkParams('_id').exists().withMessage('required category external id')
		},
	}

	if (projectsValidator[req.params.method]) {
		projectsValidator[req.params.method]()
	}
}

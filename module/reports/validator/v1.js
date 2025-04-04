/**
 * name : v1.js
 * author : Rakesh
 * created-date : 01-Nov-2020
 * Description : Report.
 */

module.exports = (req) => {
	let reportsValidator = {
		entity: function () {
			req.checkQuery('reportType').exists().withMessage('required report type')
		},
		detailView: function () {
			req.checkQuery('reportType').exists().withMessage('required report type')
		},
	}

	if (reportsValidator[req.params.method]) {
		reportsValidator[req.params.method]()
	}
}

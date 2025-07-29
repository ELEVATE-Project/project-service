module.exports = (req) => {
	let entityValidator = {
		bulkUpload: function () {
			if (!req.files || !req.files.userRoles) {
				req.checkBody('userRoles', 'CSV file (userRoles) is required').custom(() => false)
			}
		},
	}

	if (entityValidator[req.params.method]) entityValidator[req.params.method]()
}

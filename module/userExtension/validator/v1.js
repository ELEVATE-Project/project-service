module.exports = (req) => {
	let entityValidator = {
		bulkUpload: function () {
			if (!req.files || !req.files.userRoles) {
				req.checkBody('userRoles', 'CSV file (userRoles) is required').custom(() => false)
			}
		},

		update: function () {
			// Check that data array exists and is an array
			req.checkBody('data', 'data is required and should be an array').custom(
				(data) => Array.isArray(data) && data.length > 0
			)

			if (Array.isArray(req.body.data)) {
				req.body.data.forEach((item, index) => {
					// userId required and should be number
					req.checkBody(`data[${index}].userId`).exists().withMessage('required userId')

					// programId required and should be Mongo ObjectId like
					req.checkBody(`data[${index}].programId`)
						.exists()
						.withMessage('required programId')
						.isMongoId()
						.withMessage('programId should be a valid mongoId')

					// operation required and should be either append or remove
					req.checkBody(`data[${index}].operation`)
						.exists()
						.withMessage('required operation')
						.isIn(['append', 'remove'])
						.withMessage('operation value is invalid')

					// roles required and should be a non-empty array of strings
					req.checkBody(`data[${index}].roles`)
						.exists()
						.custom((roles) => Array.isArray(roles) && roles.length > 0)
						.withMessage('roles is required and should be an array')

					// optionally check each role is string
					if (Array.isArray(item.roles)) {
						item.roles.forEach((role, roleIndex) => {
							req.checkBody(`data[${index}].roles[${roleIndex}]`, 'each role must be a string').isString()
						})
					}
				})
			}
		},
	}

	if (entityValidator[req.params.method]) entityValidator[req.params.method]()
}

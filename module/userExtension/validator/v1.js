module.exports = (req) => {
	let entityValidator = {
		bulkUpload: function () {},
	}

	if (entityValidator[req.params.method]) entityValidator[req.params.method]()
}

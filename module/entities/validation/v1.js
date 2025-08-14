/**
 * name : v1.js
 * author : prajwal
 * created-date : 09-Aug-2025
 * Description : Entities validation.
 */

module.exports = (req) => {
	let entitiesValidator = {
		addEntity: function () {
			// Validate path param: id
			req.checkParams('_id')
				.exists()
				.withMessage('projectId is required in path params')
				.isMongoId()
				.withMessage('projectId must be a valid MongoDB ObjectId')

			// Validate body param: entityId
			req.checkBody('entityId')
				.exists()
				.withMessage('entityId is required in request body')
				.isMongoId()
				.withMessage('entityId must be a valid MongoDB ObjectId')
		},
	}

	if (entitiesValidator[req.params.method]) {
		entitiesValidator[req.params.method]()
	}
}

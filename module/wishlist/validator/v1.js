/**
 * name : v1.js
 * author : PraveenDass
 * created-date : 27-Nov-2024
 * Description : wishlist validation.
 */

module.exports = (req) => {
	let wishlistValidator = {
		add: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required projectTemplete Id')
				.isMongoId()
				.withMessage('Invalid projectTemplete ID')
		},
		remove: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('required projectTemplete Id')
				.isMongoId()
				.withMessage('Invalid projectTemplete ID')
		},
	}

	if (wishlistValidator[req.params.method]) {
		wishlistValidator[req.params.method]()
	}
}

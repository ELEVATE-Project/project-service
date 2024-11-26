/**
 * name : user-extension.js.
 * author : PraveenDass
 * created-date : 26-Nov-2024.
 * Description : Schema for userExtension.
 */

module.exports = {
	name: 'userExtension',
	schema: {
		userId: {
			type: String,
			required: true,
		},
		wishlist: {
			type: Array,
			default: [],
		},
	},
}

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
			index: true,
			unique: true,
		},
		wishlist: [
			{
				_id: {
					type: String,
				},
				createdAt: {
					type: Date,
				},
			},
		],
	},
}

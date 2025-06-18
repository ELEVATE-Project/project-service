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
				title: String,
				description: String,
				referenceFrom: String,
				metaInformation: Object,
				createdAt: {
					type: Date,
				},
			},
		],
		tenantId: {
			type: String,
			index: true,
			required: true,
		},
		orgIds: {
			type: Array,
			required: true,
			index: true,
		},
	},
	compoundIndex: [
		{
			name: { userId: 1, tenantId: 1 },
			indexType: { unique: true },
		},
	],
}

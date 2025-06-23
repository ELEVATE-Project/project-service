/**
 * name : user-extension.js.
 * author : PraveenDass
 * created-date : 26-Nov-2024.
 * Description : Schema for userExtension.
 */

module.exports = {
	name: 'userExtension',
	schema: {
		externalId: {
			type: String,
			required: true,
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
		userId: {
			type: String,
			required: true,
			index: true,
		},
		createdBy: {
			type: String,
			required: true,
		},
		updatedBy: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			default: 'active',
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		programRoleMapping: Array,
		orgIds: {
			type: Array,
			require: true,
			index: true,
		},
		tenantId: {
			type: String,
			require: true,
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

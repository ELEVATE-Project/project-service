module.exports = {
	name: 'organizationExtension',
	schema: {
		orgId: {
			type: String,
			required: true,
			index: true,
		},
		projectResourceVisibilityPolicy: {
			type: String,
			index: true,
			default: 'CURRENT',
		},
		externalProjectResourceVisibilityPolicy: {
			type: String,
			index: true,
			default: 'CURRENT',
		},
		createdBy: {
			type: String,
			default: 'SYSTEM',
		},
		updatedBy: {
			type: String,
			default: 'SYSTEM',
		},
		tenantId: {
			type: String,
			index: true,
			required: true,
		},
	},
	compoundIndex: [
		{
			name: { orgId: 1, tenantId: 1 },
			indexType: { unique: true },
		},
	],
}

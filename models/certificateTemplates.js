module.exports = {
	name: 'certificateTemplates',
	schema: {
		templateUrl: String,
		issuer: {
			type: Object,
			required: true,
		},
		status: {
			type: String,
			required: true,
			default: 'ACTIVE',
		},
		solutionId: {
			type: 'ObjectId',
			unique: true,
		},
		programId: {
			type: 'ObjectId',
			required: true,
		},
		criteria: {
			type: Object,
			required: true,
		},
		baseTemplateId: 'ObjectId',
		tenantId: {
			type: String,
			index: true,
			required: true,
		},
		orgIds: {
			type: Array,
			index: true,
			required: true,
		},
	},
}

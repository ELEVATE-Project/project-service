module.exports = {
	name: 'userCourses',
	schema: {
		status: {
			type: String,
			index: true,
		},
		userId: String,
		completedAt: Date,
		updatedAt: Date,
		solutionId: {
			type: 'ObjectId',
			index: true,
			required: true,
		},
		orgId: {
			type: String,
			require: true,
			index: true,
		},
		tenantId: {
			type: String,
			require: true,
			index: true,
		},
		programId: {
			type: 'ObjectId',
			index: true,
		},
		programExternalId: {
			type: String,
			index: true,
		},
		solutionInformation: {
			type: Object,
			default: {},
		},
		userProfile: Object,
		isDeleted: {
			default: false,
			type: Boolean,
			index: true,
		},
	},
	compoundIndex: [
		{
			name: { solutionId: 1, userId: 1 },
			indexType: { unique: true, partialFilterExpression: { solutionId: { $exists: true } } },
		},
	],
}

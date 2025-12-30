/**
 * name : programs-model.js.
 * author : Vishnu.
 * created-date : 09-Mar-2022.
 * Description : Schema for programs.
 */
module.exports = {
	name: 'programs',
	schema: {
		externalId: String,
		name: String,
		description: String,
		owner: String,
		createdBy: String,
		updatedBy: String,
		status: {
			type: String,
			index: true,
		},
		resourceType: [String],
		language: [String],
		keywords: [String],
		concepts: ['json'],
		imageCompression: {},
		components: ['json'],
		isAPrivateProgram: {
			default: false,
			type: Boolean,
		},
		scope: {
			type: Object,
			default: {},
		},
		isDeleted: {
			default: false,
			type: Boolean,
			index: true,
		},
		requestForPIIConsent: {
			type: Boolean,
			default: true,
		},
		metaInformation: Object,
		rootOrganisations: {
			type: Array,
			require: true,
		},
		createdFor: Array,
		startDate: {
			type: Date,
			index: true,
			require: true,
		},
		endDate: {
			type: Date,
			index: true,
			require: true,
		},
		translations: Object,
		source: {
			type: Object,
			default: {},
		},
		tenantId: {
			type: String,
			required: true,
			index: true,
		},
		orgId: {
			type: String,
			index: true,
			required: true,
		},
	},
	compoundIndex: [
		{
			name: { externalId: 1, tenantId: 1 },
			indexType: { unique: true },
		},
	],
}

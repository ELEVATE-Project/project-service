/**
 * name : project-categories.js.
 * author : Aman Karki.
 * created-date : 14-July-2020.
 * Description : Schema for project categories.
 */

module.exports = {
	name: 'projectCategories',
	schema: {
		externalId: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		createdBy: {
			type: String,
			default: 'SYSTEM',
		},
		updatedBy: {
			type: String,
			default: 'SYSTEM',
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		isVisible: {
			type: Boolean,
			default: true,
		},
		status: {
			type: String,
			default: 'active',
		},
		icon: {
			type: String,
			default: '',
		},
		noOfProjects: {
			type: Number,
			default: 0,
		},
		translations: Object,
		evidences: {
			type: Array,
			default: [],
		},
		tenantId: {
			type: String,
			index: true,
			required: true,
			default: 'default_code',
		},
		orgId: {
			type: String,
			index: true,
			required: true,
			default: 'default',
		},
		visibleToOrganizations: {
			type: Array,
			default: [],
			index: true,
		},
		description: {
			type: String,
			index: true,
			required: true,
			default: 'default',
		},
		keywords: {
			type: Array,
			default: [],
			index: true,
		},
		parentId: {
			type: 'ObjectId',
			default: null,
			index: true, // CRITICAL for hierarchy queries
		},
		hasChildCategories: {
			type: Boolean,
			default: false,
			index: true, // Quick leaf identification
		},
		sequenceNumber: {
			type: Number,
			default: 0,
			index: true,
		},
	},
	compoundIndex: [
		{
			name: { externalId: 1, tenantId: 1 },
			indexType: { unique: true },
		},
		{
			name: { parent_id: 1, tenantId: 1, sequenceNumber: 1 },
		},
		{
			name: { tenantId: 1, hasChildCategories: 1 },
		},
	],
}

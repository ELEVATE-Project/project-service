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
		},
		orgId: {
			type: Array,
		},
	},
	compoundIndex: [
		{
			name: { externalId: 1, name: 1, tenantId: 1 },
			indexType: { unique: true },
		},
	],
}

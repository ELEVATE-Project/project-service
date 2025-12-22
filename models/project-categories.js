/**
 * name : project-categories.js.
 * author : Aman Karki.
 * created-date : 14-July-2020.
 * Description : Schema for project categories with hierarchical support.
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
			maxlength: 100,
		},
		createdBy: {
			type: String,
			default: 'SYSTEM',
		},
		updatedBy: {
			type: String,
			default: 'SYSTEM',
		},
		// ========== HIERARCHY FIELDS ==========
		parent_id: {
			type: 'ObjectId',
			ref: 'projectCategories',
			default: null,
			index: true, // CRITICAL for hierarchy queries
		},
		level: {
			type: Number,
			default: 0,
			min: 0,
			max: 3, // Enforce max depth via config
			index: true,
		},
		path: {
			type: String, // Materialized path: "root_id/parent_id/self_id"
			default: '',
			index: true, // IMPORTANT: Enables efficient subtree queries
		},
		pathArray: {
			type: Array, // [root_id, parent_id, self_id]
			default: [],
		},
		hasChildren: {
			type: Boolean,
			default: false,
			index: true, // Quick leaf identification
		},
		childCount: {
			type: Number,
			default: 0,
		},
		children: {
			type: Array,
			default: [],
		},
		sequenceNumber: {
			type: Number,
			default: 0,
			index: true,
		},
		// ==========================================
		isDeleted: {
			type: Boolean,
			default: false,
			index: true,
		},
		isVisible: {
			type: Boolean,
			default: true,
		},
		status: {
			type: String,
			enum: ['active', 'inactive', 'archived'],
			default: 'active',
			index: true,
		},
		// icon moved under `metadata.icon` to keep category metadata together
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
		metadata: {
			type: Object,
			default: {
				icon: '',
			},
		},
	},
	compoundIndex: [
		{
			name: { externalId: 1, tenantId: 1 },
			indexType: { unique: true },
		},
		{
			name: { parent_id: 1, tenantId: 1, orgId: 1, sequenceNumber: 1 },
			indexType: {}, // For fetching sorted children
		},
		{
			name: { level: 1, tenantId: 1, isDeleted: 1, isVisible: 1, hasChildren: 1 },
			indexType: {}, // For fetching by level
		},
		{
			name: { path: 1, tenantId: 1 },
			indexType: {}, // For subtree queries
		},
	],
}

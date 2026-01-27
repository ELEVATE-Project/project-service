/**
 * Hierarchy Schema
 * Stores the management chain (who reports to whom)
 */
const hierarchySchema = {
	level: {
		type: Number,
		required: true,
		min: 0,
		description: "0 = direct manager, 1 = manager's manager, etc.",
	},
	id: {
		type: String,
		required: true,
		description: 'User ID of the manager (LC, Supervisor, etc.)',
	},
}

module.exports = {
	name: 'programUsers',
	schema: {
		// ============================================
		// CORE IDENTIFIERS
		// ============================================
		userId: {
			type: String,
			required: true,
			index: true,
			description: 'User ID',
		},
		programId: {
			type: String,
			required: true,
			index: true,
			description: 'Program ID',
		},
		programExternalId: {
			type: String,
			required: true,
			description: 'Human-readable external program identifier',
		},

		// ============================================
		// HIERARCHY & RELATIONSHIPS
		// ============================================
		hierarchy: {
			type: [hierarchySchema],
			default: [],
			description: "Management hierarchy (level 0 = direct manager, level 1 = manager's manager, etc.)",
		},

		// ============================================
		// OVERVIEW (FOR LC ONLY)
		// ============================================
		overview: {
			type: Object,
			default: () => ({}),
			description: 'Summary statistics (used only for LC programs, empty object for participants)',
		},

		// ============================================
		// ENTITIES (FOR LC ONLY - MATERIALIZED VIEW)
		// ============================================
		entities: {
			type: [Object],
			default: [],
			description: 'List of entities (participants) a user is managing',
		},

		// ============================================
		// METADATA & REFERENCES
		// ============================================
		referenceFrom: {
			type: Object,
			description: 'Reference to parent/global program (for participants only)',
		},

		metaInformation: {
			type: Object,
			default: () => ({}),
			description: 'Additional context and timeline data',
		},

		// ============================================
		// keywords (OPTIONAL - FOR FILTERING/SEARCH)
		// ============================================
		keywords: {
			type: [String],
			default: [],
			description: 'Optional tags for categorization and search',
		},

		// ============================================
		// STATUS
		// ============================================
		status: {
			type: String,
			required: true,
			enum: [
				// For LC/Supervisor
				'ACTIVE',
				'INACTIVE',
				// For Participant
				'NOT_ONBOARDED',
				'ONBOARDED',
				'IN_PROGRESS',
				'COMPLETED',
				'GRADUATED',
				'DROPPED_OUT',
			],
			index: true,
			description: 'Current status of program user',
			default: 'ACTIVE',
		},
		tenantId: {
			type: String,
			index: true,
			required: true,
		},
		orgId: {
			type: String,
			index: true,
			required: true,
		},
		// ============================================
		// AUDIT FIELDS
		// ============================================
		createdBy: {
			type: String,
			required: true,
			description: 'User ID who created this entry',
		},
		updatedBy: {
			type: String,
			required: true,
			description: 'User ID who last updated this entry',
		},
	},
	compoundIndex: [
		{
			name: { userId: 1, programId: 1 },
			indexType: { unique: true },
		},
		{
			name: { programId: 1, status: 1 },
		},
		{
			name: { 'hierarchy.id': 1 },
		},
	],
}

/**
 * name : programUsers.js
 * author : Ankit Shahu
 * created-date : 9-Jan-2023
 * Description : Program users schema with status tracking and hierarchical metadata
 */

module.exports = {
	name: 'programUsers',
	schema: {
		programId: {
			type: 'ObjectId',
			required: true,
			index: true,
		},
		userId: {
			type: String,
			index: true,
			required: true,
		},
		resourcesStarted: {
			type: Boolean,
			index: true,
			default: false,
		},
		userProfile: {
			type: Object,
			required: true,
		},
		userRoleInformation: Object,
		appInformation: Object,
		consentShared: {
			type: Boolean,
			default: false,
		},
		metadata: {
			type: Object,
			default: {},
		},
		// User status in the program
		status: {
			type: String,
			enum: ['NOT_ONBOARDED', 'ONBOARDED', 'IN_PROGRESS', 'COMPLETED', 'GRADUATED', 'DROPPED_OUT'],
			default: 'NOT_ONBOARDED',
			index: true,
		},

		// Previous status for tracking status transitions
		prevStatus: {
			type: String,
			default: null,
		},

		// Reason for status change (e.g., dropout reason)
		statusReason: {
			type: String,
			default: null,
		},

		// Created by user ID
		createdBy: {
			type: String,
			required: true,
			index: true,
		},

		// Updated by user ID
		updatedBy: {
			type: String,
			required: true,
			index: true,
		},

		// Tenant ID for multi-tenancy
		tenantId: {
			type: String,
			required: true,
			index: true,
		},

		// Organization ID
		orgId: {
			type: String,
			required: true,
			index: true,
		},
	},

	compoundIndex: [
		// Unique constraint on userId + programId combination
		{
			name: { userId: 1, programId: 1 },
			indexType: { unique: true },
		},
		// For filtering by program and status
		{
			name: { programId: 1, status: 1 },
			indexType: {},
		},
		// For filtering by tenant and org
		{
			name: { tenantId: 1, orgId: 1 },
			indexType: {},
		},
		// For filtering by tenant, org and program
		{
			name: { tenantId: 1, orgId: 1, programId: 1 },
			indexType: {},
		},
		// For filtering by createdBy
		{
			name: { createdBy: 1, programId: 1 },
			indexType: {},
		},
		// For filtering by userId and status
		{
			name: { userId: 1, status: 1 },
			indexType: {},
		},
	],
}

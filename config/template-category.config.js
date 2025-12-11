/**
 * Template-Category Sync Configuration
 * Controls denormalization and sync strategies
 * Author: Implementation Team
 * Description: Configuration for template-category synchronization
 */

module.exports = {
	templateCategoryRules: {
		allowMultipleCategories: true,
		leafCategoriesOnly: true, // Templates only assigned to leaf nodes
		maxCategoriesPerTemplate: 5,
	},

	denormalization: {
		syncStrategy: 'BACKGROUND_JOB', // IMMEDIATE | BACKGROUND_JOB | LAZY
		backgroundJobInterval: 3600000, // 1 hour in milliseconds
		syncOnCategoryUpdate: true,
		syncImmediatelyOn: ['name', 'externalId'],
		lazyRefreshOnRead: true,
		maxStalenessHours: 48,
	},

	queryDefaults: {
		mode: 'OR', // OR | AND | PATH
		includeInherited: false,
	},
}

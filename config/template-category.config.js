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

	queryDefaults: {
		mode: 'OR', // OR | AND | PATH
		includeInherited: false,
	},
}

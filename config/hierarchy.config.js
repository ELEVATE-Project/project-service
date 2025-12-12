module.exports = {
	maxHierarchyDepth: 3, // Maximum levels allowed (0 = root, 1 = level 1, etc.)

	pagination: {
		defaultLimit: 20,
		maxLimit: 100,
	},

	caching: {
		enabled: true,
		provider: 'redis',
		hierarchyTTL: 3600, // 1 hour for full tree
		categoryTTL: 1800, // 30 minutes for individual categories
		templatesTTL: 600, // 10 minutes for template lists
	},

	validation: {
		maxNameLength: 100,
		allowDuplicateNames: false, // Within same parent
	},

	features: {
		softDelete: true,
		auditTrail: true,
		bulkOperations: true,
	},
}

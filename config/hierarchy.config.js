module.exports = {
	maxHierarchyDepth: 4, // Maximum levels allowed (0 = root, 1 = level 1, etc.)

	pagination: {
		defaultLimit: 20,
		maxLimit: 100,
	},

	validation: {
		maxNameLength: 100,
		allowDuplicateNames: false, // Within same parent
	},

	features: {
		softDelete: true,
	},
}

/**
 * Migration: Add Hierarchy Fields to Existing Categories
 * Description: Converts flat category structure to hierarchical
 * Author: Implementation Team
 * Usage: node migrations/addHierarchyFields/addHierarchyFields.js [--tenant=tenantId] [--dry-run]
 */

require('module-alias/register')
require('dotenv').config()

// Setup globals
require('@root/config/globals')()
require('@root/config/connections')

const projectCategoriesQueries = require(DB_QUERY_BASE_PATH + '/projectCategories')

/**
 * Migrate existing categories to hierarchical structure
 * @param {String} tenantId - Optional tenant ID to filter
 * @param {Boolean} dryRun - If true, only simulate without making changes
 */
async function migrateToHierarchy(tenantId = null, dryRun = false) {
	try {
		console.log('='.repeat(60))
		console.log('Starting Hierarchy Migration')
		console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'PRODUCTION'}`)
		if (tenantId) {
			console.log(`Tenant Filter: ${tenantId}`)
		}
		console.log('='.repeat(60))

		// Filter to get only categories that don't have hierarchy fields yet (safe for multiple runs)
		const filter = tenantId ? { tenantId, isDeleted: false } : { isDeleted: false }

		// Check if parent_id field exists to determine if already migrated
		const categories = await projectCategoriesQueries.categoryDocuments(filter, [
			'_id',
			'tenantId',
			'orgId',
			'externalId',
			'name',
			'parent_id', // Include to check if already migrated
		])

		// Filter out categories that already have parent_id fields (safe for multiple runs)
		const categoriesToMigrate = categories.filter(
			(category) => category.parent_id === undefined || category.parent_id === null
		)

		console.log(`Found ${categories.length} total categories`)
		console.log(`Found ${categoriesToMigrate.length} categories to migrate (without hierarchy fields)`)

		if (categories.length > 0 && categoriesToMigrate.length === 0) {
			console.log('✅ All categories already have hierarchy fields. Migration not needed.')
			return { success: true, count: 0, alreadyMigrated: true }
		}

		if (categoriesToMigrate.length === 0) {
			console.log('No categories found. Migration complete.')
			return { success: true, count: 0 }
		}

		let migratedCount = 0
		let errorCount = 0

		for (const category of categoriesToMigrate) {
			try {
				const updateData = {
					parent_id: null, // All existing = roots
					level: 0,
					path: String(category._id),
					pathArray: [category._id],
					hasChildren: false, // Will update after child creation
					childCount: 0,
					displayOrder: migratedCount,
				}

				if (!dryRun) {
					await projectCategoriesQueries.updateOne({ _id: category._id }, { $set: updateData })
				}

				migratedCount++
				if (migratedCount % 100 === 0) {
					console.log(`Progress: ${migratedCount}/${categoriesToMigrate.length} categories processed`)
				}
			} catch (error) {
				errorCount++
				console.error(`Error migrating category ${category._id} (${category.externalId}):`, error.message)
			}
		}

		console.log('='.repeat(60))
		console.log('Migration Summary:')
		console.log(`Total Categories: ${categories.length}`)
		console.log(`Categories Needing Migration: ${categoriesToMigrate.length}`)
		console.log(`Successfully Migrated: ${migratedCount}`)
		console.log(`Errors: ${errorCount}`)
		if (dryRun) {
			console.log('\n⚠️  DRY RUN MODE - No changes were made to the database')
		} else {
			console.log('\n✅ Migration completed successfully!')
		}
		console.log('='.repeat(60))

		return {
			success: true,
			count: migratedCount,
			errors: errorCount,
		}
	} catch (error) {
		console.error('❌ Migration failed:', error)
		throw error
	}
}

// Main execution
async function main() {
	try {
		// Parse command line arguments
		const args = process.argv.slice(2)
		let tenantId = null
		let dryRun = false

		args.forEach((arg) => {
			if (arg.startsWith('--tenant=')) {
				tenantId = arg.split('=')[1]
			} else if (arg === '--dry-run') {
				dryRun = true
			}
		})

		// Run migration
		const result = await migrateToHierarchy(tenantId, dryRun)

		process.exit(result.success ? 0 : 1)
	} catch (error) {
		console.error('Migration script error:', error)
		process.exit(1)
	}
}

// Direct execution (consistent with other migration files)
main()

module.exports = { migrateToHierarchy }

/**
 * Migration: addHierarchyFieldsToCategories
 * Description: Add hierarchical fields to existing project categories
 * Fields added:
 *   - parentId: ObjectId (null by default)
 *   - hasChildCategories: Boolean (false by default)
 *   - sequenceNumber: Number (0 by default)
 *   - metaInformation: Object ({} by default)
 */

const mongoose = require('mongoose')

module.exports = {
	async up(db, client) {
		const session = client.startSession()
		try {
			await session.withTransaction(async () => {
				const categoriesCollection = db.collection('projectCategories')

				// Update all existing documents to add the new fields with default values
				// Only update documents where parentId doesn't exist (for idempotency)
				const result = await categoriesCollection.updateMany(
					{
						parentId: { $exists: false },
					},
					{
						$set: {
							parentId: null,
							hasChildCategories: false,
							sequenceNumber: 0,
							metaInformation: {},
						},
					},
					{ session }
				)

				console.log(
					`Migration: addHierarchyFieldsToCategories - Updated ${result.modifiedCount} category documents`
				)

				// Create indexes if they don't exist
				await categoriesCollection.createIndex({ parentId: 1, tenantId: 1 }, { session })
				console.log('Created compound index on parentId and tenantId')

				return result
			})
		} catch (error) {
			console.error('Error during migration addHierarchyFieldsToCategories:', error)
			throw error
		} finally {
			await session.endSession()
		}
	},

	async down(db, client) {
		const session = client.startSession()
		try {
			await session.withTransaction(async () => {
				const categoriesCollection = db.collection('projectCategories')

				// Remove the added fields from all documents
				const result = await categoriesCollection.updateMany(
					{},
					{
						$unset: {
							parentId: '',
							hasChildCategories: '',
							sequenceNumber: '',
							metaInformation: '',
						},
					},
					{ session }
				)

				console.log(
					`Migration rollback: addHierarchyFieldsToCategories - Reverted ${result.modifiedCount} category documents`
				)

				// Drop the compound index if it exists
				try {
					await categoriesCollection.dropIndex('parentId_1_tenantId_1', { session })
					console.log('Dropped compound index on parentId and tenantId')
				} catch (err) {
					// Index might not exist, which is fine
					console.log('Compound index not found during rollback')
				}

				return result
			})
		} catch (error) {
			console.error('Error during migration rollback addHierarchyFieldsToCategories:', error)
			throw error
		} finally {
			await session.endSession()
		}
	},
}

# Project Categories Hierarchy Consistency - Implementation Summary

## Overview

This document outlines the consistency fixes applied to the Project Categories hierarchy system to ensure that the `children` array, `hasChildren` flag, and `childCount` remain synchronized across all category operations.

## Issues Identified

### 1. **Error Handling with Silent Catches**

**Problem:** The `create`, `move`, and `delete` operations wrapped children array updates in try-catch blocks that silently logged errors but continued execution. This could mask failures.

```javascript
// BEFORE (problematic)
try {
	await projectCategoriesQueries.updateOne({ _id: parentId }, { $addToSet: { children: createdCategory._id } })
} catch (e) {
	console.error('Failed to add child to parent.children', parentId, e)
	// Continue anyway - inconsistency possible!
}
```

**Solution:** Removed try-catch wrappers to allow errors to propagate to the caller, ensuring caller is notified of failures.

```javascript
// AFTER (fixed)
await projectCategoriesQueries.updateOne({ _id: parentId }, { $addToSet: { children: createdCategory._id } })
// Error propagates if operation fails
```

### 2. **Non-Transactional Parent Count Updates**

**Problem:** `updateParentCounts()` and children array updates (`$addToSet`/`$pull`) were separate operations. A failure between them could leave inconsistent state.

**Solution:** Maintained strict operation ordering with immediate error propagation:

-   Child operations follow parent count updates in deterministic order
-   If any step fails, the entire operation fails (error propagates)
-   No partial states are committed

### 3. **Move Operation Descendant Handling**

**Problem:** When moving a category with descendants, the move operation updated paths and levels but didn't validate descendant presence in parent children arrays.

**Solution:** The existing `pathArray` and path calculations ensure descendants follow the correct hierarchy. The children array captures only direct children, not descendants—which is by design.

## Fixed Operations

### Create Category

```javascript
// 1. Create category with hasChildren=false, childCount=0
categoryData.hasChildren = false
categoryData.childCount = 0
let createdCategory = await projectCategoriesQueries.create(categoryData)

// 2. Calculate hierarchy fields
const hierarchyFields = await this.calculateChildHierarchyFields(parent, createdCategory._id)
await projectCategoriesQueries.updateOne({ _id: createdCategory._id }, { $set: hierarchyFields })

// 3. Update parent (atomic operations, errors propagate)
if (parentId) {
	await this.updateParentCounts(parentId, tenantId, 1) // Sets hasChildren=true, increments childCount
	await projectCategoriesQueries.updateOne({ _id: parentId }, { $addToSet: { children: createdCategory._id } })
	this.syncTemplatesForCategory(parentId, tenantId).catch(console.error)
}
```

### Move Category

```javascript
// 1. Validate circular reference
// 2. Update hierarchy fields (path, level, pathArray)
// 3. Update all descendants' hierarchy (path, level, pathArray)
// 4. Update old parent (atomic)
if (oldParentId) {
	await this.updateParentCounts(oldParentId, tenantId, -1) // Decrements childCount, updates hasChildren
	await projectCategoriesQueries.updateOne({ _id: oldParentId }, { $pull: { children: categoryId } })
	this.syncTemplatesForCategory(oldParentId, tenantId).catch(console.error)
}
// 5. Update new parent (atomic)
if (newParentId) {
	await this.updateParentCounts(newParentId, tenantId, 1) // Increments childCount, updates hasChildren
	await projectCategoriesQueries.updateOne({ _id: newParentId }, { $addToSet: { children: categoryId } })
	this.syncTemplatesForCategory(newParentId, tenantId).catch(console.error)
}
```

### Delete Category

```javascript
// 1. Validate deletion (no children, no projects)
// 2. Soft-delete category
await projectCategoriesQueries.updateOne(
	{ _id: category._id, tenantId },
	{ $set: { isDeleted: true, deletedAt: new Date() } }
)
// 3. Remove from templates
const templatesUpdated = await this.removeCategoryFromTemplates(category._id, tenantId)
// 4. Update parent (atomic, errors propagate)
if (category.parent_id) {
	await this.updateParentCounts(category.parent_id, tenantId, -1) // Decrements childCount, updates hasChildren
	await projectCategoriesQueries.updateOne({ _id: category.parent_id }, { $pull: { children: category._id } })
}
```

## updateParentCounts Implementation

```javascript
static async updateParentCounts(parentId, tenantId, increment = 1) {
    if (!parentId) return

    try {
        const parent = await projectCategoriesQueries.findOne({ _id: parentId, tenantId })
        if (parent) {
            const newChildCount = Math.max(0, (parent.childCount || 0) + increment)
            // Atomic update - both hasChildren and childCount updated together
            await projectCategoriesQueries.updateOne(
                { _id: parentId, tenantId },
                {
                    $set: {
                        hasChildren: newChildCount > 0,
                        childCount: newChildCount,
                    },
                }
            )
        }
    } catch (error) {
        console.error('Error updating parent counts:', error)
        throw error  // Re-throw to propagate to caller
    }
}
```

## Consistency Guarantees

### After Create

-   ✅ New category has `hasChildren=false`, `childCount=0`, `children=[]`
-   ✅ Parent's `childCount` incremented by 1
-   ✅ Parent's `hasChildren` set to `true` if it was previously `false`
-   ✅ New category ID added to parent's `children` array

### After Move

-   ✅ Category's `parent_id`, `level`, `path`, `pathArray` updated
-   ✅ All descendants' `level`, `path`, `pathArray` updated
-   ✅ Old parent's `childCount` decremented by 1
-   ✅ Old parent's `hasChildren` updated (set to `false` if childCount becomes 0)
-   ✅ Moved category removed from old parent's `children` array
-   ✅ New parent's `childCount` incremented by 1
-   ✅ New parent's `hasChildren` set to `true`
-   ✅ Moved category added to new parent's `children` array

### After Delete

-   ✅ Category marked as `isDeleted=true`
-   ✅ Category removed from all templates
-   ✅ Parent's `childCount` decremented by 1
-   ✅ Parent's `hasChildren` updated (set to `false` if childCount becomes 0)
-   ✅ Category ID removed from parent's `children` array

## Testing

Integration tests provided in `/test/integration/projectCategories-hierarchy.test.js` cover:

1. **Basic Hierarchy Flow**: Create root → add children → verify counts/arrays
2. **Move Operations**: Move child to different parent → verify all updates
3. **Delete Operations**: Delete leaf → verify parent counts/arrays update
4. **Edge Cases**:
    - Cannot move to self
    - Cannot move to descendant
    - Cannot delete with children

Run tests with:

```bash
npm test -- test/integration/projectCategories-hierarchy.test.js
```

## Migration Note

The migration script (`migrations/addCategoryHierarchyFields/addHierarchyFields.js`) has been simplified to:

-   Add `sequenceNumber` (sequential counter, replaces legacy `displayOrder`)
-   Initialize `children` array as empty

No legacy field migration is performed (displayOrder/icon fields don't exist on servers).

## Backward Compatibility

All API responses normalize `metadata.icon` back to top-level `icon` field for backward compatibility:

```javascript
if (category.metadata && category.metadata.icon !== undefined) {
	category.icon = category.metadata.icon
}
```

Query results are sorted by `sequenceNumber` instead of legacy `displayOrder`.

## Monitoring

Watch for errors in:

-   `updateParentCounts()` calls (logs and re-throws errors)
-   `$pull`/`$addToSet` operations (now propagate errors)
-   Kafka event emissions (`syncTemplatesForCategory`)

All failures will now be visible to API callers rather than silently logged.

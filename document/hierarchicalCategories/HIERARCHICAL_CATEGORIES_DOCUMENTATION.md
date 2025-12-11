# 📁 Hierarchical Project Categories - Complete Documentation

## 🎯 Overview

This document provides comprehensive technical documentation for implementing **hierarchical categories** in the BRAC project. This feature transforms the flat category structure into a multi-level hierarchy with parent-child relationships, ensuring backward compatibility while introducing efficient tree traversal capabilities.

### Key Features

-   ✅ **Multi-level Hierarchy**: Configurable depth (default: 3 levels).
-   ✅ **Materialized Path**: Optimized for efficient subtree queries.
-   ✅ **Backward Compatibility**: Fully compatible with existing API clients.
-   ✅ **API Aliases**: Supports both concise `/api/categories/*` and traditional `/project/v1/projectCategories/*` routes.
-   ✅ **Data Integrity**: cascading deletes, cycle detection, and strict validation.

---

## 🔄 Endpoint Mapping & Aliases

The system supports two URL patterns for accessing category resources. You can use them interchangeably.

## 🔄 Endpoint Mapping & Aliases

The system supports multiple URL patterns to ensure backward compatibility and future-proofing.

### 1. Standard Hierarchical Endpoints (Recommended)

These are the primary routes for the new hierarchical functionality.

-   Base Path: `/project/v1/projectCategories/*`

### 2. Specification Aliases (Concise)

Shortened aliases for the standard endpoints.

-   Base Path: `/api/categories/*`

### 3. Legacy Library Endpoints (Backward Compatible)

The original endpoints are fully supported and route to the new logic. Use these for existing clients.

-   Base Path: `/project/v1/library/categories/*`

| Action          | Specification Alias                  | Standard Internal Route                           | Legacy Library Route                             |
| --------------- | ------------------------------------ | ------------------------------------------------- | ------------------------------------------------ |
| **List**        | `GET /api/categories/list`           | `GET /project/v1/projectCategories/list`          | `GET /project/v1/library/categories/list`        |
| **Create**      | `POST /api/categories`               | `POST /project/v1/projectCategories/create`       | `POST /project/v1/library/categories/create`     |
| **Update**      | `PATCH /api/categories/:id`          | `PATCH /project/v1/projectCategories/update/:id`  | `POST /project/v1/library/categories/update/:id` |
| **Hierarchy**   | `GET /api/categories/hierarchy`      | `GET /project/v1/projectCategories/hierarchy`     | -                                                |
| **Move**        | `PATCH /api/categories/:id/move`     | `PATCH /project/v1/projectCategories/move/:id`    | -                                                |
| **Delete**      | `DELETE /api/categories/:id`         | `DELETE /project/v1/projectCategories/delete/:id` | -                                                |
| **Leaves**      | `GET /api/categories/leaves`         | `GET /project/v1/projectCategories/leaves`        | -                                                |
| **Can Delete**  | `GET /api/categories/:id/can-delete` | `GET /project/v1/projectCategories/canDelete/:id` | -                                                |
| **Bulk Create** | `POST /api/categories/bulk`          | `POST /project/v1/projectCategories/bulk`         | -                                                |

> **Note**: Legacy `update` uses `POST` method in some clients, while new endpoints use `PATCH`. Both are supported on the legacy route if implemented, but strictly `PATCH` on new routes is recommended.

---

## 🚀 API Reference

### 1. Get Complete Hierarchy

Retrieves the full category tree structure.

**Request:**

```http
GET /api/categories/hierarchy
Headers:
  X-auth-token: <user-token>
  tenantId: <tenant-id>
  orgId: <org-id>
```

**Response:**

```json
{
	"message": "Category hierarchy fetched successfully",
	"result": {
		"tree": [
			{
				"_id": "64f1...",
				"name": "Agriculture",
				"level": 0,
				"children": [
					{
						"_id": "64f2...",
						"name": "Crops",
						"level": 1,
						"children": []
					}
				]
			}
		]
	}
}
```

### 2. Create Category

**Request:**

```http
POST /api/categories
Content-Type: application/json

{
  "externalId": "cat-irrigation",
  "name": "Irrigation",
  "parentId": "64f1...",
  "displayOrder": 1
}
```

_Note: Omit `parentId` to create a root category._

### 3. Move Category

Moves a category and its entire subtree to a new parent.

**Request:**

```http
PATCH /api/categories/:id/move
Content-Type: application/json

{
  "newParentId": "64f5..."
}
```

_Warning: This requires expensive path recalculation for all descendants._

### 4. Delete Category

Deletes a category and all its descendants.

**Request:**

```http
DELETE /api/categories/:id
```

_Note: Fails if templates are attached to any deleted category._

---

## 📊 Database Schema Changes

### `projectCategories` Model

**Location:** `models/project-categories.js`

| Field         | Type            | Description                                             |
| ------------- | --------------- | ------------------------------------------------------- |
| `parent_id`   | ObjectId        | Reference to parent category (null for root)            |
| `level`       | Number          | Depth in hierarchy (0 = root)                           |
| `path`        | String          | Materialized path (e.g., "rootId/childId/grandchildId") |
| `pathArray`   | Array<ObjectId> | Array of ancestor IDs for easy filtering                |
| `hasChildren` | Boolean         | Optimization flag for leaf detection                    |
| `childCount`  | Number          | Number of direct children                               |

---

## ⚙️ Configuration

**Location:** `config/hierarchy.config.js`

```javascript
module.exports = {
	maxHierarchyDepth: 3, // Maximum allowed depth (0-3)
	validation: {
		maxNameLength: 100,
	},
}
```

---

## 🔄 Migration Strategy

To migrate existing flat categories to the hierarchical structure:

**Script:** `migrations/addHierarchyFields/addHierarchyFields.js`

**Commands:**

```bash
# 1. Dry Run (Recommended)
node migrations/addHierarchyFields/addHierarchyFields.js --dry-run

# 2. Production Run
node migrations/addHierarchyFields/addHierarchyFields.js
```

**Effect**: All existing categories become root categories (level 0). You can then manually move them into a hierarchy using the `move` endpoint or `bulk` operations.

---

## 📁 Module Structure

```
module/
└── projectCategories/
    ├── helper.js              # Core logic (Move, Create, Delete, Hierarchy)
controllers/
└── v1/
    ├── projectCategories.js   # Main controller
    └── library/categories.js  # Legacy controller (redirects to new helper)
models/
└── project-categories.js      # Mongoose schema
databaseQueries/
└── projectCategories.js       # Database abstraction
```

## ⚠️ Critical Implementation Notes

1.  **Circular References**: The `move` logic prevents moving a category into its own descendant.
2.  **Orphans**: `getHierarchy` gracefully handles orphan nodes (nodes whose parent is missing) by treating them as roots for display.
3.  **Data Integrity**: `delete` is cascading. Always check `can-delete` endpoint first in UI.
4.  **Legacy Support**: `module/library/categories/helper.js` has been **removed**. All legacy endpoints now route through `projectCategories/helper.js`.

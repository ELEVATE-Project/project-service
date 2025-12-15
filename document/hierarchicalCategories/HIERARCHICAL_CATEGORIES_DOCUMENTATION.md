# 📁 Hierarchical Project Categories - Complete Documentation

## 🎯 Overview

This document provides comprehensive technical documentation for implementing **hierarchical categories** in the BRAC project. This feature transforms the flat category structure into a multi-level hierarchy with parent-child relationships, ensuring backward compatibility while introducing efficient tree traversal capabilities.

### Key Features

-   ✅ **Multi-level Hierarchy**: Configurable depth (default: 3 levels).
-   ✅ **Materialized Path**: Optimized for efficient subtree queries.
-   ✅ **Backward Compatibility**: Fully compatible with existing API clients.
-   ✅ **Template Sync**: Automatic background synchronization of project templates when categories are updated or moved.
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

-   Base Path: `/categories/*`

### 3. Legacy Library Endpoints (Backward Compatible)

The original endpoints are fully supported and route to the new logic. Use these for existing clients.

-   Base Path: `/project/v1/library/categories/*`

| Action            | REST Endpoint                    | Standard Internal Route                           | Legacy Library Route                                |
| ----------------- | -------------------------------- | ------------------------------------------------- | --------------------------------------------------- |
| **List**          | `GET /categories`                | `GET /project/v1/projectCategories/list`          | `GET /project/v1/library/categories/list`           |
| **Create**        | `POST /categories`               | `POST /project/v1/projectCategories/create`       | `POST /project/v1/library/categories/create`        |
| **Get Single**    | `GET /categories/:id`            | `GET /project/v1/projectCategories/details/:id`   | `GET /project/v1/library/categories/details/:id`    |
| **Update**        | `PATCH /categories/:id`          | `PATCH /project/v1/projectCategories/update/:id`  | `POST /project/v1/library/categories/update/:id`    |
| **Delete**        | `DELETE /categories/:id`         | `DELETE /project/v1/projectCategories/delete/:id` | -                                                   |
| **Hierarchy**     | `GET /categories/hierarchy`      | `GET /project/v1/projectCategories/hierarchy`     | -                                                   |
| **Leaves**        | `GET /categories/leaves`         | `GET /project/v1/projectCategories/leaves`        | -                                                   |
| **Bulk Create**   | `POST /categories/bulk`          | `POST /project/v1/projectCategories/bulk`         | -                                                   |
| **Move**          | `PATCH /categories/:id/move`     | `PATCH /project/v1/projectCategories/move/:id`    | -                                                   |
| **Can Delete**    | `GET /categories/:id/can-delete` | `GET /project/v1/projectCategories/canDelete/:id` | -                                                   |
| **Projects**      | `GET /categories/projects/:id`   | -                                                 | `GET /project/v1/library/categories/projects/:id`   |
| **Bulk Projects** | -                                | -                                                 | `POST /project/v1/library/categories/projects/list` |

> **Note**: Legacy `update` uses `POST` method in some clients, while new endpoints use `PATCH`. Both are supported on the legacy route if implemented, but strictly `PATCH` on new routes is recommended.

---

## 🔐 Authentication & Tenant/Organization Handling

All category APIs support flexible authentication and tenant/organization identification:

### Authentication Methods

1. **User Token Authentication** (Recommended for public APIs):

    ```http
    Headers:
      X-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```

    - Token contains user details, tenant, and organization information
    - Automatically extracts `tenantCode` and `orgCode` from token payload
    - Used for user-facing applications

2. **Admin Token Authentication** (For admin/internal APIs):
    ```http
    Headers:
      internal-access-token: Fqn0m0HQ0gXydRtBCg5l
      tenantId: brac
      orgId: brac_gbl
    ```
    - Requires explicit tenant and organization headers
    - Used for administrative operations

### Tenant & Organization Extraction

The system automatically handles tenant and organization context:

-   **From User Token**: Extracts from JWT payload (`tenantCode`, `orgCode`)
-   **From Headers**: Uses `tenantId`/`tenantCode` and `orgId`/`orgCode` headers
-   **Fallback**: Uses user details from authenticated session

### Example Usage

```bash
# Using User Token (Public API)
curl --location 'http://localhost:5003/categories/list' \
--header 'X-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
--header 'Content-Type: application/json'

# Using Admin Token (Admin API)
curl --location 'http://localhost:5003/categories/list' \
--header 'internal-access-token: Fqn0m0HQ0gXydRtBCg5l' \
--header 'tenantId: brac' \
--header 'orgId: brac_gbl' \
--header 'Content-Type: application/json'
```

---

## 🚀 API Reference

### 1. List Categories (REST Standard)

Retrieves categories with optional filtering and pagination.

**Request:**

```http
GET /categories?page=1&limit=20&level=0&parentId=64f1...
Headers:
  X-auth-token: <user-token>
```

**Response:**

```json
{
	"message": "Categories fetched successfully",
	"result": [
		{
			"_id": "64f1...",
			"externalId": "agriculture",
			"name": "Agriculture",
			"level": 0,
			"hasChildren": true,
			"childCount": 3,
			"displayOrder": 1
		}
	],
	"count": 15
}
```

### 2. Get Single Category

Retrieves details of a specific category.

**Request:**

```http
GET /categories/:id
Headers:
  X-auth-token: <user-token>
```

**Response:**

```json
{
  "message": "Category fetched successfully",
  "result": {
    "_id": "64f1...",
    "externalId": "agriculture",
    "name": "Agriculture",
    "level": 0,
    "parent_id": null,
    "hasChildren": true,
    "childCount": 3,
    "displayOrder": 1,
    "evidences": [...],
    "createdAt": "2023-09-01T10:00:00Z"
  }
}
```

### 3. Get Complete Hierarchy

Retrieves the full category tree structure.

**Request:**

```http
GET /categories/hierarchy?maxDepth=3
Headers:
  X-auth-token: <user-token>
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

### 4. Create Category

**Request:**

```http
POST /categories
Content-Type: application/json
Headers:
  X-auth-token: <user-token>
  tenantId: <tenant-id>
  orgId: <org-id>

{
  "externalId": "cat-irrigation",
  "name": "Irrigation",
  "parentId": "64f1...",
  "displayOrder": 1
}
```

_Note: Omit `parentId` to create a root category._

### 5. Move Category

Moves a category and its entire subtree to a new parent.

**Request:**

```http
PATCH /categories/:id/move
Content-Type: application/json
Headers:
  X-auth-token: <user-token>
  tenantId: <tenant-id>
  orgId: <org-id>

{
  "newParentId": "64f5..."
}
```

_Warning: This requires expensive path recalculation for all descendants._

### 6. Delete Category

Deletes a category and all its descendants.

**Request:**

```http
DELETE /categories/:id
Headers:
  X-auth-token: <user-token>
  tenantId: <tenant-id>
  orgId: <org-id>
```

_Note: Fails if templates are attached to any deleted category._

### 7. Get Leaf Categories

**Request:**

```http
GET /categories/leaves
Headers:
  X-auth-token: <user-token>
```

### 8. Check if Category Can Be Deleted

**Request:**

```http
GET /categories/:id/can-delete
Headers:
  X-auth-token: <user-token>
```

**Response:**

```json
{
	"message": "Category can be deleted",
	"result": {
		"canDelete": true,
		"reason": "Category can be deleted",
		"childCount": 0,
		"templateCount": 0
	}
}
```

### 9. Bulk Create Categories

**Request:**

```http
POST /categories/bulk
Headers:
  X-auth-token: <user-token>
Content-Type: application/json

{
  "categories": [
    {
      "externalId": "crops",
      "name": "Crops",
      "parentExternalId": "agriculture"
    },
    {
      "externalId": "livestock",
      "name": "Livestock",
      "parentExternalId": "agriculture"
    }
  ]
}
```

### 10. Get Projects by Category

**Request:**

```http
GET /categories/projects/:categoryId?page=1&limit=10&search=irrigation
Headers:
  X-auth-token: <user-token>
```

**Response:**

```json
{
  "message": "Successfully fetched projects",
  "result": {
    "data": [
      {
        "_id": "64f2...",
        "title": "Smart Irrigation System",
        "description": "IoT-based irrigation management",
        "averageRating": 4.5,
        "noOfRatings": 12,
        "categories": [...]
      }
    ],
    "count": 25
  }
}
```

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

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

| Action             | REST Endpoint                    | Standard Internal Route                           | Legacy Library Route                                |
| ------------------ | -------------------------------- | ------------------------------------------------- | --------------------------------------------------- |
| **List**           | `GET /categories`                | `GET /project/v1/projectCategories/list`          | `GET /project/v1/library/categories/list`           |
| **Create**         | `POST /categories`               | `POST /project/v1/projectCategories/create`       | `POST /project/v1/library/categories/create`        |
| **Get Single**     | `GET /categories/:id`            | `GET /project/v1/projectCategories/details/:id`   | `GET /project/v1/library/categories/details/:id`    |
| **Update**         | `PATCH /categories/:id`          | `PATCH /project/v1/projectCategories/update/:id`  | `POST /project/v1/library/categories/update/:id`    |
| **Delete**         | `DELETE /categories/:id`         | `DELETE /project/v1/projectCategories/delete/:id` | -                                                   |
| **Hierarchy**      | `GET /categories/hierarchy`      | `GET /project/v1/projectCategories/hierarchy`     | -                                                   |
| **Leaves**         | `GET /categories/leaves`         | `GET /project/v1/projectCategories/leaves`        | -                                                   |
| **Bulk Create**    | `POST /categories/bulk`          | `POST /project/v1/projectCategories/bulk`         | -                                                   |
| **Move**           | `PATCH /categories/:id/move`     | `PATCH /project/v1/projectCategories/move/:id`    | -                                                   |
| **Can Delete**     | `GET /categories/:id/can-delete` | `GET /project/v1/projectCategories/canDelete/:id` | -                                                   |
| **Projects**       | `GET /categories/projects/:id`   | -                                                 | `GET /project/v1/library/categories/projects/:id`   |
| **Multi Projects** | `POST /categories/projects/list` | -                                                 | `POST /project/v1/library/categories/projects/list` |
| **Bulk Projects**  | -                                | -                                                 | `POST /project/v1/library/categories/projects/list` |

> **Note**: Legacy `update` uses `POST` method in some clients, while new endpoints use `PATCH`. Both are supported on the legacy route if implemented, but strictly `PATCH` on new routes is recommended.

---

## 🔐 Authentication & Token Requirements

All category APIs require proper authentication and tenant/organization identification.

### JWT Token Structure Requirements

The JWT token must contain the following structure in the payload:

```json
{
	"data": {
		"id": 2003,
		"name": "user name",
		"session_id": 22706,
		"organization_ids": ["33"],
		"organization_codes": ["tan90"],
		"tenant_code": "shikshalokam",
		"organizations": [
			{
				"id": 33,
				"name": "tan90",
				"code": "tan90",
				"tenant_code": "shikshalokam",
				"roles": [
					{
						"id": 23,
						"title": "mentee",
						"label": "mentee",
						"status": "ACTIVE"
					}
				]
			}
		]
	}
}
```

### Critical Token Fields

**Required for Authentication:**

-   `tenant_code`: Tenant identifier (e.g., "shikshalokam")
-   `organization_ids`: Array of organization IDs (e.g., ["33"])
-   `organizations[0].roles`: Array of user roles with title field

**Token Processing Notes:**

-   Tenant ID extracted from: `decodedToken.data.tenant_code`
-   Organization ID extracted from: `decodedToken.data.organization_ids[0]`
-   User roles extracted from: `decodedToken.data.organizations[0].roles`

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

### Authentication Header Format

**Important:** Header name must be exactly `X-auth-token` (capital X)

```bash
# Correct
curl -H "X-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Incorrect (will fail)
curl -H "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Tenant & Organization Extraction

The system automatically handles tenant and organization context:

-   **From User Token**: Extracts from JWT payload (`tenant_code`, `organization_ids[0]`)
-   **From Headers**: Uses `tenantId`/`tenantCode` and `orgId`/`orgCode` headers
-   **Fallback**: Uses user details from authenticated session

### Example Usage

```bash
# Using User Token (Public API) - Working Example
curl --location 'http://localhost:5003/categories' \
--header 'X-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoyMDAzLCJuYW1lIjoidGFuZnVuY29mZmljaWFsIHNsZGlyZWN0b3IiLCJzZXNzaW9uX2lkIjoyMjcwNiwib3JnYW5pemF0aW9uX2lkcyI6WyIzMyJdLCJvcmdhbml6YXRpb25fY29kZXMiOlsidGFuOTAiXSwidGVuYW50X2NvZGUiOiJzaGlrc2hhbG9rYW0iLCJvcmdhbml6YXRpb25zIjpbeyJpZCI6MzMsIm5hbWUiOiJ0YW45MCIsImNvZGUiOiJ0YW45MCIsImRlc2NyaXB0aW9uIjoiVGFuOTAgc3BlY2lhbGl6ZXMgaW4gcHJvdmlkaW5nIGVkdWNhdGlvbmFsIFNURUFNIiwic3RhdHVzIjoiQUNUSVZFIiwicmVsYXRlZF9vcmdzIjpbMzRdLCJ0ZW5hbnRfY29kZSI6InNoaWtzaGFsb2thbSIsIm1ldGEiOm51bGwsImNyZWF0ZWRfYnkiOjEsInVwZGF0ZWRfYnkiOjE3MDksInJvbGVzIjpbeyJpZCI6MjMsInRpdGxlIjoibWVudGVlIiwibGFiZWwiOiJtZW50ZWUiLCJ1c2VyX3R5cGUiOjAsInN0YXR1cyI6IkFDVElWRSIsIm9yZ2FuaXphdGlvbl9pZCI6MTAsInZpc2liaWxpdHkiOiJQVUJMSUMiLCJ0ZW5hbnRfY29kZSI6InNoaWtzaGFsb2thbSIsInRyYW5zbGF0aW9ucyI6bnVsbH1dfV19LCJpYXQiOjE3NjU4NjUzMDYsImV4cCI6MTc2NTk1MTcwNn0.TRuLHBD5sjkIgowCVnQC_3GgSZJnbJhpXU3rQKhfIdE'

# Using Admin Token (Admin API)
curl --location 'http://localhost:5003/categories' \
--header 'internal-access-token: Fqn0m0HQ0gXydRtBCg5l' \
--header 'tenantId: brac' \
--header 'orgId: brac_gbl' \
--header 'Content-Type: application/json'

# Test all endpoints with working token
curl --location 'http://localhost:5003/categories/hierarchy' \
--header 'X-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoyMDAzLCJuYW1lIjoidGFuZnVuY29mZmljaWFsIHNsZGlyZWN0b3IiLCJzZXNzaW9uX2lkIjoyMjcwNiwib3JnYW5pemF0aW9uX2lkcyI6WyIzMyJdLCJvcmdhbml6YXRpb25fY29kZXMiOlsidGFuOTAiXSwidGVuYW50X2NvZGUiOiJzaGlrc2hhbG9rYW0iLCJvcmdhbml6YXRpb25zIjpbeyJpZCI6MzMsIm5hbWUiOiJ0YW45MCIsImNvZGUiOiJ0YW45MCIsImRlc2NyaXB0aW9uIjoiVGFuOTAgc3BlY2lhbGl6ZXMgaW4gcHJvdmlkaW5nIGVkdWNhdGlvbmFsIFNURUFNIiwic3RhdHVzIjoiQUNUSVZFIiwicmVsYXRlZF9vcmdzIjpbMzRdLCJ0ZW5hbnRfY29kZSI6InNoaWtzaGFsb2thbSIsIm1ldGEiOm51bGwsImNyZWF0ZWRfYnkiOjEsInVwZGF0ZWRfYnkiOjE3MDksInJvbGVzIjpbeyJpZCI6MjMsInRpdGxlIjoibWVudGVlIiwibGFiZWwiOiJtZW50ZWUiLCJ1c2VyX3R5cGUiOjAsInN0YXR1cyI6IkFDVElWRSIsIm9yZ2FuaXphdGlvbl9pZCI6MTAsInZpc2liaWxpdHkiOiJQVUJMSUMiLCJ0ZW5hbnRfY29kZSI6InNoaWtzaGFsb2thbSIsInRyYW5zbGF0aW9ucyI6bnVsbH1dfV19LCJpYXQiOjE3NjU4NjUzMDYsImV4cCI6MTc2NTk1MTcwNn0.TRuLHBD5sjkIgowCVnQC_3GgSZJnbJhpXU3rQKhfIdE'
```

### Quick Test Commands

```bash
# Test basic list
curl --location 'http://localhost:5003/categories' --header 'X-auth-token: YOUR_TOKEN'

# Test hierarchy
curl --location 'http://localhost:5003/categories/hierarchy' --header 'X-auth-token: YOUR_TOKEN'

# Test leaves
curl --location 'http://localhost:5003/categories/leaves' --header 'X-auth-token: YOUR_TOKEN'

# Test projects by single category
curl --location 'http://localhost:5003/categories/projects/CATEGORY_ID' --header 'X-auth-token: YOUR_TOKEN'

# Test projects by multiple categories
curl --location 'http://localhost:5003/categories/projects/list' \
--header 'X-auth-token: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
  "categoryIds": ["64f1a2b3c4d5e6f7g8h9i0j1", "64f2b3c4d5e6f7g8h9i0j1k2"],
  "page": 1,
  "limit": 10
}'
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

### 10. Get Projects by Single Category

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

### 11. Get Projects by Multiple Categories

**Request:**

```http
POST /categories/projects/list
Headers:
  X-auth-token: <user-token>
Content-Type: application/json

{
  "categoryIds": [
    "64f1a2b3c4d5e6f7g8h9i0j1",
    "64f2b3c4d5e6f7g8h9i0j1k2",
    "64f3c4d5e6f7g8h9i0j1k2l3"
  ],
  "page": 1,
  "limit": 20,
  "search": "agriculture"
}
```

**Response:**

```json
{
	"message": "Successfully fetched projects from multiple categories",
	"result": {
		"data": [
			{
				"_id": "64f2...",
				"title": "Smart Agriculture System",
				"description": "IoT-based farming management",
				"averageRating": 4.7,
				"noOfRatings": 18,
				"categories": [
					{
						"_id": "64f1a2b3c4d5e6f7g8h9i0j1",
						"name": "Agriculture",
						"externalId": "agriculture"
					}
				]
			},
			{
				"_id": "64f3...",
				"title": "Livestock Management",
				"description": "Digital livestock tracking",
				"averageRating": 4.2,
				"noOfRatings": 9,
				"categories": [
					{
						"_id": "64f2b3c4d5e6f7g8h9i0j1k2",
						"name": "Livestock",
						"externalId": "livestock"
					}
				]
			}
		],
		"count": 45,
		"totalProjects": 45,
		"categoriesQueried": 3
	}
}
```

**Parameters:**

-   `categoryIds` (required): Array of category IDs to fetch projects from
-   `page` (optional): Page number for pagination (default: 1)
-   `limit` (optional): Number of projects per page (default: 10, max: 50)
-   `search` (optional): Search term to filter projects by title/description

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

## 🔧 Troubleshooting Common Issues

### Authentication Errors

**Error:** `"Required field token is missing"`

-   **Cause:** Header name incorrect or token not sent
-   **Solution:** Use `X-auth-token` (capital X) header name
-   **Example:** `curl -H "X-auth-token: your_token"`

**Error:** `"TenantId and OrgnizationId required in the token"`

-   **Cause:** Token missing required fields or wrong field names
-   **Solution:** Ensure token contains `tenant_code` and `organization_ids` fields
-   **Check:** Decode your JWT token to verify structure

**Error:** `"Cannot read properties of undefined (reading 'map')"`

-   **Cause:** Token structure doesn't match expected format
-   **Solution:** Ensure roles are in `organizations[0].roles` array
-   **Fix Applied:** Middleware now correctly extracts roles from nested structure

### Token Structure Validation

Use this command to decode and verify your token structure:

```bash
node -e "
const token = 'your_jwt_token_here';
const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
console.log('Token Structure:', JSON.stringify(payload, null, 2));
"
```

### Middleware Updates Applied

The following fixes have been implemented in `generics/middleware/authenticator.js`:

1. **Tenant Field Mapping:**

    - Changed from `decodedToken.data.tenant_id` to `decodedToken.data.tenant_code`

2. **Organization Field Mapping:**

    - Changed from `decodedToken.data.organization_id` to `decodedToken.data.organization_ids[0]`

3. **Roles Extraction:**

    - Changed from `decodedToken.data.roles` to `decodedToken.data.organizations[0].roles`

4. **Header Case Sensitivity:**
    - Added support for both `x-auth-token` and `X-auth-token`

## ⚠️ Critical Implementation Notes

1.  **Circular References**: The `move` logic prevents moving a category into its own descendant.
2.  **Orphans**: `getHierarchy` gracefully handles orphan nodes (nodes whose parent is missing) by treating them as roots for display.
3.  **Data Integrity**: `delete` is cascading. Always check `can-delete` endpoint first in UI.
4.  **Legacy Support**: `module/library/categories/helper.js` has been **removed**. All legacy endpoints now route through `projectCategories/helper.js`.
5.  **Token Compatibility**: Middleware has been updated to handle the new token structure with nested organization roles.
6.  **Multi-Category Projects**: The `POST /categories/projects/list` endpoint allows fetching projects from multiple categories in a single request, improving performance for complex filtering scenarios.

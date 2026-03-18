# 🛠️ Tenant Migration Script

## 📌 Overview

This script is used to **migrate data between tenants and organizations** in MongoDB.
It handles multiple collections, updates references, and ensures consistency across related data.

Additionally, it:

-   Validates user access via JWT (admin-only)
-   Updates entity references via external service
-   Pushes migrated project data to Kafka
-   Generates a migration output report

---

## ⚙️ Prerequisites

-   Node.js (v16+ recommended)
-   MongoDB access
-   `.env` file configured
-   Input configuration file (`input.json`)

---

## 📁 Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URL=<your-mongo-url>
ACCESS_TOKEN_SECRET=<jwt-secret>
INTERFACE_SERVICE_URL=<base-url>
ENTITY_MANAGEMENT_SERVICE_BASE_URL=<entity-service-path>
USER_SERVICE_BASE_URL=<user-service-path>
INTERNAL_ACCESS_TOKEN=<internal-token>
```

---

## 📥 Input File

Provide an `input.json` file in the same directory:

```json
{
	"currentTenantId": "oldTenant",
	"currentOrgId": "oldOrg",
	"newTenantId": "newTenant",
	"newOrgId": "newOrg",
	"token": "your-jwt-token"
}
```

---

## 🔐 Token Validation

-   The script verifies the JWT token using `ACCESS_TOKEN_SECRET`
-   It ensures the user has an **admin role**
-   If not, the script exits with:

    ```
    Unauthorized
    ```

---

## 📦 Collections Covered

The script migrates the following collections:

-   certificateBaseTemplates
-   projectCategories
-   certificateTemplates
-   organizationExtension
-   programs
-   projectTemplates
-   projectTemplateTasks
-   projects
-   solutions
-   userExtension
-   userCourses

---

## 🚀 How It Works

### 1. Data Filtering

Each collection is filtered by:

-   `tenantId`
-   `orgId`
-   Excludes already migrated documents

---

### 2. Migration Strategy

#### 🔹 Insert-based migration

-   Creates new documents with:

    -   New `_id`
    -   Updated `tenantId` and `orgId`
    -   `tenantMigrationReferenceId`

#### 🔹 Update-based migration

-   Updates existing documents in-place
-   Used for:

    -   organizationExtension
    -   projectTemplateTasks

---

### 3. Reference Mapping

Handles mapping for:

-   Categories
-   Entities (state, district, etc.)
-   Base templates
-   Programs & solutions

Uses:

-   `tenantMigrationReferenceId`
-   External entity service

---

### 4. User Data Enrichment

-   Fetches user profile via API
-   Updates `userProfile` field

---

### 5. Kafka Push

After migrating `projects`:

-   Each project is pushed to Kafka
-   Includes a **1-second delay** between pushes

---

### 6. Batch Processing

-   Uses `BATCH_SIZE = 10`
-   Bulk operations via `bulkWrite`
-   Adds **3-second delay** between batches

---

## 📊 Output

A file is generated:

```
output-<timestamp>.json
```

### Format:

```json
{
	"collectionName": {
		"count": 100,
		"data": [
			{
				"_id": "newId",
				"migrationReferenceId": "oldId"
			}
		]
	}
}
```

---

## ▶️ Run the Script

```bash
node your-script-file.js
```

---

## 🧠 Key Features

-   ✅ Safe migration using batching
-   ✅ Reference integrity maintained
-   ✅ Admin-only execution
-   ✅ External service integration
-   ✅ Kafka event triggering
-   ✅ Migration audit output

---

## ⚠️ Notes

-   Ensure **correct tenant/org IDs** before running
-   Run in a **non-production environment first**
-   Kafka push depends on valid token
-   External services must be reachable

---

## 🧹 Cleanup & Exit

-   Closes MongoDB connection after execution
-   Exits process with status `1` (intentional termination)

---

## ❌ Error Handling

All errors result in:

```
Migration failed: <error>
```

---

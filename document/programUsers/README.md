# Program Users API Documentation

## Overview

The Program Users module provides APIs to manage user-program mappings with status tracking, metadata storage, and hierarchical category tracking. This module is designed to track a user's journey through a program from onboarding to graduation.

## Table of Contents

1. [Schema](#schema)
2. [Status Flow](#status-flow)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [Sample Requests](#sample-requests)
6. [Error Handling](#error-handling)

---

## Schema

### Collection: `programUsers`

| Field                 | Type     | Required | Description                                                               |
| --------------------- | -------- | -------- | ------------------------------------------------------------------------- |
| `programId`           | ObjectId | Yes      | Reference to the program                                                  |
| `userId`              | String   | Yes      | User identifier                                                           |
| `userProfile`         | Object   | Yes      | User profile information                                                  |
| `userRoleInformation` | Object   | No       | User's role in the program                                                |
| `metadata`            | Object   | No       | Hierarchical category/template/task tracking (optional, empty by default) |
| `appInformation`      | Object   | No       | Application details                                                       |
| `consentShared`       | Boolean  | No       | Whether consent is shared (default: false)                                |
| `resourcesStarted`    | Boolean  | No       | Whether resources are started (default: false)                            |
| `status`              | String   | No       | User's status in program (default: NOT_ONBOARDED)                         |
| `prevStatus`          | String   | No       | Previous status for transition tracking                                   |
| `statusReason`        | String   | No       | Reason for status change                                                  |
| `tenantId`            | String   | Yes      | Tenant identifier (from token)                                            |
| `orgId`               | String   | Yes      | Organization identifier (from token)                                      |
| `createdBy`           | String   | Yes      | Created by user ID (from token)                                           |
| `updatedBy`           | String   | Yes      | Updated by user ID (from token)                                           |

### Indexes

| Index                          | Type     | Purpose                      |
| ------------------------------ | -------- | ---------------------------- |
| `(userId, programId)`          | Unique   | Prevent duplicate mappings   |
| `(programId, status)`          | Compound | Filter by program and status |
| `(tenantId, orgId)`            | Compound | Multi-tenancy filtering      |
| `(tenantId, orgId, programId)` | Compound | Combined filtering           |
| `(createdBy, programId)`       | Compound | Filter by creator            |
| `(userId, status)`             | Compound | Filter user by status        |

---

## Status Flow

### Available Statuses

```
NOT_ONBOARDED → ONBOARDED → IN_PROGRESS → COMPLETED → GRADUATED
                    ↓           ↓            ↓
                DROPPED_OUT  DROPPED_OUT  DROPPED_OUT
```

### Status Values

| Status          | Description                                  |
| --------------- | -------------------------------------------- |
| `NOT_ONBOARDED` | Initial state when user is mapped to program |
| `ONBOARDED`     | User has completed onboarding                |
| `IN_PROGRESS`   | User is actively working on the program      |
| `COMPLETED`     | User has completed all requirements          |
| `GRADUATED`     | User has graduated (terminal state)          |
| `DROPPED_OUT`   | User has dropped out (terminal state)        |

### Transition Rules

1. **Sequential Progress**: Status must follow the order: `NOT_ONBOARDED → ONBOARDED → IN_PROGRESS → COMPLETED → GRADUATED`
2. **No Rollback**: Cannot transition to a previous status
3. **No Skipping**: Cannot skip intermediate statuses
4. **DROPPED_OUT**: Can transition to `DROPPED_OUT` from any status except `GRADUATED`
5. **Terminal States**: `GRADUATED` and `DROPPED_OUT` are terminal - no further transitions allowed

### Valid Transitions

| Current Status | Valid Next Statuses      |
| -------------- | ------------------------ |
| NOT_ONBOARDED  | ONBOARDED, DROPPED_OUT   |
| ONBOARDED      | IN_PROGRESS, DROPPED_OUT |
| IN_PROGRESS    | COMPLETED, DROPPED_OUT   |
| COMPLETED      | GRADUATED, DROPPED_OUT   |
| GRADUATED      | (none - terminal)        |
| DROPPED_OUT    | (none - terminal)        |

---

## API Endpoints

### Base URL

```
/project/v1/programUsers
```

### Authentication

All endpoints require authentication via token in header:

```
x-auth-token: <your-auth-token>
```

The token is decoded to extract:

-   `userId` - User identifier
-   `tenantId` - Tenant identifier
-   `organizationId` (orgId) - Organization identifier

### Endpoints Summary

| Method | Endpoint                   | Description                                         |
| ------ | -------------------------- | --------------------------------------------------- |
| POST   | `/create`                  | Create new program user                             |
| PATCH  | `/update/:_id`             | Update program user                                 |
| GET    | `/read/:_id`               | Get program user by ID                              |
| GET    | `/read/:programId/:userId` | Read particular program user by program and user ID |
| POST   | `/list`                    | List program users with filters                     |
| DELETE | `/delete/:_id`             | Delete program user                                 |
| PATCH  | `/updateStatus/:_id`       | Update status with validation                       |
| PATCH  | `/updateMetadata/:_id`     | Update metadata                                     |
| GET    | `/getByProgramId/:_id`     | Get users by program ID                             |

---

## Sample Requests

### 1. Create Program User

```bash
POST /project/v1/programUsers/create
Headers:
  x-auth-token: <token>
  Content-Type: application/json

Body:
{
  "programId": "507f1f77bcf86cd799439012",
  "userId": "user-uuid-123",  // Optional - uses token userId if not provided
  "userProfile": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  },
  "userRoleInformation": {
    "role": "teacher"
  },
  "status": "NOT_ONBOARDED",  // Optional - defaults to NOT_ONBOARDED
  "metadata": {}  // Optional - empty by default
}

Response:
{
  "success": true,
  "message": "Program user created successfully",
  "result": {
    "_id": "507f1f77bcf86cd799439011",
    "programId": "507f1f77bcf86cd799439012",
    "userId": "user-uuid-123",
    "status": "NOT_ONBOARDED",
    ...
  }
}
```

### 2. Update Status

```bash
PATCH /project/v1/programUsers/updateStatus/507f1f77bcf86cd799439011
Headers:
  x-auth-token: <token>
  Content-Type: application/json

Body:
{
  "status": "ONBOARDED",
  "statusReason": "Completed onboarding process"
}

Response (Success):
{
  "success": true,
  "message": "Program user status updated successfully",
  "result": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "ONBOARDED",
    "prevStatus": "NOT_ONBOARDED",
    "validNextStatuses": ["IN_PROGRESS", "DROPPED_OUT"],
    ...
  }
}

Response (Invalid Transition):
{
  "success": false,
  "message": "Cannot skip status. Current: NOT_ONBOARDED, Expected next: ONBOARDED, Attempted: COMPLETED",
  "data": {
    "currentStatus": "NOT_ONBOARDED",
    "attemptedStatus": "COMPLETED",
    "validNextStatuses": ["ONBOARDED", "DROPPED_OUT"],
    "statusFlow": "NOT_ONBOARDED → ONBOARDED → IN_PROGRESS → COMPLETED → GRADUATED (DROPPED_OUT from any except GRADUATED)"
  }
}
```

### 3. List Program Users

This works for offset also

```bash
POST /project/v1/programUsers/list?page=1&limit=10&programId=xxx&status=ONBOARDED
Headers:
  x-auth-token: <token>

Query Parameters:
  - page: Page number (default: 1)
  - limit: Items per page (default: 10, max: 100)
  - programId: Filter by program ID
  - userId: Filter by user ID
  - status: Filter by status
  - createdBy: Filter by creator
  - orgId: Filter by organization

Response:
{
  "success": true,
  "message": "Program users fetched successfully",
  "result": [...],
  "count": 100,
  "totalCount": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### 4. Update Metadata

```bash
PATCH /project/v1/programUsers/updateMetadata/507f1f77bcf86cd799439011
Headers:
  x-auth-token: <token>
  Content-Type: application/json

Body:
{
  "metadata": {
    "externalIdOfBoardingCompletionCategory": {
      "templateExternalId": "onboarding-template-001",
      "tasks": [
        { "taskId": "task-001", "completed": true, "completedAt": "2024-12-18T10:00:00Z" }
      ]
    },
    "observationInfo": {
      "midlineSurveyCount": 1,
      "midlineSurveyComplete": true
    }
  }
}

Response:
{
  "success": true,
  "message": "Program user metadata updated successfully",
  "result": {...}
}
```

### 5. Delete Program User (Standard DELETE Pattern)

```bash
DELETE /project/v1/programUsers/delete/507f1f77bcf86cd799439011
Headers:
  x-auth-token: <token>

Path Parameters:
  - _id: Program user ID to delete

Response (Success):
{
  "success": true,
  "message": "Program user resource deleted successfully",
  "result": {
    "_id": "507f1f77bcf86cd799439011",
    "deletedAt": "2024-12-18T10:30:00Z"
  }
}

Response (Not Found):
{
  "success": false,
  "status": 404,
  "message": "Program user not found or already deleted"
}
```

---

## Metadata Structure

The `metadata` field supports hierarchical tracking of categories, templates, and tasks:

```javascript
{
  "metadata": {
    // Level 0 Category - Onboarding
    "externalIdOfBoardingCompletionCategory": {
      "templateExternalId": "template-123",
      "tasks": [
        { "taskId": "ObjectId", "completed": true, "completedAt": "ISO Date" }
      ]
    },

    // Level 0 Category - Pathways (with nested subcategories)
    "externalIdPathwayCategory": {
      "templateExternalId": "template-456",
      "tasks": [...],

      // Level 1 - Social Empowerment
      "externalIdSocialEmpowermentCategory": {
        "templateExternalId": "template-789",
        "tasks": [...]
      },

      // Level 1 - Livelihoods (with nested)
      "externalIdLivelihoodsCategory": {
        "templateExternalId": "template-abc",
        "tasks": [...],

        // Level 2 - Agriculture
        "externalIdAgricultureCategory": {
          "templateExternalId": "template-def",
          "tasks": [...],

          // Level 3 - Crop Farming
          "externalIdCropFarmingCategory": {
            "templateExternalId": "template-ghi",
            "tasks": [...]
          }
        }
      }
    },

    // Observation Info
    "observationInfo": {
      "midlineSurveyCount": 0,
      "midlineSurveyComplete": false,
      "graduationReadinessSurveyComplete": false,
      "endlineSurveyComplete": false
    },

    // Certificate Info
    "certificateInfo": {
      "certificateIssued": false,
      "certificateIssuedDate": null
    }
  }
}
```

---

## Error Handling

### Common Error Responses

| Status Code | Message                             | Description                  |
| ----------- | ----------------------------------- | ---------------------------- |
| 400         | Program user ID is required         | Missing \_id parameter       |
| 400         | User already exists in this program | Duplicate userId + programId |
| 400         | Invalid status transition           | Status rules violated        |
| 404         | Program user not found              | No matching document         |
| 500         | Internal server error               | Unexpected error             |

### Status Transition Errors

```json
{
	"success": false,
	"status": 400,
	"message": "Rollback not allowed. Cannot transition from ONBOARDED to NOT_ONBOARDED. Status must progress forward.",
	"data": {
		"currentStatus": "ONBOARDED",
		"attemptedStatus": "NOT_ONBOARDED",
		"validNextStatuses": ["IN_PROGRESS", "DROPPED_OUT"]
	}
}
```

---

## Files Structure

```
project-service/
├── models/
│   └── programUsers.js              # Schema definition
├── databaseQueries/
│   └── programUsers.js              # Database operations
├── module/
│   └── programUsers/
│       ├── helper.js                # Business logic
│       └── validator/
│           └── v1.js                # Request validation
├── controllers/
│   └── v1/
│       └── programUsers.js          # API endpoints
├── generics/
│   └── constants/
│       └── api-responses.js         # Response messages
└── document/
    └── programUsers/
        └── README.md                # This documentation
```

---

## Version History

| Version | Date       | Changes                                                               |
| ------- | ---------- | --------------------------------------------------------------------- |
| 1.1.0   | 2024-12-18 | Added readByProgramAndUserId and deleteResource APIs                  |
| 1.0.0   | 2024-12-18 | Initial implementation with CRUD, status validation, metadata support |

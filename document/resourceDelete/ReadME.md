# 🔧 Project Service - Admin Resource Deletion API

## Overview

This document helps support and implementation teams run deletion operations for **program** or **solution** in the **Project Service** using a secure, admin-only endpoint. It ensures complete cleanup of associated data and consistency across services.

---

## 🔐 Authorization

-   Admin-only access
-   Requires internal, admin, and user authentication headers

---

## 🛠️ API Endpoint

```
POST /project/v1/admin/deleteResource/:id?type={program|solution}
```

---

## 📥 Request Parameters

| Parameter           | Type    | Description                               |
| ------------------- | ------- | ----------------------------------------- |
| `:id`               | String  | Resource ID (Program/Solution)            |
| `type`              | String  | Either `program` or `solution`            |
| `isAPrivateProgram` | Boolean | If Program is Private `true` else `false` |

---

## 🧩 Headers

-   `Content-Type: application/json`
-   `internal-access-token: <internal-access-token>`
-   `x-auth-token: <user-token>`
-   `admin-auth-token: <admin-auth-token>`
-   `tenantId: shikshagraha`
-   `orgId: blr`

---

## 📤 Example cURL Commands

### 🔁 Delete a **Program**:

```bash
curl --location --request POST 'http://localhost:4301/project/v1/admin/deleteResource/68260d66b063136922f947c9?type=program&isAPrivateProgram=true' \
--header 'x-auth-token;' \
--header 'internal-access-token: <internal-access-token>' \
--header 'Content-Type: application/json' \
--header 'admin-auth-token: <admin-auth-token>' \
--header 'tenantId: shikshagraha' \
--header 'orgId: blr'
```

### 🔁 Delete a **Solution**:

```bash
curl --location --request POST 'http://localhost:4301/project/v1/admin/deleteResource/68260d66b063136922f947c9?type=solution' \
--header 'x-auth-token;' \
--header 'internal-access-token: <internal-access-token>' \
--header 'Content-Type: application/json' \
--header 'admin-auth-token: <admin-auth-token>' \
--header 'tenantId: shikshagraha' \
--header 'orgId: blr'
```

---

## ✅ Response Sample

```json
{
	"message": "Solution and associated resources deleted successfully",
	"status": 200,
	"result": {
		"deletedProgramsCount": 1,
		"deletedSolutionsCount": 1,
		"deletedProjectTemplatesCount": 2,
		"deletedCertificateTemplatesCount": 1,
		"deletedProjectTemplateTasksCount": 15,
		"deletedSurveysCount": 0,
		"deletedSurveySubmissionsCount": 0,
		"deletedObservationsCount": 0,
		"deletedObservationSubmissionsCount": 0,
		"pullProgramFromUserExtensionCount": 0,
		"deletedProjectsCount": 0
	}
}
```

---

## Notes

-   All deletions are logged in `resourceDeletionLog`
-   Kafka topic used: `RESOURCE_DELETION_TOPIC`
-   Consistent clean-up is guaranteed across linked entities

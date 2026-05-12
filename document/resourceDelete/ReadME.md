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
	"message": "Program and associated resources deleted successfull",
	"status": 200,
	"result": {
		"deletedPrograms": {
			"deletedProgramsIds": ["695cb84c5dfcac0952f562f4"],
			"deletedProgramsCount": 1
		},
		"deletedSolutions": {
			"deletedSolutionsIds": [
				"695cb84f941a350e28bfa991",
				"695cb857941a350e28bfaa03",
				"695cb8645dfcac0952f56335",
				"695cb8654f13df702d51c003",
				"695cb8654f13df702d51c028"
			],
			"deletedSolutionsCount": 5
		},
		"deletedProjectTemplates": {
			"deletedProjectTemplatesIds": ["695cb8655dfcac0952f5633d"],
			"deletedProjectTemplatesCount": 1
		},
		"deletedCertificateTemplates": {
			"deletedCertificateTemplatesIds": ["695cb8655dfcac0952f56342", "695cb8655dfcac0952f56347"],
			"deletedCertificateTemplatesCount": 2
		},
		"deletedProjectTemplateTasks": {
			"deletedProjectTemplateTasksIds": [
				"695cb8655dfcac0952f56342",
				"695cb8655dfcac0952f56347",
				"695cb8655dfcac0952f5634c",
				"695cb8655dfcac0952f56351",
				"695cb8655dfcac0952f56355"
			],
			"deletedProjectTemplateTasksCount": 5
		},
		"deletedSurveys": {
			"deletedSurveysIds": ["695cb8655dfcac0952f56351", "695cb8655dfcac0952f56355"],
			"deletedSurveysCount": 2
		},
		"deletedSurveySubmissions": {
			"deletedSurveySubmissionsIds": ["695cb8655dfcac0952f56351", "695cb8655dfcac0952f56355"],
			"deletedSurveySubmissionsCount": 2
		},
		"deletedObservations": {
			"deletedObservationsIds": ["695cb84f941a350e28bfa991", "695cb857941a350e28bfaa03"],
			"deletedObservationsCount": 2
		},
		"deletedObservationSubmissions": {
			"deletedObservationSubmissionsIds": ["695cb84f941a350e28bfa991", "695cb857941a350e28bfaa03"],
			"deletedObservationSubmissionsCount": 2
		},
		"pullProgramFromUserExtensionCount": 0,
		"deletedProjects": {
			"deletedProjectsIds": ["695cb8654f13df702d51c003", "695cb8654f13df702d51c028"],
			"deletedProjectsCount": 2
		}
	}
}
```

---

## Notes

-   All deletions are logged in `resourceDeletionLog`
-   Kafka topic used: `RESOURCE_DELETION_TOPIC`
-   Consistent clean-up is guaranteed across linked entities

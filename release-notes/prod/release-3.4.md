# 🚀 Project-Service Release 3.4.0 [![Latest](https://img.shields.io/badge/Latest-ffffff00?style=flat&labelColor=ffffff00&color=green)](#)

## ✨ Features

-   **[1482] Observation as a Task** – Ability to add observation, project, and survey as a task in a project.
-   **[1557] List All Solution Types under Program** – Extended program details API to list all solution types (not just projects) under a program.
-   **[1560] Entity Mapping for Projects** – Enhanced APIs to allow consumption of projects against specific entities.
-   **[1546] Course under Program** – Introduced support for implementing courses as a solution under a program.
-   **[1547] Solution Sequencing** – Added feature to list solutions in the sequencing order defined in a program.
-   **[1559] Resource Deletion (Admin APIs)** – Implemented APIs to remove programs/solutions and their related resources from the system.
-   **Health Check** – Introduced a health check feature with relevant API endpoints for system monitoring.
-   **Org Policies** - Introduced org policies in library flow to allow the users to access resources despite of organization boundaries.

---

## 🐞 Bug Fixes

-   **[3402] Program Mapping Fix** – Mapping of observation, survey, and project within a program made available.

---

## 🔄 Migration Instructions

Execute the following scripts after deployment:

-   `migrations/correctOrgIdValuesInCollections/correctOrgIdValuesInCollections.js`  
    – Normalize `orgId/orgIds` fields across collections.
-   `migrations/correctScopeOrgValues/correctScopeOrgValues.js`  
    – Normalize `orgId/orgIds` fields in solution scope, if present.
-   `migrations/updateComponentsOfAllPrograms.js`
    – Updates components of existing program with sequence.
-   `migrations/createOrgExtensions/createOrgExtensions.js`
    -This script helps to create default org policies & updates projectCategories collections.

---

👨‍💻 **Service:** Project Service  
🏷️ **Version:** 3.4.0

# 🛠️ Tenant Migration Execution Guide

## 📌 Overview

This document provides the **correct order and references** to execute tenant migration scripts across services.

Follow the sequence strictly to ensure:

-   Data consistency
-   Proper reference mapping
-   Successful downstream migrations

---

## 🚀 Execution Order

### 1️⃣ Entity Service

-   Must be executed **first**
-   Handles all base entity data (state, district, school, etc.)
-   Other services depend on entity mappings

🔗 README:
https://github.com/ELEVATE-Project/entity-management/blob/develop/src/migrations/tenantMigration/readMe.md

---

### 2️⃣ User Service

-   Execute after entity migration
-   Migrates user-related data and profiles

🔗 README:
_(To be added)_

---

### 3️⃣ Project Service

-   Depends on both entity & user data
-   Migrates:

    -   Programs
    -   Solutions
    -   Projects
    -   Templates

🔗 README:
https://github.com/ELEVATE-Project/project-service/blob/develop/migrations/tenantMigration/README.md

---

### 4️⃣ Survey Service (Samiksha)

-   Should be executed **last**
-   Depends on project and user mappings

🔗 README:
https://github.com/ELEVATE-Project/samiksha-service/blob/develop/migrations/tenantMigration/README.md

---

## ⚠️ Important Notes

-   Follow the order strictly:
    **Entity → User → Project → Survey**

-   Ensure:

    -   Same tenant IDs are used across all services
    -   Migration reference IDs are preserved
    -   Required environment variables are set

-   Always:

    -   Run in **staging first**
    -   Validate data after each step

---

## ✅ Summary

| Step | Service | Dependency    |
| ---- | ------- | ------------- |
| 1    | Entity  | None          |
| 2    | User    | Entity        |
| 3    | Project | Entity, User  |
| 4    | Survey  | Project, User |

---

## 🏁 Final Note

Run each service migration **independently and verify before proceeding** to the next.

---

## Caution : Please check with Data team if they have to any process before executing the above scripts.

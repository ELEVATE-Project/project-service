# 🚀 Project Service Release Notes – v3.4.0 ![Latest](https://img.shields.io/badge/latest-v3.4.0-brightgreen?style=for-the-badge&logo=github)

## 📌 Overview

This release introduces **major feature enhancements** and **important bug fixes** in the Project Service.  
Key improvements include support for observations, surveys, and courses within programs, solution sequencing, new APIs, and system health monitoring.

---

## ✨ New Features

### 1482 – Observation as a Task

**Description:** Ability to add **observation, project, and survey** as a task in a project.

---

### 1557 – List All Solution Types Under Program Tile

**Description:** Extended program details API to list **all solution types** (not just projects) under a program.

---

### 1560 – Entity Mapping for Projects

**Description:** Enhanced APIs to allow consumption of projects **against specific entities**.

---

### 1546 – Course as a Solution

**Description:** Introduced support to implement **course as a solution** under a program.

---

### 1547 – Solution Sequencing

**Description:** Added feature to **list solutions in sequencing order** as defined in the program.

---

### 1559 – Delete API for Program/Solution Resources

**Description:** Implemented APIs to **remove programs/solutions and related resources** from the system.

---

### Health Check

**Description:** Introduced a **health check feature** with relevant API endpoints exposed for system monitoring.

---

## 🐞 Bug Fixes

### 3402 – Mapping Fix for Program Solutions

**Description:** Corrected the mapping of **Observation, Survey, and Project** within a program.

---

## 🔄 Migration Instructions

After deployment, execute the following migration scripts:

-   `migrations/correctOrgIdValuesInCollections/correctOrgIdValuesInCollections.js`  
    – Normalize `orgId/orgIds` fields across collections.

-   `migrations/correctScopeOrgValues/correctScopeOrgValues.js`  
    – Normalize `orgId/orgIds` fields in **solution scope**, if present.

---

## ✅ Summary

-   Enhanced flexibility by supporting **multiple solution types** (Projects, Surveys, Observations, Courses) under programs.
-   Improved **system management** through delete APIs and sequencing.
-   Added **robust health check monitoring**.
-   Fixed program mapping issues ensuring **better data consistency**.
-   Provided **mandatory migration scripts** to normalize organization data.

---

📅 **Release Date:** 20 Sept 2025  
👨‍💻 **Service:** Project Service  
🏷️ **Version:** 3.4.0 (Latest)

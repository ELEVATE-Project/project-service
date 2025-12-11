# Hierarchy Migration Script

This migration script converts existing flat category structure to hierarchical structure.

## Usage

### Dry Run (Recommended First)

```bash
node migrations/addHierarchyFields/addHierarchyFields.js --dry-run
```

### Production Run

```bash
node migrations/addHierarchyFields/addHierarchyFields.js
```

### Tenant-Specific Migration

```bash
node migrations/addHierarchyFields/addHierarchyFields.js --tenant=shikshalokam
```

## What It Does

1. Finds all existing categories
2. Sets them as root categories (level 0, parent_id: null)
3. Initializes hierarchy fields:
    - `parent_id`: null
    - `level`: 0
    - `path`: category ID
    - `pathArray`: [category ID]
    - `hasChildren`: false
    - `childCount`: 0
    - `displayOrder`: sequential number

## Important Notes

-   **Backup your database** before running in production
-   Always run with `--dry-run` first to verify
-   Migration is idempotent (safe to run multiple times)
-   Existing categories will become root-level categories
-   You can manually organize them into hierarchies after migration

# Release v3.4.1 Deployment Guide

This document outlines the detailed deployment steps, environment changes, migrations, and post-deployment updates for the **v3.4.1 production release** across multiple microservices.

---

## General Notes

-   All environment variables must be verified before deployment.
-   Execute migration scripts only after successful deployment of each respective service.
-   For Docker-based deployments, update the image tag to the latest version as specified for each service.
-   For PM2 deployments, use the specified branch name.

> ⚠️ **For cURLs mentioned, Token and domain values vary based on environment: make sure you pass valid token and domain for the environment. Valid token can be optained from engineering team. Due to security issues token is not provided in the documentation**
>
> -   **Elevate Prod:** `https://elevate-apis.shikshalokam.org`
> -   **SaaS Prod:** `https://elevate-api.sunbirdsaas.com`
> -   **SaaS QA:** `https://saas-qa.tekdinext.com`

---

## Interface Service

### 1. Environment Details

```json
{
	"REQUIRED_PACKAGES": "elevate-project@3.4.1 elevate-survey-observation@3.4.2"
}
```

### 2. Migration

_No migrations applicable._

### 3. PM2 Deployment

-   **Branch:** `master`

### 4. Docker Deployment

```
verify the existing tag. if not matching update it
```

-   **Image Tag:** `<TO_BE_UPDATED>`

### 5. Post Deployment Step

-   Restart the interface service after environment updates.

---

## Project Service

### 1. Environment Changes

**Add (if not present):**

```json
{
	"TENANT_CACHE_TTL": "86400"
}
```

### 2. Migrations

_No migrations applicable._

### 3. PM2 Deployment

-   **Branch:** `main`

### 4. Docker Deployment

```
docker image is not created yet. update once available
```

-   **Image Tag:** `<TO_BE_UPDATED>`

---

## Samiksha Service (Survey Service)

### 1. Environment Changes

**Add (if not present):**

```json
{
	"TENANT_CACHE_TTL": "86400"
}
```

### 2. Migrations

_No migrations applicable._

### 3. PM2 Deployment

-   **Branch:** `main`

### 4. Docker Deployment

```
docker image is not created yet. update once available
```

-   **Image Tag:** `<TO_BE_UPDATED>`

---

## Entity Management Service

### 1. Environment Changes

_No environment changes applicable._

### 2. Migration

_No migrations applicable._

### 3. PM2 Deployment

-   **Branch:** `main`

### 4. Docker Deployment

```
verify the existing tag. if not matching update it
```

-   **Image Tag:** `<TO_BE_UPDATED>`

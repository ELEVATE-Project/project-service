# Tenant Organization Migration Script

This Node.js script performs a migration for organizations across tenants. It checks the health of dependent services, fetches tenants and their organizations, verifies existing organization extensions in MongoDB, and pushes Kafka events for new organizations.

---

## Features

1. **Service Health Check**: Ensures that required services (`Project Service` and `User Service`) are healthy before running the migration.
2. **Tenant Fetching**: Retrieves tenant codes either from the command-line or the User Service API.
3. **Organization Fetching**: Retrieves organizations for each tenant from the User Service API.
4. **MongoDB Check**: Identifies existing organization extensions in MongoDB to avoid duplicate Kafka events.
5. **Kafka Event Push**: Sends messages to a Kafka topic for newly added organizations.
6. **Interactive Error Handling**: Prompts the user to continue if fetching an organization list fails.

---

## Prerequisites

-   Node.js >= 18
-   MongoDB connection
-   Kafka broker
-   `.env` file containing all required environment variables

---

## Environment Variables

Create a `.env` file with the following variables:

```bash
MONGODB_URL=<MongoDB connection URL>
KAFKA_URL=<Kafka broker URL>
ORG_UPDATES_TOPIC=<Kafka topic name>
USER_SERVICE_BASE_URL=<User Service base URL>
INTERFACE_SERVICE_URL=<Interface Service base URL>
APPLICATION_BASE_URL=<Application base URL for Interface Service>
INTERNAL_ACCESS_TOKEN=<Internal access token for API requests>
SERVICE_NAME=<Project Service base service name>
```

---

## Running the Script with a Specific Tenant

You can run the script for a specific tenant by providing the tenant code via the Node.js command line. This overrides fetching all tenants from the User Service API.

```bash
node createOrgExtensions.js --tenant=<tenant_code>
```

# 🩺 Health Check Configuration Guide

This project uses the `elevate-project-services-health-check` package to monitor the health of various services like databases, message brokers, and internal microservices.

To enable this, create a configuration file named `health.config.js`. This file defines **what to check**, **how to check it**, and **what constitutes a healthy response**.

---

## 📁 File Structure

```bash
healthCheck/
├── health.config.js  # ✅ Your health check configuration
└── ...
```

---

## ✅ Basic Structure

```js
module.exports = {
	name: 'YourServiceName',
	version: '1.0.0',
	checks: {
		// Define checks here
	},
}
```

---

## 🧾 Top-Level Keys

| Key       | Type     | Required | Description                                                      |
| --------- | -------- | -------- | ---------------------------------------------------------------- |
| `name`    | `string` | ✅       | Name of the service. Displayed in the health check response.     |
| `version` | `string` | ✅       | Current version of the service. Useful for tracking deployments. |
| `checks`  | `object` | ✅       | Contains configuration for all enabled health checks.            |

---

## 🔍 `checks` Object

This is the heart of your config. It allows you to define **which components to monitor** and **how**.

### 🧩 Supported Built-in Checks

Each service has the following structure:

```js
<service>: {
  enabled: true,
  url: process.env.SERVICE_URL,
}
```

### ✅ Common Services

| Service     | Purpose                         | Notes                                        |
| ----------- | ------------------------------- | -------------------------------------------- |
| `mongodb`   | Check MongoDB connection        | `url` must point to a valid MongoDB URI      |
| `postgres`  | Check PostgreSQL database       | Example: `postgres://user:pass@host:port/db` |
| `redis`     | Check Redis connectivity        | Can be local or remote                       |
| `kafka`     | Check Kafka producer & consumer | Broker URL must be reachable                 |
| `gotenberg` | Check PDF conversion service    | URL to Gotenberg's health endpoint           |

---

## 🔁 Microservices Health Checks

To validate dependent microservices, use the `microservices` array.

```js
microservices: [
	{
		name: 'ServiceName',
		url: 'https://host/health',
		enabled: true,
		request: {
			method: 'GET',
			header: {},
			body: {},
		},
		expectedResponse: {
			status: 200,
			'result.healthy': true,
			'meta.ok': 'yes',
		},
	},
]
```

### 🧠 Notes on `expectedResponse`

-   Supports **deep key matching** using dot notation (e.g., `result.healthy`)
-   All keys must match their expected values
-   If any value does not match, the service is marked unhealthy

---

## 📌 Example `.env` Usage (Recommended)

```env
MONGODB_URL=mongodb://localhost:27017/mydb
POSTGRES_URL=postgres://user:pass@localhost:5432/mydb
GOTENBERG_URL=http://localhost:3000
KAFKA_URL=kafka://localhost:9092
KAFKA_HEALTH_CHECK_TOPIC = project-health-check-topic-check
SURVEY_SERVICE_URL=http://localhost:4001/survey/health
```

---

## 🚨 Best Practices

-   ✅ Always keep `enabled: true` only for services currently in use.
-   ✅ Use environment variables to avoid hardcoding URLs and credentials.
-   ✅ Validate your config during startup using a helper like `validateHealthConfig(config)`.
-   🛑 Do not include sensitive tokens or secrets directly in the config.

---

## ✅ Minimal Valid Configuration

```js
module.exports = {
	name: 'MyService',
	version: '1.0.0',
	checks: {
		mongodb: {
			enabled: true,
			url: process.env.MONGODB_URL,
		},
		redis: {
			enabled: false,
		},
		microservices: [],
	},
}
```

---

## 📞 Need More?

Supports Kafka send/receive, Redis ping, MongoDB & Postgres connectivity, HTTP validation for microservices, and response structure validation.

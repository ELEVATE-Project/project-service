# Health Check Configuration Guide

This project uses the `elevate-services-health-check` package to perform health checks for internal components like MongoDB, Kafka, and dependent microservices.

To enable this, create a configuration file (`health.config.js`) that defines what to check and how.

---

## ✅ Sample Configuration

```js
module.exports = {
	name: 'Project Service', // 🔹 Service name shown in health check response
	version: '1.0.0', // 🔹 Service version shown in response

	checks: {
		mongodb: {
			enabled: true, // ✅ Required if MongoDB is used
			url: process.env.MONGODB_URL, // 🔐 Recommended: use env variable
		},

		kafka: {
			enabled: true, // ✅ Required if Kafka is used
			url: process.env.KAFKA_URL,
		},

		microservices: [
			{
				name: 'Survey Service', // ✅ Required: Unique name
				url: 'http://localhost:4301/healthCheckStatus', // ✅ Required: Health check endpoint
				enabled: true, // ✅ Required: Set to true to activate

				// 🧾 Optional - If the service needs headers/body/method
				request: {
					method: 'GET', // 🔄 HTTP method (GET or POST)
					header: {
						'internal-access-token': process.env.INTERNAL_TOKEN,
					},
					body: {}, // 🧾 Only needed for POST requests
				},

				// ✅ Required - Define expected keys in response to verify health
				expectedResponse: {
					status: 200, // HTTP status code to expect
					'params.status': 'successful', // ✅ Deep keys allowed
				},
			},
		],
	},
}
```

module.exports = {
	name: process.env.SERVICE_NAME,
	checks: {
		mongodb: {
			enabled: true,
			url: process.env.MONGODB_URL,
		},
		kafka: {
			enabled: true,
			url: process.env.KAFKA_URL,
			topic: process.env.KAFKA_HEALTH_CHECK_TOPIC,
			groupId: process.env.KAFKA_GROUP_ID,
		},
		gotenberg: {
			enabled: true,
			url: process.env.GOTENBERG_URL,
		},
		microservices: [
			{
				name: 'SamikshaService',
				url: `${process.env.INTERFACE_SERVICE_URL}/survey/health?serviceName=${process.env.SERVICE_NAME}`,
				enabled: true,
				request: {
					method: 'GET',
					header: {},
					body: {},
				},

				expectedResponse: {
					status: 200,
					'params.status': 'successful',
					'result.healthy': true,
				},
			},
			{
				name: 'EntityManagementService',
				url: `${process.env.INTERFACE_SERVICE_URL}/entity-management/health?serviceName=${process.env.SERVICE_NAME}`,
				enabled: true,
				request: {
					method: 'GET',
					header: {},
					body: {},
				},

				expectedResponse: {
					status: 200,
					'params.status': 'successful',
					'result.healthy': true,
				},
			},
			{
				name: 'UserService',
				url: `${process.env.INTERFACE_SERVICE_URL}/user/health?serviceName=${process.env.SERVICE_NAME}`,
				enabled: true,
				request: {
					method: 'GET',
					header: {},
					body: {},
				},

				expectedResponse: {
					status: 200,
					'params.status': 'successful',
					'result.healthy': true,
				},
			},
		],
	},
}

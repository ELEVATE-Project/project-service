module.exports = {
	name: process.env.SERVICE_NAME,
	version: '1.0.0',
	checks: {
		mongodb: {
			enabled: true,
			url: process.env.MONGODB_URL,
		},
		kafka: {
			enabled: true,
			url: process.env.KAFKA_URL,
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
				url: `${process.env.INTERFACE_SERVICE_URL}/entity/health?serviceName=${process.env.SERVICE_NAME}`,
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

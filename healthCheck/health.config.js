module.exports = {
	name: 'ProjectService',
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
				url: 'http://localhost:3569/survey/health?serviceName=ProjectService',
				enabled: true,
				request: {
					method: 'GET',
					header: {
						'internal-access-token': process.env.INTERNAL_TOKEN,
					},
					body: {
						'service Name': 'Project Service',
					},
				},

				expectedResponse: {
					status: 200,
					'params.status': 'successful',
				},
			},
			{
				name: 'EntityManagementService',
				url: 'http://localhost:3569/entity/health?serviceName=ProjectService',
				enabled: true,
				timeout: 15000,
				request: {
					method: 'GET',
					header: {
						'internal-access-token': process.env.INTERNAL_TOKEN,
					},
					body: {},
				},

				expectedResponse: {
					status: 200,
					'params.status': 'successful',
				},
			},
			{
				name: 'UserService',
				url: 'http://localhost:3001/user/health?serviceName=ProjectService', // Replace with actual URL - use environment variable if needed
				enabled: true,
				request: {
					method: 'GET',
					header: {
						'internal-access-token': process.env.INTERNAL_TOKEN,
					},
					body: {},
				},

				expectedResponse: {
					status: 200,
					'params.status': 'successful',
				},
			},
		],
	},
}

module.exports = {
	name: 'Project Service',
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
		microservices: [
			{
				name: 'Survey Service',
				url: 'http://localhost:4301/healthCheckStatus', // Replace with actual URL - use environment variable if needed
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

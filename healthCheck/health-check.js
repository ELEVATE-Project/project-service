/**
 * name : health-check.js.
 * author : Vishnu.
 * created-date : 25-June-2025.
 * Description : Health check helper functionality.
 */

const { healthCheckHandler } = require('elevate-services-health-check')
const healthCheckConfig = require('./health.config')
// const { v1: uuidv1 } = require("uuid");

async function health_check(req, res) {
	try {
		const response = await healthCheckHandler(healthCheckConfig, req.query.serviceName)
		res.status(200).json(response)
	} catch (err) {
		console.error('Health check failed:', err)

		res.status(500).json({
			id: 'Project.service.Health.API',
			ver: '1.0',
			ts: new Date(),
			params: {
				resmsgid: uuidv1(),
				msgid: req.headers['msgid'] || uuidv1(),
				status: 'failed',
				err: err.name || 'INTERNAL_ERROR',
				errMsg: err.message || 'Something went wrong',
			},
			status: 500,
			result: { healthy: false },
		})
	}
}

function healthCheckStatus(req, res) {
	const result = { healthy: true } // or whatever your default logic is
	const responseData = buildResponse(req, result)
	res.status(200).json(responseData)
}

function buildResponse(req, result) {
	return {
		id: 'Project.service.Health.API',
		ver: '1.0',
		ts: new Date(),
		params: {
			resmsgid: uuidv1(),
			msgid: req.headers['msgid'] || uuidv1(),
			status: 'successful',
			err: null,
			errMsg: null,
		},
		status: 200,
		result,
	}
}

module.exports = {
	health_check,
	healthCheckStatus,
}

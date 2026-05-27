'use strict'

const axios = require('axios')

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001'
// Must match INTERNAL_ACCESS_TOKEN in user_integration_test.env
const USER_INTERNAL_ACCESS_TOKEN = process.env.USER_INTERNAL_ACCESS_TOKEN || 'internal-access-token'
// Must match ADMIN_SECRET_CODE in user_integration_test.env
const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE || 'W5bF7gesuS0xsNWmpsKy'

const TEST_ADMIN = {
	name: 'Test Admin',
	email: 'testadmin@default.org',
	password: 'Test@1234',
}

async function createAdminUser() {
	const response = await axios.post(
		`${USER_SERVICE_URL}/user/v1/admin/create`,
		{
			name: TEST_ADMIN.name,
			email: TEST_ADMIN.email,
			password: TEST_ADMIN.password,
			secret_code: ADMIN_SECRET_CODE,
		},
		{
			headers: {
				internal_access_token: USER_INTERNAL_ACCESS_TOKEN,
				'Content-Type': 'application/json',
			},
			validateStatus: () => true, // don't throw on 4xx/5xx
		}
	)
	return response.data
}

async function loginAdminUser() {
	const response = await axios.post(
		`${USER_SERVICE_URL}/user/v1/admin/login`,
		{
			email: TEST_ADMIN.email,
			password: TEST_ADMIN.password,
		},
		{
			headers: { 'Content-Type': 'application/json' },
		}
	)
	return response.data
}

// Creates the admin user and logs in, returning the access token.
// Safe to call multiple times: treats ADMIN_USER_ALREADY_EXISTS as non-fatal.
// Call this in a before() hook in your test suite.
async function setupAdminUser() {
	const createData = await createAdminUser()
	const alreadyExists =
		createData.message === 'ADMIN_USER_ALREADY_EXISTS' || (createData.result && createData.result.user)

	if (!alreadyExists && createData.responseCode === 'CLIENT_ERROR') {
		throw new Error(`Admin user creation failed: ${createData.message}`)
	}

	const loginData = await loginAdminUser()
	return loginData.result.access_token
}

module.exports = {
	TEST_ADMIN,
	USER_SERVICE_URL,
	USER_INTERNAL_ACCESS_TOKEN,
	ADMIN_SECRET_CODE,
	createAdminUser,
	loginAdminUser,
	setupAdminUser,
}

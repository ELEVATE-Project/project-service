'use strict'

const axios = require('axios')
const { expect } = require('chai')
const {
	TEST_ADMIN,
	USER_SERVICE_URL,
	USER_INTERNAL_ACCESS_TOKEN,
	ADMIN_SECRET_CODE,
	createAdminUser,
	loginAdminUser,
	setupAdminUser,
} = require('./helpers/commonTests')

const TEST_USER = {
	name: 'Test User',
	email: 'testuser@localhost',
	password: 'Test@1234',
}

describe('User Creation Flow', function () {
	let adminToken

	before(async function () {
		adminToken = await setupAdminUser()
	})

	// ── Admin user ───────────────────────────────────────────────────────────

	describe('Admin user', function () {
		it('should create admin user or report already exists', async function () {
			const data = await createAdminUser()
			const isSuccess = data.result && data.result.user
			const isAlreadyExists = data.message === 'ADMIN_USER_ALREADY_EXISTS'
			expect(isSuccess || isAlreadyExists).to.equal(true)
		})

		it('should login admin user and return access token', async function () {
			const data = await loginAdminUser()
			expect(data.result).to.exist
			expect(data.result.access_token).to.be.a('string').and.not.empty
		})

		it('before() should have resolved an admin token', function () {
			expect(adminToken).to.be.a('string').and.not.empty
		})
	})

	// ── Regular user ─────────────────────────────────────────────────────────
	// Origin header must be 'http://localhost' so the domain 'localhost' resolves
	// to the default tenant in the tenant_domains table (seeded by migration).

	describe('Regular user', function () {
		it('should create a regular user via user-service', async function () {
			const response = await axios.post(
				`${USER_SERVICE_URL}/user/v1/account/create`,
				{
					name: TEST_USER.name,
					email: TEST_USER.email,
					password: TEST_USER.password,
				},
				{
					headers: {
						'Content-Type': 'application/json',
						Origin: 'http://localhost',
					},
					validateStatus: () => true,
				}
			)

			const data = response.data
			const isSuccess = response.status === 201 || response.status === 200
			const isAlreadyExists = data.message === 'USER_ALREADY_EXISTS' || data.message === 'EMAIL_ID_EXISTS'

			expect(isSuccess || isAlreadyExists).to.equal(true, `Unexpected response: ${JSON.stringify(data)}`)
		})

		it('should login a regular user and return access token', async function () {
			const response = await axios.post(
				`${USER_SERVICE_URL}/user/v1/account/login`,
				{
					email: TEST_USER.email,
					password: TEST_USER.password,
				},
				{
					headers: {
						'Content-Type': 'application/json',
						Origin: 'http://localhost',
					},
				}
			)

			expect(response.data.result).to.exist
			expect(response.data.result.access_token).to.be.a('string').and.not.empty
		})
	})
})

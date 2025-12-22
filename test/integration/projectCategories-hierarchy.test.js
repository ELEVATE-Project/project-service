/**
 * Integration tests for project categories hierarchy consistency
 * Tests: create → move → delete with children/hasChildren/childCount consistency
 */

const request = require('supertest')
const { ObjectId } = require('mongodb')

// Mock setup (adjust based on your test framework)
describe('Project Categories Hierarchy Consistency', () => {
	let app
	let userToken
	let tenantId
	let orgId

	beforeAll(async () => {
		// Setup: Initialize app, get auth token, set tenant/org
		app = require('../../app')
		userToken = process.env.TEST_USER_TOKEN || 'test-token'
		tenantId = process.env.TEST_TENANT_ID || 'tenant-001'
		orgId = process.env.TEST_ORG_ID || 'org-001'
	})

	describe('Scenario: Create Root → Add Child 1 → Add Child 2 → Move Child 1 → Delete', () => {
		let rootCategoryId
		let child1Id
		let child2Id

		test('Step 1: Create root category (no parent)', async () => {
			const response = await request(app)
				.post('/project/v1/categories/create')
				.set('Authorization', `Bearer ${userToken}`)
				.send({
					name: 'Root Test Category',
					externalId: 'root-test-001',
					status: 'ACTIVE',
				})

			expect(response.status).toBe(200)
			expect(response.body.success).toBe(true)
			rootCategoryId = response.body.data._id

			// Verify root category has no children
			expect(response.body.data.hasChildren).toBe(false)
			expect(response.body.data.childCount).toBe(0)
			expect(response.body.data.children).toEqual([])
			expect(response.body.data.level).toBe(0)
			expect(response.body.data.parent_id).toBeNull()
		})

		test('Step 2: Create child 1 under root (root.childCount should become 1)', async () => {
			const response = await request(app)
				.post('/project/v1/categories/create')
				.set('Authorization', `Bearer ${userToken}`)
				.send({
					name: 'Child 1',
					externalId: 'child-test-001',
					parent_id: rootCategoryId,
					status: 'ACTIVE',
				})

			expect(response.status).toBe(200)
			expect(response.body.success).toBe(true)
			child1Id = response.body.data._id

			// Verify child 1
			expect(response.body.data.level).toBe(1)
			expect(response.body.data.parent_id.toString()).toBe(rootCategoryId.toString())
			expect(response.body.data.hasChildren).toBe(false)
			expect(response.body.data.childCount).toBe(0)
			expect(response.body.data.children).toEqual([])

			// Verify root category updated
			const rootCheck = await request(app)
				.get(`/project/v1/categories/${rootCategoryId}`)
				.set('Authorization', `Bearer ${userToken}`)

			expect(rootCheck.body.data.hasChildren).toBe(true)
			expect(rootCheck.body.data.childCount).toBe(1)
			expect(rootCheck.body.data.children).toContain(child1Id)
		})

		test('Step 3: Create child 2 under root (root.childCount should become 2)', async () => {
			const response = await request(app)
				.post('/project/v1/categories/create')
				.set('Authorization', `Bearer ${userToken}`)
				.send({
					name: 'Child 2',
					externalId: 'child-test-002',
					parent_id: rootCategoryId,
					status: 'ACTIVE',
				})

			expect(response.status).toBe(200)
			expect(response.body.success).toBe(true)
			child2Id = response.body.data._id

			// Verify root category now has 2 children
			const rootCheck = await request(app)
				.get(`/project/v1/categories/${rootCategoryId}`)
				.set('Authorization', `Bearer ${userToken}`)

			expect(rootCheck.body.data.hasChildren).toBe(true)
			expect(rootCheck.body.data.childCount).toBe(2)
			expect(rootCheck.body.data.children).toContain(child1Id)
			expect(rootCheck.body.data.children).toContain(child2Id)
		})

		test('Step 4: Move child 1 to become child of child 2', async () => {
			const response = await request(app)
				.post('/project/v1/categories/move')
				.set('Authorization', `Bearer ${userToken}`)
				.send({
					categoryId: child1Id,
					newParentId: child2Id,
				})

			expect(response.status).toBe(200)
			expect(response.body.success).toBe(true)

			// Verify child 1 updated
			const child1Check = await request(app)
				.get(`/project/v1/categories/${child1Id}`)
				.set('Authorization', `Bearer ${userToken}`)

			expect(child1Check.body.data.parent_id.toString()).toBe(child2Id.toString())
			expect(child1Check.body.data.level).toBe(2)

			// Verify child 2 now has child 1 as child
			const child2Check = await request(app)
				.get(`/project/v1/categories/${child2Id}`)
				.set('Authorization', `Bearer ${userToken}`)

			expect(child2Check.body.data.hasChildren).toBe(true)
			expect(child2Check.body.data.childCount).toBe(1)
			expect(child2Check.body.data.children).toContain(child1Id)

			// Verify root now only has 1 direct child (child 2)
			const rootCheck = await request(app)
				.get(`/project/v1/categories/${rootCategoryId}`)
				.set('Authorization', `Bearer ${userToken}`)

			expect(rootCheck.body.data.hasChildren).toBe(true)
			expect(rootCheck.body.data.childCount).toBe(1)
			expect(rootCheck.body.data.children).toContain(child2Id)
			expect(rootCheck.body.data.children).not.toContain(child1Id)
		})

		test('Step 5: Delete child 1 (child 2 should have 0 children, root should still have 1)', async () => {
			const response = await request(app)
				.delete(`/project/v1/categories/${child1Id}`)
				.set('Authorization', `Bearer ${userToken}`)

			expect(response.status).toBe(200)
			expect(response.body.success).toBe(true)

			// Verify child 2 now has 0 children
			const child2Check = await request(app)
				.get(`/project/v1/categories/${child2Id}`)
				.set('Authorization', `Bearer ${userToken}`)

			expect(child2Check.body.data.hasChildren).toBe(false)
			expect(child2Check.body.data.childCount).toBe(0)
			expect(child2Check.body.data.children).toEqual([])

			// Verify root still has 1 child
			const rootCheck = await request(app)
				.get(`/project/v1/categories/${rootCategoryId}`)
				.set('Authorization', `Bearer ${userToken}`)

			expect(rootCheck.body.data.hasChildren).toBe(true)
			expect(rootCheck.body.data.childCount).toBe(1)
			expect(rootCheck.body.data.children).toContain(child2Id)
		})

		test('Step 6: Delete child 2 (root should have 0 children)', async () => {
			const response = await request(app)
				.delete(`/project/v1/categories/${child2Id}`)
				.set('Authorization', `Bearer ${userToken}`)

			expect(response.status).toBe(200)
			expect(response.body.success).toBe(true)

			// Verify root now has 0 children
			const rootCheck = await request(app)
				.get(`/project/v1/categories/${rootCategoryId}`)
				.set('Authorization', `Bearer ${userToken}`)

			expect(rootCheck.body.data.hasChildren).toBe(false)
			expect(rootCheck.body.data.childCount).toBe(0)
			expect(rootCheck.body.data.children).toEqual([])
		})
	})

	describe('Edge Cases', () => {
		test('Cannot move category to itself', async () => {
			const cat = await createCategory({ name: 'Self Move Test' })

			const response = await request(app)
				.post('/project/v1/categories/move')
				.set('Authorization', `Bearer ${userToken}`)
				.send({
					categoryId: cat._id,
					newParentId: cat._id,
				})

			expect(response.status).toBe(400)
			expect(response.body.success).toBe(false)
			expect(response.body.message).toMatch(/itself/i)
		})

		test('Cannot move category to its descendant', async () => {
			const parent = await createCategory({ name: 'Parent' })
			const child = await createCategory({ name: 'Child', parent_id: parent._id })

			const response = await request(app)
				.post('/project/v1/categories/move')
				.set('Authorization', `Bearer ${userToken}`)
				.send({
					categoryId: parent._id,
					newParentId: child._id,
				})

			expect(response.status).toBe(400)
			expect(response.body.success).toBe(false)
			expect(response.body.message).toMatch(/descendant/i)
		})

		test('Cannot delete category with children', async () => {
			const parent = await createCategory({ name: 'Parent with Child' })
			const child = await createCategory({ name: 'Child', parent_id: parent._id })

			const response = await request(app)
				.delete(`/project/v1/categories/${parent._id}`)
				.set('Authorization', `Bearer ${userToken}`)

			expect(response.status).toBe(400)
			expect(response.body.success).toBe(false)
			expect(response.body.message).toMatch(/children/i)
		})
	})

	/**
	 * Helper function to create a test category
	 */
	async function createCategory(data) {
		const response = await request(app)
			.post('/project/v1/categories/create')
			.set('Authorization', `Bearer ${userToken}`)
			.send({
				status: 'ACTIVE',
				...data,
				externalId: data.externalId || `ext-${Date.now()}-${Math.random()}`,
			})

		return response.body.data
	}
})

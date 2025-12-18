/**
 * name : v1.js
 * author : System
 * created-date : 18-Dec-2024
 * Description : Validators for program users API endpoints.
 */

module.exports = (req) => {
	let programUsersValidator = {
		/**
		 * Validator for create endpoint
		 */
		create: function () {
			req.checkBody('programId')
				.exists()
				.withMessage('programId is required')
				.notEmpty()
				.withMessage('programId cannot be empty')
				.isMongoId()
				.withMessage('programId must be a valid MongoDB ObjectId')

			// userId is optional - if not provided, will use token userId
			if (req.body.userId) {
				req.checkBody('userId')
					.notEmpty()
					.withMessage('userId cannot be empty')
					.isString()
					.withMessage('userId must be a string')
			}

			req.checkBody('userProfile')
				.exists()
				.withMessage('userProfile is required')
				.notEmpty()
				.withMessage('userProfile cannot be empty')

			// Status is optional but if provided must be valid
			if (req.body.status) {
				req.checkBody('status')
					.isIn(['NOT_ONBOARDED', 'ONBOARDED', 'IN_PROGRESS', 'COMPLETED', 'GRADUATED', 'DROPPED_OUT'])
					.withMessage(
						'status must be one of: NOT_ONBOARDED, ONBOARDED, IN_PROGRESS, COMPLETED, GRADUATED, DROPPED_OUT'
					)
			}

			// Metadata is optional
			if (req.body.metadata) {
				// Instead of .isObject(), we use a custom check
				req.checkBody('metadata')
					.custom((val) => typeof val === 'object' && !Array.isArray(val) && val !== null)
					.withMessage('metadata must be an object')
			}

			// ConsentShared is optional but if provided must be boolean
			if (req.body.consentShared !== undefined) {
				req.checkBody('consentShared').isBoolean().withMessage('consentShared must be a boolean')
			}
		},

		/**
		 * Validator for update endpoint
		 */
		update: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('_id is required')
				.notEmpty()
				.withMessage('_id cannot be empty')
				.isMongoId()
				.withMessage('_id must be a valid MongoDB ObjectId')

			// Status is optional but if provided must be valid
			if (req.body.status) {
				req.checkBody('status')
					.isIn(['NOT_ONBOARDED', 'ONBOARDED', 'IN_PROGRESS', 'COMPLETED', 'GRADUATED', 'DROPPED_OUT'])
					.withMessage(
						'status must be one of: NOT_ONBOARDED, ONBOARDED, IN_PROGRESS, COMPLETED, GRADUATED, DROPPED_OUT'
					)
			}

			// Metadata is optional
			if (req.body.metadata) {
				req.checkBody('metadata').isObject().withMessage('metadata must be an object')
			}
		},

		/**
		 * Validator for read endpoint
		 */
		read: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('_id is required')
				.notEmpty()
				.withMessage('_id cannot be empty')
				.isMongoId()
				.withMessage('_id must be a valid MongoDB ObjectId')
		},

		/**
		 * Validator for list endpoint
		 */
		list: function () {
			// All query params are optional for list
			if (req.query.programId) {
				req.checkQuery('programId').isMongoId().withMessage('programId must be a valid MongoDB ObjectId')
			}

			if (req.query.status) {
				req.checkQuery('status')
					.isIn(['NOT_ONBOARDED', 'ONBOARDED', 'IN_PROGRESS', 'COMPLETED', 'GRADUATED', 'DROPPED_OUT'])
					.withMessage(
						'status must be one of: NOT_ONBOARDED, ONBOARDED, IN_PROGRESS, COMPLETED, GRADUATED, DROPPED_OUT'
					)
			}

			if (req.query.page) {
				req.checkQuery('page').isInt({ min: 1 }).withMessage('page must be a positive integer')
			}

			if (req.query.limit) {
				req.checkQuery('limit')
					.isInt({ min: 1, max: 100 })
					.withMessage('limit must be a positive integer between 1 and 100')
			}
		},

		/**
		 * Validator for delete endpoint
		 */
		delete: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('_id is required')
				.notEmpty()
				.withMessage('_id cannot be empty')
				.isMongoId()
				.withMessage('_id must be a valid MongoDB ObjectId')
		},

		/**
		 * Validator for updateStatus endpoint
		 */
		updateStatus: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('_id is required')
				.notEmpty()
				.withMessage('_id cannot be empty')
				.isMongoId()
				.withMessage('_id must be a valid MongoDB ObjectId')

			req.checkBody('status')
				.exists()
				.withMessage('status is required')
				.notEmpty()
				.withMessage('status cannot be empty')
				.isIn(['NOT_ONBOARDED', 'ONBOARDED', 'IN_PROGRESS', 'COMPLETED', 'GRADUATED', 'DROPPED_OUT'])
				.withMessage(
					'status must be one of: NOT_ONBOARDED, ONBOARDED, IN_PROGRESS, COMPLETED, GRADUATED, DROPPED_OUT'
				)

			// StatusReason is optional
			if (req.body.statusReason) {
				req.checkBody('statusReason').isString().withMessage('statusReason must be a string')
			}
		},

		/**
		 * Validator for updateMetadata endpoint
		 */
		updateMetadata: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('_id is required')
				.notEmpty()
				.withMessage('_id cannot be empty')
				.isMongoId()
				.withMessage('_id must be a valid MongoDB ObjectId')

			req.checkBody('metadata')
				.exists()
				.withMessage('metadata is required')
				.notEmpty()
				.withMessage('metadata cannot be empty')
				.isObject()
				.withMessage('metadata must be an object')
		},

		/**
		 * Validator for getByProgramId endpoint
		 */
		getByProgramId: function () {
			req.checkParams('_id')
				.exists()
				.withMessage('programId is required')
				.notEmpty()
				.withMessage('programId cannot be empty')
				.isMongoId()
				.withMessage('programId must be a valid MongoDB ObjectId')

			if (req.query.status) {
				req.checkQuery('status')
					.isIn(['NOT_ONBOARDED', 'ONBOARDED', 'IN_PROGRESS', 'COMPLETED', 'GRADUATED', 'DROPPED_OUT'])
					.withMessage(
						'status must be one of: NOT_ONBOARDED, ONBOARDED, IN_PROGRESS, COMPLETED, GRADUATED, DROPPED_OUT'
					)
			}

			if (req.query.page) {
				req.checkQuery('page').isInt({ min: 1 }).withMessage('page must be a positive integer')
			}

			if (req.query.limit) {
				req.checkQuery('limit')
					.isInt({ min: 1, max: 100 })
					.withMessage('limit must be a positive integer between 1 and 100')
			}
		},

		/**
		 * Validator for getStatusFlow endpoint - no validation needed
		 */
		getStatusFlow: function () {
			// No validation required for this endpoint
		},

		/**
		 * Validator for mock endpoint - no validation needed
		 */
		mock: function () {
			// No validation required for this endpoint
		},
	}

	// Execute the validator for the current method
	if (programUsersValidator[req.params.method]) {
		programUsersValidator[req.params.method]()
	}
}

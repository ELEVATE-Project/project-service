/**
 * name : programs-model.js.
 * author : Vishnu.
 * created-date : 09-Mar-2022.
 * Description : Schema for programs.
 */
const { Schema } = require('mongoose')

const programSchema = new Schema({
	externalId: String,
	name: String,
	description: String,
	owner: String,
	createdBy: String,
	updatedBy: String,
	status: {
		type: String,
		index: true,
	},
	resourceType: [String],
	language: [String],
	keywords: [String],
	concepts: ['json'],
	imageCompression: {},
	components: ['json'],
	isAPrivateProgram: {
		default: false,
		type: Boolean,
	},
	scope: {
		type: Object,
		default: {},
	},
	isDeleted: {
		default: false,
		type: Boolean,
		index: true,
	},
	requestForPIIConsent: {
		type: Boolean,
		default: true,
	},
	metaInformation: Object,
	rootOrganisations: {
		type: Array,
		required: true,
	},
	createdFor: Array,
	startDate: {
		type: Date,
		index: true,
	},
	endDate: {
		type: Date,
		index: true,
	},
	translations: Object,
	source: {
		type: Object,
		default: {},
	},
	tenantId: {
		type: String,
		required: true,
		index: true,
	},
	orgId: {
		type: String,
		index: true,
		required: true,
	},
})

// pre hook invoked before creating a document
programSchema.pre('validate', function (next) {
	if (this.startDate && this.endDate && this.startDate >= this.endDate) {
		return next(new Error('startDate must be less than endDate'))
	}
	next()
})

// pre hook invoked before updating a document
programSchema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
	const update = this.getUpdate()
	const set = update.$set || {}

	const startDate = set.startDate ?? update.startDate
	const endDate = set.endDate ?? update.endDate

	// If both provided in update, validate directly
	if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
		return next(new Error('startDate must be less than endDate'))
	}

	// If only one provided, fetch existing document
	if (startDate || endDate) {
		const doc = await this.model.findOne(this.getQuery()).select('startDate endDate')

		const finalStartDate = startDate ?? doc?.startDate
		const finalEndDate = endDate ?? doc?.endDate

		if (finalStartDate && finalEndDate && finalStartDate >= finalEndDate) {
			return next(new Error('startDate must be less than endDate'))
		}
	}

	next()
})

module.exports = {
	name: 'programs',
	schema: programSchema,
	compoundIndex: [
		{
			name: { externalId: 1, tenantId: 1 },
			indexType: { unique: true },
		},
	],
}

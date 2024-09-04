/**
 * name : forms.js.
 * author : Prajwal.
 * created-date : 08-May-2024.
 * Description : Schema for Forms.
 */

const { Schema } = require('mongoose')

const formSchema = new Schema({
	type: {
		type: String,
		required: true,
		unique: true,
		index: true,
	},
	subType: {
		type: String,
		required: true,
	},
	version: {
		type: Number,
		default: 0,
	},
	data: {
		type: Schema.Types.Mixed,
	},
	organizationId: {
		type: Number,
		required: true,
	},
})

// Pre-update hook to increment version
formSchema.pre('findOneAndUpdate', function (next) {
	// Increment version
	this.update({}, { $inc: { version: 1 } })
	next()
})

formSchema.pre('updateOne', function (next) {
	// Increment version
	this.update({}, { $inc: { version: 1 } })
	next()
})

module.exports = {
	name: 'forms',
	schema: formSchema,
}

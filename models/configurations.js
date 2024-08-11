/**
 * name : certificateBaseTemplates.js.
 * author : Prajwal.
 * created-date : 16-May-2024.
 * Description : Schema for Certificate Base Templates.
 */

module.exports = {
	name: 'configurations',
	schema: {
		code: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		meta: {
			type: Object,
			required: true,
		},
	},
}

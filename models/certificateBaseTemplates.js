/**
 * name : certificateBaseTemplates.js.
 * author : Prajwal.
 * created-date : 16-May-2024.
 * Description : Schema for Certificate Base Templates.
 */

module.exports = {
	name: 'certificateBaseTemplates',
	schema: {
		code: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		url: {
			type: String,
		},
	},
}

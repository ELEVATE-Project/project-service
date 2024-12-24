/**
 * name : project-attributes.js.
 * author : Aman Karki.
 * created-date : 14-July-2020.
 * Description : Schema for project attributes.
 */

module.exports = {
	name: 'projectAttributes',
	schema: {
		name: {
			type: String,
			required: true,
			index: true,
		},
		code: {
			type: String,
			required: true,
			index: true,
		},
		createdBy: {
			type: String,
			default: 'SYSTEM',
		},
		hasEntity: {
			type: Boolean,
			default: true,
		},
		entities: {
			type: Array,
			default: [],
		},
		translation: {
			type: Object,
			default: {},
		},
	},
}

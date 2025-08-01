/**
 * name : deletionAuditLogs.js.
 * author : Mallanagouda R Biradar
 * created-date : 23-July-2025
 * Description : Schema for entities.
 */

module.exports = {
	name: 'deletionAuditLogs',
	schema: {
		resourceId: {
			type: 'ObjectId',
			index: true,
			unique: true,
		},
		resourceType: {
			type: String,
			index: true,
		},
		deletedBy: {
			type: String,
			default: 'SYSTEM',
			index: true,
		},
		deletedAt: {
			type: Date,
			default: Date.now,
			index: true,
		},
	},
}

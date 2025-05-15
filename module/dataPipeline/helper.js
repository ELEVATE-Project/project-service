/**
 * name : helper.js
 * author : Rakesh
 * created-date : 11-Jun-2020
 * Description : DataPipeline helper functionality.
 */

// Dependencies

const UserProjectsHelper = require(MODULES_BASE_PATH + '/userProjects/helper')
kafkaProducersHelper = require(GENERICS_FILES_PATH + '/kafka/producers')

/**
 * dataPipelineHelper
 * @class
 */

module.exports = class dataPipelineHelper {
	/**
	 * get uset project details.
	 * @method
	 * @name userProject
	 * @param {String} projectId - project id.
	 * @returns {Object} Project details.
	 */

	static userProject(projectId) {
		return new Promise(async (resolve, reject) => {
			try {
				const projectDetails = await UserProjectsHelper.userProject(projectId)
				return resolve(projectDetails)
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					data: {},
				})
			}
		})
	}

	static pushProjectDetailsToKafka(projectId) {
		return new Promise(async (resolve, reject) => {
			try {
				const projectDetails = await UserProjectsHelper.userProject(projectId)
				console.log('projectDetails', projectDetails)
				if (!projectDetails.success) {
					return resolve({
						success: false,
						message: projectDetails.message,
						data: {},
					})
				}

				const kafkaPushedProject = await kafkaProducersHelper.pushProjectToKafka(projectDetails.data)
				console.log('kafkaPushedProject', kafkaPushedProject)
				projectDetails.data = projectDetails.data._id
				projectDetails.message = 'Project details pushed to kafka successfully'
				return resolve(projectDetails)
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					data: {},
				})
			}
		})
	}
}

/**
 * name : helper.js
 * author : Praveen Dass
 * Date : 21-July-2025
 *  @class
 */

const userCoursesQueries = require(DB_QUERY_BASE_PATH + '/userCourses')
const solutionsQueries = require(DB_QUERY_BASE_PATH + '/solutions')
const projectService = require(SERVICES_BASE_PATH + '/projects')
const kafkaProducersHelper = require(GENERICS_FILES_PATH + '/kafka/producers')

module.exports = class UserCoursesHelper {
	/**
	 * create or update userCourses
	 * @method
	 * @name syncUserCourse
	 * @param {Object} [userCoursesData] - kafka event for sync userCourses.
	 * @param {Object} [userDetails] - loggedIn userDetails.
	 * @returns {Object} - response with status
	 */
	static async syncUserCourse(userCoursesData, userDetails) {
		try {
			if (userDetails) {
				userCoursesData.userId = userDetails.userInformation.userId
				userCoursesData.tenant_code = userDetails.userInformation.tenantId
				userCoursesData.organization_id = userDetails.userInformation.organizationId
			}
			// Mandatory Field Checks
			if (!userCoursesData.userId || !userCoursesData.status || !userCoursesData.entityId) {
				return {
					success: false,
					status: HTTP_STATUS_CODE.bad_request.status,
					message: CONSTANTS.apiResponses.MISSING_SOLUTIONID_USERID_STATUS,
				}
			}

			// get the userCourses document
			let courseDocument = await userCoursesQueries.userCoursesDocuments({
				solutionId: new ObjectId(userCoursesData.entityId),
				userId: userCoursesData.userId,
				tenantId: userCoursesData.tenant_code,
			})

			let createOrUpdateCourse
			//If userCourse already exist update the status
			if (courseDocument.length > 0) {
				createOrUpdateCourse = await this.update(userCoursesData)
			} else {
				//userCourse not exist create the courses document
				createOrUpdateCourse = await this.createUserCourses(userCoursesData, userDetails?.userToken ?? '')
			}

			if (!createOrUpdateCourse.success) {
				return {
					status: HTTP_STATUS_CODE.bad_request.status,
					message: CONSTANTS.apiResponses.USER_COURSES_NOT_CREATED,
				}
			}

			return {
				success: true,
				data: createOrUpdateCourse,
			}
		} catch (error) {
			throw {
				success: false,
				message: error.message,
				data: false,
			}
		}
	}

	/**
	 * create userCourses
	 * @method
	 * @name createUserCourses
	 * @param {Object} [userCoursesData] -  userCourses data.
	 * @returns {Object} - response with status
	 */
	static async createUserCourses(userCoursesData, userToken = '') {
		try {
			// Check for solutions in solutionDocuments
			let solutionDocument = await solutionsQueries.solutionsDocument({
				_id: new ObjectId(userCoursesData.entityId),
				tenantId: userCoursesData.tenant_code,
				type: userCoursesData.type,
				isDeleted: false,
				status: { $ne: CONSTANTS.common.INACTIVE },
			})

			if (!solutionDocument || !solutionDocument.length > 0) {
				return {
					status: HTTP_STATUS_CODE.bad_request.status,
					message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
				}
			}
			solutionDocument = solutionDocument[0]

			//get userProfileData
			let userProfileData
			if (userToken && userToken.trim() !== '') {
				userProfileData = await projectService.profileRead(userToken)
				userProfileData = userProfileData.success && userProfileData.data ? userProfileData.data : {}
			}

			let createCourseData = {
				solutionId: new ObjectId(userCoursesData.entityId),
				userId: userCoursesData.userId,
				status: userCoursesData.status,
				tenantId: userCoursesData.tenant_code ?? solutionDocument.tenantId,
				orgId: userCoursesData.organization_id ?? solutionDocument.orgId,
				programId: solutionDocument.programId,
				programExternalId: solutionDocument.programExternalId,
				solutionInformation: solutionDocument,
				userProfile: userProfileData,
				...(userCoursesData.status.toLowerCase() === CONSTANTS.common.SUBMISSION_STATUS_COMPLETED && {
					completedAt: new Date(),
				}),
			}
			//create userCourses document
			let createCourse = await userCoursesQueries.createUserCourses(createCourseData)
			if (!createCourse || !createCourse._id) {
				return {
					status: HTTP_STATUS_CODE.bad_request.status,
					message: CONSTANTS.apiResponses.USER_COURSES_NOT_CREATED,
				}
			}

			await kafkaProducersHelper.pushUserCoursesToKafka(createCourse)
			return {
				success: true,
				message: CONSTANTS.apiResponses.USER_COURSES_CREATED,
				data: createCourse,
			}
		} catch (error) {
			throw {
				success: false,
				message: error.message,
				data: false,
			}
		}
	}

	/**
	 * update userCourses
	 * @method
	 * @name update
	 * @param {Object} [userCoursesData] -  userCourses data.
	 * @returns {Object} - response with status
	 */
	static async update(userCoursesData, userDetails, isDeleted = false) {
		try {
			if (isDeleted && userDetails) {
				userCoursesData.userId = userDetails.userInformation.userId
				userCoursesData.tenant_code = userDetails.userInformation.tenantId
				userCoursesData.organization_id = userDetails.userInformation.organizationId
			}
			// Query to get the userCourses document
			let coursesfilter = {
				solutionId: new ObjectId(userCoursesData.entityId),
				userId: userCoursesData.userId,
				tenantId: userCoursesData.tenant_code,
			}

			//update query

			let updateCourseData

			if (isDeleted) {
				updateCourseData = { isDeleted: true, updatedAt: new Date() }
			} else {
				updateCourseData = {
					status: userCoursesData.status,
					updatedAt: new Date(),
					...(userCoursesData.status.toLowerCase() === CONSTANTS.common.SUBMISSION_STATUS_COMPLETED && {
						completedAt: new Date(),
					}),
				}
			}

			let updateObject = { $set: updateCourseData }

			let updateCourse = await userCoursesQueries.updateMany(coursesfilter, updateObject, { new: true })
			if (!updateCourse || updateCourse.nModified === 0) {
				return {
					status: HTTP_STATUS_CODE.bad_request.status,
					message: CONSTANTS.apiResponses.USER_COURSES_NOT_UPDATED,
				}
			}

			// Fetch the latest updated document
			let updatedCourseDocument = await userCoursesQueries.userCoursesDocuments(coursesfilter)

			// Push to Kafka (Generic function)
			await kafkaProducersHelper.pushUserCoursesToKafka(updatedCourseDocument[0])

			return {
				success: true,
				message: CONSTANTS.apiResponses.USER_COURSES_UPDATED,
				data: updatedCourseDocument[0]._id,
			}
		} catch (error) {
			throw {
				success: false,
				message: error.message,
				data: false,
			}
		}
	}
}

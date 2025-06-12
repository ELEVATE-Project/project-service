/**
 * name         : users/helper.js
 * author       : Vishnu
 * created-date : 04-Oct-2024
 * Description  : All User related function helper.
 */

// Dependencies
const programsHelper = require(MODULES_BASE_PATH + '/programs/helper')
const solutionsHelper = require(MODULES_BASE_PATH + '/solutions/helper')
const userProjectsHelper = require(MODULES_BASE_PATH + '/userProjects/helper')
const programsQueries = require(DB_QUERY_BASE_PATH + '/programs')

/**
 * UsersHelper
 * @class
 */

module.exports = class UsersHelper {
	/**
	 * User targeted solutions.
	 * @method
	 * @name solutions
	 * @param {String} programId - program id.
	 * @param {Object} requestedData requested data.
	 * @param {String} pageSize page size.
	 * @param {String} pageNo page no.
	 * @param {String} search search text.
	 * @param {String} token user token.
	 * @param {String} userId user userId.
	 * @param {Objec} userDetails loggedin user's info
	 * @returns {Object} targeted user solutions.
	 */

	static solutions(programId, requestedData, pageSize, pageNo, search, userId, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				// Fetch program data and verify the validity of program
				let programData = await programsHelper.details(
					programId,
					['name', 'requestForPIIConsent', 'rootOrganisations', 'endDate', 'description'],
					'none',
					userDetails
				)

				if (!programData.success) {
					return resolve({
						status: HTTP_STATUS_CODE.bad_request.status,
						message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
					})
				}
				programData = programData.data
				let totalCount = 0
				let mergedData = []

				// fetching all the targted solutions in program
				let autoTargetedSolutions = await solutionsHelper.forUserRoleAndLocation(
					requestedData, //user Role information
					CONSTANTS.common.IMPROVEMENT_PROJECT, // type of solution user is looking for
					'', //subtype of solutions
					programId, //program for solutions
					CONSTANTS.common.DEFAULT_PAGE_SIZE, //page size
					CONSTANTS.common.DEFAULT_PAGE_NO, //page no
					search, //search text
					userDetails
				)

				let projectSolutionIdIndexMap = {}

				if (autoTargetedSolutions.data.data && autoTargetedSolutions.data.data.length > 0) {
					totalCount = autoTargetedSolutions.data.data.length
					mergedData = autoTargetedSolutions.data.data
				}

				mergedData = mergedData.map((targetedData, index) => {
					projectSolutionIdIndexMap[targetedData._id.toString()] = index
					delete targetedData.programId
					delete targetedData.programName
					return targetedData
				})

				// Get projects already started by a user in a given program
				let importedProjects = await userProjectsHelper.importedProjects(userId, programId)

				if (importedProjects.success) {
					if (importedProjects.data && importedProjects.data.length > 0) {
						importedProjects.data.forEach((importedProject) => {
							if (projectSolutionIdIndexMap[importedProject.solutionInformation._id] !== undefined) {
								mergedData[
									projectSolutionIdIndexMap[importedProject.solutionInformation._id]
								].projectId = importedProject._id
							} else {
								let data = importedProject.solutionInformation
								data['projectTemplateId'] = importedProject.projectTemplateId
								data['projectId'] = importedProject._id
								data['type'] = CONSTANTS.common.IMPROVEMENT_PROJECT
								// if project is having certificate pass certificateTemplateId details with solution details.
								if (importedProject.certificate && importedProject.certificate.templateId) {
									data['certificateTemplateId'] = importedProject.certificate.templateId
								}
								mergedData.push(data)
								totalCount = totalCount + 1
							}
						})
					}
				}

				if (mergedData.length > 0) {
					let startIndex = pageSize * (pageNo - 1)
					let endIndex = startIndex + pageSize
					mergedData = mergedData.slice(startIndex, endIndex)
				}

				let result = {
					programName: programData.name,
					programId: programId,
					programEndDate: programData.endDate ? programData.endDate : '',
					description: programData.description
						? programData.description
						: CONSTANTS.common.TARGETED_SOLUTION_TEXT,
					rootOrganisations:
						programData.rootOrganisations && programData.rootOrganisations.length > 0
							? programData.rootOrganisations[0]
							: '',
					data: mergedData,
					count: totalCount,
					programEndDate: programData.endDate,
				}
				if (programData.hasOwnProperty('requestForPIIConsent')) {
					result.requestForPIIConsent = programData.requestForPIIConsent
				}
				//Check data present in programUsers collection.
				//checkForUserJoinedProgramAndConsentShared will returns an object which contain joinProgram and consentShared status.
				// let programJoinStatus =
				//   await programUsersHelper.checkForUserJoinedProgramAndConsentShared(
				//     programId,
				//     userId
				//   );
				// result.programJoined = programJoinStatus.joinProgram;
				// result.consentShared = programJoinStatus.consentShared;

				return resolve({
					message: CONSTANTS.apiResponses.PROGRAM_SOLUTIONS_FETCHED,
					success: true,
					result: result,
				})
			} catch (error) {
				return resolve({
					success: false,
					result: {
						description: CONSTANTS.common.TARGETED_SOLUTION_TEXT,
						data: [],
						count: 0,
					},
				})
			}
		})
	}

	/**
	 * List of all private programs created by user
	 * @method
	 * @name privatePrograms
	 * @param {string} userId - logged in user Id.
	 * @param {string} language - languageCode.
	 * @param {Boolean} getProjectsCount - get the projectsCount under that program.
	 * @param {Number} pageNo - pageNo
	 * @param {Number} pageSize - pageSize
	 * @param {Object} userDetails - loggedin user's info
	 * @returns {Array} - List of all private programs created by user.
	 */

	static privatePrograms(userId, language, getProjectsCount, pageNo, pageSize, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				let userPrivatePrograms = await programsHelper.userPrivatePrograms(
					userId,
					language,
					getProjectsCount,
					pageNo,
					pageSize,
					userDetails
				)

				return resolve({
					message: CONSTANTS.apiResponses.PRIVATE_PROGRAMS_LIST,
					result: userPrivatePrograms,
				})
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * User targeted programs.
	 * @method
	 * @name programs
	 * @param {Object} bodyData - request body data.
	 * @param {String} pageNo - Page number.
	 * @param {String} pageSize - Page size.
	 * @param {String} searchText - Search text.
	 * @param {String} userId - User Id.
	 * @param {Object} userDetails - loggedin user's info
	 * @returns {Array} - Get user targeted programs.
	 */

	static programs(bodyData, pageNo, pageSize, searchText, userId, userDetails) {
		return new Promise(async (resolve, reject) => {
			try {
				let programDetails = {}
				let targetedProgramIds = []
				let alreadyStartedProgramsIds = []
				let programCount = 0
				let tenantId = userDetails.userInformation.tenantId
				let orgId = userDetails.userInformation.organizationId
				//get all programs which user has joined irrespective of targeted and non targeted programs
				// let alreadyStartedPrograms = await this.getUserJoinedPrograms(
				//   searchText,
				//   userId
				// );

				// if (alreadyStartedPrograms.success && alreadyStartedPrograms.data) {
				//   alreadyStartedProgramsIds = alreadyStartedPrograms.data;
				// }

				// getting all program details matching the user profile. not passing pageSize and pageNo to get all data.
				let targetedPrograms = await programsHelper.forUserRoleAndLocation(
					bodyData,
					'', // not passing page size
					'', // not passing page number
					searchText,
					'',
					{},
					userDetails
					//   ["_id"]
				)

				// targetedPrograms.data contain all programIds targeted to current user profile.
				if (targetedPrograms.success && targetedPrograms.data && targetedPrograms.data.length > 0) {
					targetedProgramIds = UTILS.arrayOfObjectToArrayOfObjectId(targetedPrograms.data)
				}
				// filter tagregeted program ids if any targetedProgramIds are prsent in alreadyStartedPrograms then remove that
				// let allTargetedProgramButNotJoined = _.differenceWith(
				//   targetedProgramIds,
				//   alreadyStartedProgramsIds,
				//   _.isEqual
				// );

				//find total number of programs related to user
				// let userRelatedPrograms = alreadyStartedProgramsIds.concat(
				//   allTargetedProgramButNotJoined
				// );
				//total number of programs
				programCount = targetedProgramIds
				if (!(programCount.length > 0)) {
					throw {
						message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
						count: 0,
					}
				}
				// Splitting the userRelatedPrograms array based on the page number and size.
				// The returned data is not coming in the order of userRelatedPrograms elements when all the IDs are passed.
				// We can't add a sort to the programDocuments function because it will also sort programs joined from the previous profile, which should come at the end of the list for us.
				// We have two requirements:
				// 1. Current profile programs should come in the order of their creation.
				// 2. Previous profile programs should always come last.
				let startIndex = pageSize * (pageNo - 1)
				let endIndex = startIndex + pageSize
				targetedProgramIds = targetedProgramIds.slice(startIndex, endIndex)

				//fetching all the programsDocuments
				let userRelatedProgramsData = await programsQueries.programsDocument(
					{ _id: { $in: targetedProgramIds }, tenantId: tenantId },
					['name', 'externalId', 'metaInformation'],
					'none', //not passing skip fields
					{ createdAt: -1 } // sort by 'createdAt' in descending order
				)
				if (!(userRelatedProgramsData.length > 0)) {
					throw {
						message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
						count: programCount.length,
					}
				}

				// programDocuments function will not return result in the order which ids are passed. This code block will ensure that the response is rearranged in correct order
				// We can't implement sort logic in programDocuments function because userRelatedPrograms can contain prev profile programs also
				// let programsResult = userRelatedPrograms.map((id) => {
				//   return userRelatedProgramsData.find(
				// 	(data) => data._id.toString() === id.toString()
				//   );
				// });
				let programsResult = userRelatedProgramsData

				programDetails.data = programsResult
				programDetails.count = programCount.length
				programDetails.description = CONSTANTS.apiResponses.PROGRAM_DESCRIPTION

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAMS_FETCHED,
					data: programDetails,
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					data: {
						description: CONSTANTS.common.TARGETED_SOLUTION_TEXT,
						data: [],
						count: error.count,
					},
				})
			}
		})
	}
}

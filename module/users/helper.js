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
	 * @returns {Object} targeted user solutions.
	 */

	static solutions(programId, requestedData, pageSize, pageNo, search, userId) {
		return new Promise(async (resolve, reject) => {
			try {
				// Fetch program data and verify the validity of program
				let programData = await programsHelper.details(programId, [
					'name',
					'requestForPIIConsent',
					'rootOrganisations',
					'endDate',
					'description',
				])

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
					search //search text
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
}

const programsHelper = require(MODULES_BASE_PATH + '/programs/helper')
const userService = require(GENERICS_FILES_PATH + '/services/users')
/**
 * UserExtensionHelper
 * @class
 */

module.exports = class UserExtensionHelper {
	/**
	 * Bulk create or update user.
	 * @method
	 * @name bulkCreateOrUpdate
	 * @param {Array} userRolesCSVData
	 * @param {Object} userDetails -logged in user details.
	 * @param {String} userDetails.id -logged in user id.
	 * @param {Object} tenantAndOrgInfo -tenant and organization information.
	 * @returns {Array}
	 */

	static bulkCreateOrUpdate(userRolesCSVData, userDetails, tenantAndOrgInfo) {
		console.log('userRolesCSVData', userRolesCSVData, userDetails, tenantAndOrgInfo)
		return new Promise(async (resolve, reject) => {
			try {
				let userRoleMap = {}

				let userRolesUploadedData = new Array()
				//validating user roles first

				// iterating over the csv data
				outerloop: for (let csvRowNumber = 0; csvRowNumber < userRolesCSVData.length; csvRowNumber++) {
					let userRole = UTILS.valueParser(userRolesCSVData[csvRowNumber])
					userRole['_SYSTEM_ID'] = ''

					try {
						if (userRole.role && !userRoleMap[userRole.role]) {
							userRole['_SYSTEM_ID'] = ''
							userRole.status = CONSTANTS.apiResponses.INVALID_ROLE_CODE
							userRolesUploadedData.push(userRole)
							continue
						}

						/*
            if (
              userRole.platform_role &&
              (!userRoleMap[userRole.platform_role] || !userRoleMap[userRole.platform_role].isAPlatformRole)
            ) {
              userRole['_SYSTEM_ID'] = '';
              userRole.status = CONSTANTS.apiResponses.INVALID_ROLE_CODE;
              delete userRoleMap[userRole.platform_role].isAPlatformRole;
              userRolesUploadedData.push(userRole);
              continue;
            }
  
            */

						let programIds = []

						if (userRole.programs && userRole.programs.length > 0) {
							/* const programDocuments = await programsHelper.list(
                {
                  externalId: { $in: userRole.programs },
                },
                ['_id'],
                '',
                '',
                '',
                tenantAndOrgInfo
              );
              */
							const programDocuments = await programsHelper.list(
								'',
								'',
								'',
								{
									userInformation: {
										tenantId: tenantAndOrgInfo.tenantId,
										organizationId: tenantAndOrgInfo.organizationId,
									},
								},
								false,
								{
									externalId: { $in: userRole.programs },
								}
							)

							console.log(programDocuments, 'programDocuments')

							let programDocumentsArray = programDocuments.data.data

							if (!programDocumentsArray.length > 0) {
								userRole['_SYSTEM_ID'] = ''
								userRole.status = CONSTANTS.apiResponses.PROGRAM_NOT_FOUND
								userRolesUploadedData.push(userRole)
								continue
							}

							programIds = programDocumentsArray.map((program) => {
								return program._id
							})
						}

						let userInfoCall = await userService.fetchProfileById(
							tenantAndOrgInfo.tenantId,
							null,
							userRole.user
						)

						if (!userInfoCall.success) {
							userRole['_SYSTEM_ID'] = ''
							userRole.status = CONSTANTS.apiResponses.USER_NOT_FOUND
							userRolesUploadedData.push(userRole)
							continue outerloop
						}
						let userDataInformation = userInfoCall.data

						const allRoles = userDataInformation.organizations.flatMap((org) => org.roles || [])

						const allRolesTitle = allRoles.map((role) => role.title)
						//validating if role is present or not

						let platform_role = userRole.platform_role

						let platform_role_array = platform_role.split(',')

						for (let roleFromCSV of platform_role_array) {
							if (!allRolesTitle.includes(roleFromCSV)) {
								userRole.status = CONSTANTS.apiResponses.INVALID_ROLE_CODE
								userRolesUploadedData.push(userRole)
								continue outerloop
							}
						}

						let existingUser = await this.userExtensionDocuments({ userId: userDataInformation.id }, [
							'roles',
							'platformRoles',
						])

						let user = ''
						existingUser = existingUser[0]

						if (!existingUser) {
							let userInformation = {
								userId: userDataInformation.id,
								externalId: userRole.user,
								status: 'active',
								updatedBy: userDetails.userId,
								createdBy: userDetails.userId,
							}

							console.log(userInformation, 'userInformation')

							if (userRole.programOperation) {
								let platform_role = userRole.platform_role

								let platform_role_array = platform_role.split(',')

								let platform_role_create_array = []

								for (let role of platform_role_array) {
									platform_role_create_array.push({
										roleId: allRoles.filter((roleFromAPI) => roleFromAPI.title == role)[0].id,
										title: allRoles.filter((roleFromAPI) => roleFromAPI.title == role)[0].title,
										programs: programIds,
									})
								}
							}

							user = await database.models.userExtension.create(userInformation)

							if (user._id) {
								userRole['_SYSTEM_ID'] = user._id
								userRole.status = 'Success'
							} else {
								userRole['_SYSTEM_ID'] = ''
								userRole.status = 'Failed to create the user role.'
							}
						} else {
							let updateQuery = {}

							if (userRole.programOperation) {
								let userPlatformRoleToUpdate

								let platform_role = userRole.platform_role

								let platform_role_array = platform_role.split(',')

								for (let role of platform_role_array) {
									if (existingUser.platformRoles && existingUser.platformRoles.length > 0) {
										userPlatformRoleToUpdate = _.findIndex(existingUser.platformRoles, {
											title: role,
										})
									}

									if (!(userPlatformRoleToUpdate >= 0)) {
										userPlatformRoleToUpdate = existingUser.platformRoles.length

										let newUserRole = {
											roleId: allRoles.filter((roleFromAPI) => roleFromAPI.title == role)[0].id,
											title: allRoles.filter((roleFromAPI) => roleFromAPI.title == role)[0].title,
										}

										newUserRole.programs = new Array()
										existingUser.platformRoles.push(newUserRole)
									}

									existingUser.platformRoles[userPlatformRoleToUpdate].programs =
										existingUser.platformRoles[userPlatformRoleToUpdate].programs.map((program) =>
											program.toString()
										)

									if (userRole.programOperation === 'OVERRIDE') {
										existingUser.platformRoles[userPlatformRoleToUpdate].programs = programIds
									} else if (
										userRole.programOperation === 'APPEND' ||
										userRole.programOperation === 'ADD'
									) {
										const currentPrograms = existingUser.platformRoles[
											userPlatformRoleToUpdate
										].programs.map((p) => p.toString())
										const newPrograms = programIds.map((p) => p.toString())

										// Merge without duplicates
										const mergedPrograms = _.uniq(currentPrograms.concat(newPrograms))

										// Reassign, converting back to ObjectId if needed
										existingUser.platformRoles[userPlatformRoleToUpdate].programs = mergedPrograms
									} else if (userRole.programOperation === 'REMOVE') {
										if (programIds.length > 0) {
											const toRemove = new Set(programIds.map((p) => p.toString()))
											existingUser.platformRoles[userPlatformRoleToUpdate].programs =
												existingUser.platformRoles[userPlatformRoleToUpdate].programs.filter(
													(p) => !toRemove.has(p.toString())
												)
										}
									}

									existingUser.platformRoles[userPlatformRoleToUpdate].programs =
										existingUser.platformRoles[userPlatformRoleToUpdate].programs.map(
											(eachProgram) => new ObjectId(eachProgram)
										)

									updateQuery['platformRoles'] = existingUser.platformRoles
								}
							}

							user = await database.models.userExtension.findOneAndUpdate(
								{
									_id: existingUser._id,
								},
								updateQuery,
								{
									new: true,
									returnNewDocument: true,
								}
							)

							userRole['_SYSTEM_ID'] = existingUser._id
							userRole.status = 'Success'
						}
					} catch (error) {
						userRole.status = error && error.message ? error.message : error
					}

					userRolesUploadedData.push(userRole)
				}

				return resolve(userRolesUploadedData)
			} catch (error) {
				return reject(error)
			}
		})
	}
	/**
	 * find userExtensions
	 * @method
	 * @name userExtensionDocuments
	 * @param {Array} [userExtensionFilter = "all"] - userId ids.
	 * @param {Array} [fieldsArray = "all"] - projected fields.
	 * @param {Array} [skipFields = "none"] - field not to include
	 * @returns {Array} List of Users.
	 */

	static userExtensionDocuments(userExtensionFilter = 'all', fieldsArray = 'all', skipFields = 'none') {
		return new Promise(async (resolve, reject) => {
			try {
				let queryObject = userExtensionFilter != 'all' ? userExtensionFilter : {}

				let projection = {}

				if (fieldsArray != 'all') {
					fieldsArray.forEach((field) => {
						projection[field] = 1
					})
				}

				if (skipFields !== 'none') {
					skipFields.forEach((field) => {
						projection[field] = 0
					})
				}

				let userDocuments = await database.models.userExtension.find(queryObject, projection).lean()

				return resolve(userDocuments)
			} catch (error) {
				return reject(error)
			}
		})
	}
}

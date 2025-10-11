/**
 * name : addTenantAndOrgInRequest.js
 * author : Mallanagouda R Biradar
 * Date : 26-May-2025
 * Description : addTenantAndOrgInRequest middleware.
 */

module.exports = async function (req, res, next) {
	let paths = [
		'solutions/targetedSolutions',
		'solutions/detailsBasedOnRoleAndLocation',
		'solutions/verifySolution',
		'solutions/details',
		'solutions/verifyLink',
		'userProjects/sync',
		'users/programs',
		'userProjects/details',
		'users/solutions',
	]
	let normalUserPath = ['/programs/publishToLibrary', '/programs/ProgramUpdateForLibrary']

	let addTeanntAndOrgDetails = false

	let performTenantAndOrgCheck = false

	await Promise.all(
		paths.map(async function (path) {
			if (req.path.includes(path)) {
				performTenantAndOrgCheck = true
			}
		})
	)

	await Promise.all(
		normalUserPath.map(async function (path) {
			if (req.path.includes(path)) {
				addTeanntAndOrgDetails = true
			}
		})
	)

	if (performTenantAndOrgCheck) {
		req.body['tenantId'] = req.userDetails.userInformation.tenantId
		req.body['organizations'] = [UTILS.lowerCase(req.userDetails.userInformation.organizationId)]
	}

	if (addTeanntAndOrgDetails) {
		req.userDetails.tenantAndOrgInfo = {}
		req.userDetails.tenantAndOrgInfo.tenantId = req.userDetails.userInformation.tenantId
		req.userDetails.tenantAndOrgInfo.orgId = [req.userDetails.userInformation.organizationId]
	}
	next()
	return
}

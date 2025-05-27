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
		'solutions/verifyLink',
		'userProjects/sync',
		'users/programs',
		'userProjects/details',
	]

	let performTenantAndOrgCheck = false

	await Promise.all(
		paths.map(async function (path) {
			if (req.path.includes(path)) {
				performTenantAndOrgCheck = true
			}
		})
	)

	if (performTenantAndOrgCheck) {
		req.body['tenantId'] = req.userDetails.userInformation.tenantId
		req.body['organizations'] = [req.userDetails.userInformation.organizationId]
	}

	next()
	return
}

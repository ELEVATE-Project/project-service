const observationQueries = require(DB_QUERY_BASE_PATH + '/observations')
const entitiesService = require(GENERICS_FILES_PATH + '/services/entity-management')

module.exports = class observationsHelper {
	/**
	 * observation details.
	 * @method
	 * @name details
	 * @param  {String} observationId observation id.
	 * @returns {details} observation details.
	 */

	static details(userToken, observationId) {
		return new Promise(async (resolve, reject) => {
			try {
				let observationDocument = await observationQueries.observationsDocument({
					_id: observationId,
				})

				if (!observationDocument[0]) {
					throw new Error(CONSTANTS.apiResponses.OBSERVATION_NOT_FOUND)
				}

				if (observationDocument[0].entities.length > 0) {
					let entitiesDocument = await entitiesService.entityDocuments(
						{
							_id: { $in: observationDocument[0].entities },
						},
						'all'
					)

					observationDocument[0]['count'] = entitiesDocument.length
					observationDocument[0].entities = entitiesDocument.data[0]
				}

				return resolve(observationDocument[0])
			} catch (error) {
				return reject(error)
			}
		})
	}
}

/**
 * name         : configurations.js
 * author       : vishnu
 * created-date : 12-Aug-2024
 * Description  : Configuration Related DB interations
 */

// Dependencies
/**
 * Configurations
 * @class
 */

module.exports = class Configurations {
	/**
	 * create or update configurations.
	 * @method
	 * @name createOrUpdate
	 * @param {String} [Code]   - Collection name.
	 * @param  {array} [data]   - Data to update/create the entry
	 * @returns {cursorObject}  - Configuration details.
	 */

	static createOrUpdate(code, data) {
		return new Promise(async (resolve, reject) => {
			try {
				const configCode = code

				// Use findOneAndUpdate for atomic upsert operation
				const updatedConfig = await database.models.configurations.findOneAndUpdate(
					{ code: configCode }, // Filter
					{
						$addToSet: { 'meta.profileKeys': { $each: data } }, // Add keys, ensuring no duplicates
					},
					{
						new: true, // Return the updated document
						upsert: true, // Create the document if it doesn't exist
					}
				)
				return resolve(updatedConfig)
			} catch (error) {
				throw error
			}
		})
	}

	/**
	 * find configuration documents.
	 * @method
	 * @name update
	 * @param {JSON} filterData     - Configuration filter query.
	 * @param {JSON} fieldsArray    - Projection fields.
	 * @returns {JSON}              - Configuration documents details.
	 */

	static findDocument(filterData, fieldsArray = []) {
		return new Promise(async (resolve, reject) => {
			try {
				let configurationDetails = await database.models.configurations.find(filterData, fieldsArray).lean()
				return resolve(configurationDetails)
			} catch (error) {
				return reject(error)
			}
		})
	}
}

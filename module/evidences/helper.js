/**
 * name : helper.js
 * author : prajwal
 * created-date : 27-Nov-2024
 * Description : Evidences related helper functionality
 */

/**
 * Evidences
 * @class
 */

module.exports = class Evidences {
	/**
	 * Extract evidences from csv.
	 * @method
	 * @name extractEvidencesFromCsv
	 * @param {Object} parsedCsvData - Parsed csv data.
	 * @returns {Array} evidences data.
	 */

	static extractEvidencesFromCsv(parsedCsvData) {
		return new Promise(async (resolve, reject) => {
			try {
				let extractedEvidences = []

				for (let evidenceCount = 1; evidenceCount <= 10; evidenceCount++) {
					let evidence = 'evidence' + evidenceCount + '-'
					let evidenceTitle = evidence + 'title'
					let evidenceLink = evidence + 'link'
					let evidenceSeq = evidence + 'sequence'
					let evidenceType = evidence + 'type'

					let evidences = {}

					if (parsedCsvData[evidenceTitle] !== '' && parsedCsvData[evidenceTitle] !== undefined) {
						evidences['title'] = parsedCsvData[evidenceTitle]
						delete parsedCsvData[evidenceTitle]
					}

					if (parsedCsvData[evidenceLink] !== '' && parsedCsvData[evidenceLink] !== undefined) {
						evidences['link'] = parsedCsvData[evidenceLink]
						delete parsedCsvData[evidenceLink]
					}

					if (parsedCsvData[evidenceType] !== '' && parsedCsvData[evidenceType] !== undefined) {
						evidences['type'] = parsedCsvData[evidenceType]
						delete parsedCsvData[evidenceType]
					}

					if (parsedCsvData[evidenceSeq] !== '' && parsedCsvData[evidenceSeq] !== undefined) {
						evidences['seq'] = parsedCsvData[evidenceSeq]
						delete parsedCsvData[evidenceSeq]
					}

					if (Object.keys(evidences).length > 0) {
						extractedEvidences.push(evidences)
					}
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.DUPLICATE_PROJECT_TEMPLATES_CREATED,
					data: extractedEvidences,
				})
			} catch (error) {
				return reject(error)
			}
		})
	}
}

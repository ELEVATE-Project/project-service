/**
 * name : utils.js
 * author : Aman Karki
 * Date : 13-July-2020
 * Description : All utility functions.
 */
// Dependencies
const { validate: uuidValidate, v4: uuidV4 } = require('uuid')
const packageData = require(PROJECT_ROOT_DIRECTORY + '/package.json')
const md5 = require('md5')
const { ChartJSNodeCanvas } = require('chartjs-node-canvas')
const ChartDataLabels = require('chartjs-plugin-datalabels')

// Create a ChartJSNodeCanvas instance
const width = 800 // width of the chart
const height = 500 // height of the chart
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height })
const moment = require('moment')
// const druidQueries = require('./druid_queries.json');
/**
 * convert camel case to title case.
 * @function
 * @name camelCaseToTitleCase
 * @param {String} in_camelCaseString - String of camel case.
 * @returns {String} returns a titleCase string. ex: helloThereMister, o/p: Hello There Mister
 */

function camelCaseToTitleCase(in_camelCaseString) {
	var result = in_camelCaseString // "ToGetYourGEDInTimeASongAboutThe26ABCsIsOfTheEssenceButAPersonalIDCardForUser456InRoom26AContainingABC26TimesIsNotAsEasyAs123ForC3POOrR2D2Or2R2D"
		.replace(/([a-z])([A-Z][a-z])/g, '$1 $2') // "To Get YourGEDIn TimeASong About The26ABCs IsOf The Essence ButAPersonalIDCard For User456In Room26AContainingABC26Times IsNot AsEasy As123ForC3POOrR2D2Or2R2D"
		.replace(/([A-Z][a-z])([A-Z])/g, '$1 $2') // "To Get YourGEDIn TimeASong About The26ABCs Is Of The Essence ButAPersonalIDCard For User456In Room26AContainingABC26Times Is Not As Easy As123ForC3POOr R2D2Or2R2D"
		.replace(/([a-z])([A-Z]+[a-z])/g, '$1 $2') // "To Get Your GEDIn Time ASong About The26ABCs Is Of The Essence But APersonal IDCard For User456In Room26AContainingABC26Times Is Not As Easy As123ForC3POOr R2D2Or2R2D"
		.replace(/([A-Z]+)([A-Z][a-z][a-z])/g, '$1 $2') // "To Get Your GEDIn Time A Song About The26ABCs Is Of The Essence But A Personal ID Card For User456In Room26A ContainingABC26Times Is Not As Easy As123ForC3POOr R2D2Or2R2D"
		.replace(/([a-z]+)([A-Z0-9]+)/g, '$1 $2') // "To Get Your GEDIn Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456In Room 26A Containing ABC26Times Is Not As Easy As 123For C3POOr R2D2Or 2R2D"

		// Note: the next regex includes a special case to exclude plurals of acronyms, e.g. "ABCs"
		.replace(/([A-Z]+)([A-Z][a-rt-z][a-z]*)/g, '$1 $2') // "To Get Your GED In Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456In Room 26A Containing ABC26Times Is Not As Easy As 123For C3PO Or R2D2Or 2R2D"
		.replace(/([0-9])([A-Z][a-z]+)/g, '$1 $2') // "To Get Your GED In Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456In Room 26A Containing ABC 26Times Is Not As Easy As 123For C3PO Or R2D2Or 2R2D"

		// Note: the next two regexes use {2,} instead of + to add space on phrases like Room26A and 26ABCs but not on phrases like R2D2 and C3PO"
		.replace(/([A-Z]{2,})([0-9]{2,})/g, '$1 $2') // "To Get Your GED In Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456 In Room 26A Containing ABC 26 Times Is Not As Easy As 123 For C3PO Or R2D2 Or 2R2D"
		.replace(/([0-9]{2,})([A-Z]{2,})/g, '$1 $2') // "To Get Your GED In Time A Song About The 26 ABCs Is Of The Essence But A Personal ID Card For User 456 In Room 26A Containing ABC 26 Times Is Not As Easy As 123 For C3PO Or R2D2 Or 2R2D"
		.trim()

	// capitalize the first letter
	return result.charAt(0).toUpperCase() + result.slice(1)
}

/**
 * Returns date and time with offset
 * @function
 * @name addOffsetToDateTime
 * @returns {date} returns date and time with offset
 * example:
 * input = Sun Jun 16 2024 23:59:59 GMT+0000 (Coordinated Universal Time), +05:30
 * output = Sun Jun 16 2024 18:29:59 GMT+0000 (Coordinated Universal Time)
 */

function addOffsetToDateTime(time, timeZoneDifference) {
	//get the offset time from env with respect UTC
	let localTimeZone = timeZoneDifference
	//convert offset time to minutes
	let localTime = localTimeZone.split(':')
	let localHourDifference = Number(localTime[0])
	let getTimeDiffInMinutes =
		localHourDifference * 60 + (localHourDifference / Math.abs(localHourDifference)) * Number(localTime[1])
	//get server offset time w.r.t. UTC time
	let timeDifference = new Date().getTimezoneOffset()
	//get actual time difference in minutes
	let differenceWithLocal = timeDifference + getTimeDiffInMinutes
	// if its 0 then return same time
	if (differenceWithLocal === 0) {
		return time
	} else {
		// set time difference
		let getMinutes = differenceWithLocal % 60
		let getHours = (differenceWithLocal - getMinutes) / 60
		time.setHours(time.getHours() - getHours)
		time.setMinutes(time.getMinutes() - getMinutes)
		return time
	}
}

/**
 * Generates a chart image buffer using ChartJSNodeCanvas.
 *
 * @param {Object} data - The chart configuration object that contains data, type, options, etc.
 * @returns {Promise<Buffer>} - A Promise that resolves to a Buffer containing the chart image.
 * @throws {Error} - Throws an error if the chart generation fails.
 */
async function generateChart(data) {
	return new Promise(async (resolve, reject) => {
		// Render the chart to a buffer
		chartJSNodeCanvas
			.renderToBuffer(data)
			.then((buffer) => {
				resolve(buffer)
			})
			.catch((err) => {
				reject(err)
			})
	})
}

/**
 * Return druid query for the given query name
 * @function
 * @name getDruidQuery
 * @returns {Array}  returns druid query.
 */

function getDruidQuery(name) {
	let query = {}

	if (druidQueries[name]) {
		query = JSON.parse(JSON.stringify(druidQueries[name]))
	}

	return query
}

/**
 * Convert hyphen case string to camelCase.
 * @function
 * @name hyphenCaseToCamelCase
 * @param {String} string - String in hyphen case.
 * @returns {String} returns a camelCase string.
 */

function hyphenCaseToCamelCase(string) {
	return string.replace(/-([a-z])/g, function (g) {
		return g[1].toUpperCase()
	})
}

/**
 * convert string to lowerCase.
 * @function
 * @name lowerCase
 * @param {String} str
 * @returns {String} returns a lowercase string. ex: HELLO, o/p: hello
 */

function lowerCase(str) {
	return str.toLowerCase()
}

/**
 * check whether the given string is url.
 * @function
 * @name checkIfStringIsUrl - check whether string is url or not.
 * @param {String} str
 * @returns {Boolean} returns a Boolean value. ex:"http://example.com:3000/pathname/?search=test" , o/p:true
 */

function checkIfStringIsUrl(str) {
	var pattern = new RegExp(
		'^(https?:\\/\\/)?' + // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
			'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
			'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
			'(\\#[-a-z\\d_]*)?$',
		'i'
	) // fragment locator
	return pattern.test(str)
}

/**
 * Parse a single column.
 * @function
 * @name valueParser - Parse value
 * @param {String} dataToBeParsed - data to be parsed.
 * @returns {Object} returns parsed data
 */

function valueParser(dataToBeParsed) {
	let parsedData = {}

	Object.keys(dataToBeParsed).forEach((eachDataToBeParsed) => {
		parsedData[eachDataToBeParsed] = dataToBeParsed[eachDataToBeParsed].trim()
	})

	// Check if 'categories' field exists in dataToBeParsed before setting a default value
	if ('categories' in dataToBeParsed) {
		if (!parsedData.categories || parsedData.categories.trim() === '') {
			parsedData.categories = process.env.DEFAULT_PROJECT_CATEGORY
		}
	}

	if (parsedData._arrayFields && parsedData._arrayFields.split(',').length > 0) {
		parsedData._arrayFields.split(',').forEach((arrayTypeField) => {
			if (parsedData[arrayTypeField]) {
				parsedData[arrayTypeField] = parsedData[arrayTypeField].split(',')
			}
		})
	}

	return parsedData
}

/**
 * Convert string to boolean.
 * @method
 * @name convertStringToBoolean
 * @param {String} stringData -String data.
 * @returns {Boolean} - Boolean data.
 */

function convertStringToBoolean(stringData) {
	let stringToBoolean = stringData === 'TRUE' || stringData === 'true' || stringData === true
	return stringToBoolean
}

/**
 * List of boolean data from a given model.
 * @method
 * @name getAllBooleanDataFromModels
 * @param schema - schema
 * @returns {Array} Boolean data.
 */

function getAllBooleanDataFromModels(schema) {
	let defaultSchema = Object.keys(schema)

	let booleanValues = []

	defaultSchema.forEach((singleSchemaKey) => {
		let currentSchema = schema[singleSchemaKey]

		if (currentSchema.hasOwnProperty('default') && typeof currentSchema.default === 'boolean') {
			booleanValues.push(singleSchemaKey)
		}
	})

	return booleanValues
}

/**
 * check whether id is mongodbId or not.
 * @function
 * @name isValidMongoId
 * @param {String} id
 * @returns {Boolean} returns whether id is valid mongodb id or not.
 */

function isValidMongoId(id) {
	return ObjectId.isValid(id) && new ObjectId(id).toString() === id
}

/**
 * Get epoch time from current date.
 * @function
 * @name epochTime
 * @returns {Date} returns epoch time.
 */

function epochTime() {
	var currentDate = new Date()
	currentDate = currentDate.getTime()
	return currentDate
}

/**
 * Convert Project Status
 * @function
 * @name convertProjectStatus
 * @returns {String} returns converted project status
 */

function convertProjectStatus(status) {
	let convertedStatus

	if (status == CONSTANTS.common.NOT_STARTED_STATUS) {
		convertedStatus = CONSTANTS.common.STARTED
	} else if (status == CONSTANTS.common.COMPLETED_STATUS) {
		convertedStatus = CONSTANTS.common.SUBMITTED_STATUS
	} else {
		convertedStatus = status
	}

	return convertedStatus
}

/**
 * Revert Project Status For Older App
 * @function
 * @name revertProjectStatus
 * @returns {String} returns reverted project status
 */

function revertProjectStatus(status) {
	let revertedStatus

	if (status == CONSTANTS.common.STARTED) {
		revertedStatus = CONSTANTS.common.NOT_STARTED_STATUS
	} else if (status == CONSTANTS.common.SUBMITTED_STATUS) {
		revertedStatus = CONSTANTS.common.COMPLETED_STATUS
	} else {
		revertedStatus = status
	}

	return revertedStatus
}

/**
 * revert status or not
 * @method
 * @name revertStatusorNot
 * @param {String} appVersion - app Version.
 * @returns {Boolean} - true or false
 */

function revertStatusorNot(appVersion) {
	let versions = ['4.10', '4.11', '4.12']

	let appVer = appVersion.split('.', 2).join('.')
	if (versions.includes(appVer)) {
		return false
	} else {
		let appVersionNo = Number(appVer)
		if (!isNaN(appVersionNo) && appVersionNo < 4.7) {
			return true
		} else {
			return false
		}
	}
}

/**
 * check whether string is valid uuid.
 * @function
 * @name checkValidUUID
 * @param {String} uuids
 * @returns {Boolean} returns a Boolean value true/false
 */

function checkValidUUID(uuids) {
	var validateUUID = true
	if (Array.isArray(uuids)) {
		for (var i = 0; uuids.length > i; i++) {
			if (!uuidValidate(uuids[i])) {
				validateUUID = false
			}
		}
	} else {
		validateUUID = uuidValidate(uuids)
	}
	return validateUUID
}

/**
 * make dates comparable
 * @function
 * @name createComparableDates
 * @param {String} dateArg1
 * @param {String} dateArg2
 * @returns {Object} - date object
 */

function createComparableDates(dateArg1, dateArg2) {
	let date1
	if (typeof dateArg1 === 'string') {
		date1 = new Date(dateArg1.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3'))
	} else {
		date1 = new Date(dateArg1)
	}

	let date2
	if (typeof dateArg2 === 'string') {
		date2 = new Date(dateArg2.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3'))
	} else {
		date2 = new Date(dateArg2)
	}

	date1.setHours(0)
	date1.setMinutes(0)
	date1.setSeconds(0)
	date2.setHours(0)
	date2.setMinutes(0)
	date2.setSeconds(0)
	return {
		dateOne: date1,
		dateTwo: date2,
	}
}

/**
 * count attachments
 * @function
 * @name noOfElementsInArray
 * @param {Object} data - data to count
 * @param {Object} filter -  filter data
 * @returns {Number} - attachment count
 */

function noOfElementsInArray(data, filter = {}) {
	if (!filter || !Object.keys(filter).length > 0) {
		return data.length
	}
	if (!data.length > 0) {
		return 0
	} else {
		if (filter.value == 'all') {
			return data.length
		} else {
			let count = 0
			for (let attachment = 0; attachment < data.length; attachment++) {
				if (data[attachment][filter.key] == filter.value) {
					count++
				}
			}
			return count
		}
	}
}

/**
 * validate lhs and rhs using operator passed as String/ Number
 * @function
 * @name operatorValidation
 * @param {Number or String} valueLhs
 * @param {Number or String} valueRhs
 * @returns {Boolean} - validation result
 */

function operatorValidation(valueLhs, valueRhs, operator) {
	return new Promise(async (resolve, reject) => {
		let result = false
		if (operator == '==') {
			result = valueLhs == valueRhs ? true : false
		} else if (operator == '!=') {
			result = valueLhs != valueRhs ? true : false
		} else if (operator == '>') {
			result = valueLhs > valueRhs ? true : false
		} else if (operator == '<') {
			result = valueLhs < valueRhs ? true : false
		} else if (operator == '<=') {
			result = valueLhs <= valueRhs ? true : false
		} else if (operator == '>=') {
			result = valueLhs >= valueRhs ? true : false
		}
		return resolve(result)
	})
}

/**
 * Returns endDate if time is not passed it will add default time with offset to utc
 * @function
 * @name getEndDate
 * @returns {date} returns date and time with offset
 * example:
 * input = 2024-06-16, +05:30
 * output = Sun Jun 16 2024 18:29:59 GMT+0000 (Coordinated Universal Time)
 */
function getEndDate(date, timeZoneDifference) {
	let endDate = date.split(' ')
	if (endDate[1] === '' || endDate[1] === undefined) {
		date = endDate[0] + ' 23:59:59'
	}
	date = new Date(date)
	date = addOffsetToDateTime(date, timeZoneDifference)
	return date
}

/**
 * Returns startDate if time is not passed it will add default time with offset to utc
 * @function
 * @name getStartDate
 * @returns {date} returns date and time with offset
 * example:
 * input = 2022-06-01, +05:30
 * output = Wed Jan 31 2001 18:30:00 GMT+0000 (Coordinated Universal Time)
 */
function getStartDate(date, timeZoneDifference) {
	let startDate = date.split(' ')
	if (startDate[1] === '' || startDate[1] === undefined) {
		date = startDate[0] + ' 00:00:00'
	}
	date = new Date(date)
	date = addOffsetToDateTime(date, timeZoneDifference)
	return date
}

/**
 * Convert string to mongodb object id.
 * @method
 * @name convertStringToObjectId
 * @param id - string id
 * @returns {ObjectId} - returns objectId
 */

function convertStringToObjectId(id) {
	let checkWhetherIdIsValidMongoId = this.isValidMongoId(id)
	if (checkWhetherIdIsValidMongoId) {
		id = ObjectId(id)
	}

	return id
}

/**
 * filter out location id and code
 * @function
 * @name filterLocationIdandCode
 * @returns {Object} - Object contain locationid and location code array.
 */

function filterLocationIdandCode(dataArray) {
	let locationIds = []
	let locationCodes = []
	dataArray.forEach((element) => {
		if (this.checkValidUUID(element)) {
			locationIds.push(element)
		} else {
			locationCodes.push(element)
		}
	})
	return {
		ids: locationIds,
		codes: locationCodes,
	}
}

/**
 * Generate unique id.s
 * @method
 * @name generateUniqueId
 * @returns {String} - unique id
 */

function generateUniqueId() {
	return uuidV4()
}

/**
 * generate skeleton telemetry raw event
 * @function
 * @name generateTelemetryEventSkeletonStructure
 * @returns {Object} returns uuid.
 */
function generateTelemetryEventSkeletonStructure() {
	let telemetrySkeleton = {
		eid: '',
		ets: epochTime(),
		ver: CONSTANTS.common.TELEMETRY_VERSION,
		mid: generateUUId(),
		actor: {},
		context: {
			channel: '',
			pdata: {
				id: process.env.ID,
				ver: packageData.version,
			},
			env: '',
			cdata: [],
			rollup: {},
		},
		object: {},
		edata: {},
	}
	return telemetrySkeleton
}

/**
 * generate telemetry event
 * @function
 * @name generateTelemetryEvent
 * @returns {Object} returns uuid.
 */
function generateTelemetryEvent(rawEvent) {
	let telemetryEvent = {
		timestamp: new Date(),
		msg: JSON.stringify(rawEvent),
		lname: '',
		tname: '',
		level: '',
		HOSTNAME: '',
		'application.home': '',
	}
	return telemetryEvent
}

/**
 * Calculate the difference in days between two dates.
 * @param {Date} startDate - The first date.
 * @param {Date} endDate - The second date.
 * @returns {number} The difference in days between the two dates (b - a).
 */
function dateDiffInDays(startDate, endDate) {
	// Get the UTC timestamps for the start date and end date (ignoring time and timezone)
	const utc1 = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
	const utc2 = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
	return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24))
}

/**
 * check the uuid is valid
 * @function
 * @name checkIfValidUUID
 * @returns {String} returns boolean.
 */

function checkIfValidUUID(value) {
	const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi
	return regexExp.test(value)
}

/**
 * md5 hash
 * @function
 * @name md5Hash
 * @returns {String} returns hashed value.
 */

function md5Hash(value) {
	return md5(value)
}

/**
 * arrayIdsTobjectIds
 * @function
 * @name arrayIdsTobjectIds
 * @returns {String} returns array of object ids.
 */
function arrayIdsTobjectIds(ids) {
	return ids.map((id) => ObjectId(id))
}

/**
 * Convert ISO 8601 date string to readable format
 * @method
 * @name formatISODate
 * @param {String} isoDate - ISO 8601 date string.
 * @returns {String} - Formatted date string to human readable date.
 */
function formatISODateToReadableDate(isoDate) {
	// Convert the ISO 8601 date string to a Date object
	const date = new Date(isoDate)

	// Define options for the desired date format
	const options = {
		day: '2-digit', // e.g., 16
		month: 'long', // e.g., July
		year: 'numeric', // e.g., 2024
	}

	const readableDate = date.toLocaleDateString('en-GB', options)
	return readableDate
}

/**
 * Handle special characters in the certificate
 * @function
 * @name handleSpecialCharsForCertificate
 * @param {String} projectTitle - Title of the project.
 * @returns {String} - Modified title of the project.
 */
function handleSpecialCharsForCertificate(projectTitle) {
	// Object containing special characters as keys and their corresponding escaped values
	const charsReservedInSvg = {
		[`<`]: `&lt;`, // Less than sign
		[`>`]: `&gt;`, // Greater than sign
		[`&`]: `&amp;`, // Ampersand
		[`"`]: `&quot;`, // Double quote
		[`'`]: `&apos;`, // Single quote
	}

	let modifiedProjectTitle = ''

	// Loop through each character of the project title
	for (let i = 0; i < projectTitle.length; i++) {
		// Check if the current character is a reserved character in SVG, If it is, append the escaped version of the character
		if (projectTitle[i] in charsReservedInSvg) {
			modifiedProjectTitle += charsReservedInSvg[projectTitle[i]]
		} else {
			// If not, append the character as is
			modifiedProjectTitle += projectTitle[i]
		}
	}

	// Return the modified project title with special characters escaped
	return modifiedProjectTitle
}

function arrayOfObjectToArrayOfObjectId(ids) {
	return ids.map((obj) => obj._id)
}

/**
 * Handle translation
 * @function
 * @name getTranslatedData
 * @param {String} data - Data to be translate.
 * @param {String} translateData - translation data
 * @returns {Object} - Modified data object with translation.
 */
function getTranslatedData(data, translateData) {
	// Object Keys Which not to be replaces Completely
	let customTranslationKeys = []
	Object.keys(data).forEach((item) => {
		if (Array.isArray(data[item]) && data[item].every((ele) => typeof ele === 'object' && ele != null)) {
			customTranslationKeys.push(item)
		}
	})
	Object.keys(data).forEach((eachValue) => {
		if (customTranslationKeys.includes(eachValue) && Array.isArray(data[eachValue])) {
			data[eachValue].forEach((item, index) => {
				Object.keys(item).forEach((fieldKey) => {
					if (
						translateData[eachValue] &&
						translateData[eachValue][fieldKey] &&
						translateData[eachValue][fieldKey][index]
					) {
						item[fieldKey] = translateData[eachValue][fieldKey][index]
					}
				})
			})
		} else {
			if (Object.keys(translateData).includes(eachValue)) {
				data[eachValue] = translateData[eachValue]
			}
		}
	})
	return data
}

/**
 * Function to calculate the end date based on a start date and duration string.
 * @param {string} createdDate - The start date in ISO format (e.g., '2024-12-05T00:00:00.000Z').
 * @param {string} durationInDays - Number of days.
 * @returns {string} - The calculated end date in ISO format
 */
function calculateEndDate(createdDate, durationInDays) {
	const startDate = moment(createdDate) // Parse the start date
	if (!startDate.isValid()) {
		throw new Error('Invalid start date format')
	}

	if (typeof durationInDays !== 'number' || durationInDays < 0) {
		throw new Error('Duration must be a valid non-negative number')
	}

	return startDate.add(durationInDays, 'days').toISOString()
}

/**
 * Generate externalId from title
 * @name generateExternalId
 * @param {String} title - title
 * @returns {String} - ExternalId
 */

function generateExternalId(title) {
	const words = title.split(/[\s-]+/)
	const abbreviation = words.map((word) => (word[0] || '').toUpperCase()).join('')
	const uniqueSuffix = Date.now()
	return `${abbreviation}-${uniqueSuffix}`
}

/**
 * Format category Name
 * @name formatToTitleCase
 * @param {String} value - category
 * @returns {String} - Category
 */
function formatToTitleCase(value) {
	return value
		.replace(/_/g, ' ') // Replace underscores with spaces
		.replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize the first letter of each word
		.trim() // Ensure no leading or trailing spaces
}

/**
 * Format keywords
 * @param {Array|String} keywords - Keywords
 * @returns {Array} - Formatted keywords
 */
function formatKeywords(keywords) {
	if (Array.isArray(keywords)) return keywords.map((k) => k.trim())
	if (typeof keywords === 'string') return keywords.split(',').map((k) => k.trim())
	return []
}

/**
 * Format meta-information
 * @param {Object} templateData - Template data
 * @returns {Object} - Meta-information
 */
function formatMetaInformation(templateData) {
	return {
		duration: `${templateData.recommended_duration.number} ${templateData.recommended_duration.duration}`,
		goal: '',
		rationale: '',
		primaryAudience: '',
		successIndicators: '',
		risks: '',
		approaches: '',
	}
}

/**
 * Function to convert duration in various units (week, month, year) to days.
 * @param {string} duration - Duration string, e.g., "1 week", "2 months".
 * @returns {number} - Duration in days.
 */
function convertDurationToDays(duration) {
	const [value, unit] = duration.split(' ')
	const numericValue = parseInt(value, 10)

	switch (unit.toLowerCase()) {
		case 'day':
		case 'days':
			return numericValue
		case 'week':
		case 'weeks':
			return numericValue * 7
		case 'month':
		case 'months':
			return numericValue * 30 // Approximation
		case 'year':
		case 'years':
			return numericValue * 365 // Approximation
		default:
			throw new Error(`Unsupported duration unit: ${unit}`)
	}
}

/**
 * Generates a MongoDB query filter based on factor scopes and user role information.
 *
 * @param {string[]} factors - An array of factor names used to construct scoped keys.
 * @param {Object.<string, string|string[]>} userRoleInfo - An object where keys are factor names and values are either comma-separated strings or arrays of values.
 * @returns {Object[]} An array of query filter objects for MongoDB.
 */
function factorQuery(factors, userRoleInfo) {
	let queryFilter = []

	for (let idx = 0; idx < factors.length; idx++) {
		let factor = factors[idx]
		let scope = 'scope.' + factor
		let rawValues = userRoleInfo[factor]
		let valueArray

		if (rawValues === undefined || rawValues === null) {
			valueArray = [CONSTANTS.common.ALL_SCOPE_VALUE]
		} else if (Array.isArray(rawValues)) {
			valueArray = [...rawValues, CONSTANTS.common.ALL_SCOPE_VALUE]
		} else if (typeof rawValues === 'string') {
			const splitValues = rawValues
				.split(',')
				.map((v) => v.trim())
				.filter(Boolean)
			valueArray = [...splitValues, CONSTANTS.common.ALL_SCOPE_VALUE]
		}

		queryFilter.push({ [scope]: { $in: valueArray } })
	}

	return queryFilter
}

/**
 * Convert Learning Resource
 * @name convertResources
 * @param {Array} resources - learning resource data
 * @returns {Object} - Response contains formatted learning resource
 */
const convertResources = (resources) =>
	resources
		.filter((resource) => resource.url) // Ensure `url` exists
		.map((resource) => ({
			name: resource.name || 'resource',
			link: resource.url,
			app: CONSTANTS.common.APP_ELEVATE_PROJECT,
			id: resource.url.split('/').pop(), // Extract the last part of the URL
		}))

/**
 * Checks if the user has admin-level roles.
 * @param {string[]} roles - Array of user role strings.
 * @param {string[]} roleToCheck - Array of user role to validate strings.
 * @returns {boolean} True if user has ADMIN or TENANT_ADMIN role, else false.
 */
function validateRoles(roles, roleToCheck) {
	return roles.some((role) => roleToCheck.includes(role))
}

/**
 * Extracts mandatory and optional scope factors from tenant metadata.
 *
 * @param {Object} tenantMeta - Metadata object containing scope configuration fields.
 * @param {string} mandatoryKey - Key name in tenantMeta for mandatory scope fields.
 * @param {string} optionalKey - Key name in tenantMeta for optional scope fields.
 * @returns {{ mandatoryFactors: string[], optionalFactors: string[] }}
 *          An object containing arrays of mandatory and optional factors.
 */
function extractScopeFactors(tenantMeta, mandatoryKey, optionalKey) {
	const factors = []
	const optionalFactors = []

	if (
		tenantMeta.hasOwnProperty(mandatoryKey) &&
		Array.isArray(tenantMeta[mandatoryKey]) &&
		tenantMeta[mandatoryKey].length > 0
	) {
		factors.push(...tenantMeta[mandatoryKey])
	}

	if (
		tenantMeta.hasOwnProperty(optionalKey) &&
		Array.isArray(tenantMeta[optionalKey]) &&
		tenantMeta[optionalKey].length > 0
	) {
		optionalFactors.push(...tenantMeta[optionalKey])
	}

	return {
		mandatoryFactors: factors,
		optionalFactors: optionalFactors,
	}
}
/**
 * Generates a MongoDB filter query with optional conditions ($or) always nested inside $and.
 *
 * @param {Object} bodyData - The data to evaluate against factors.
 * @param {Object} tenantMeta - Metadata containing scope definitions.
 * @param {Array<string>} mandatoryField - List of mandatory scope fields.
 * @param {Array<string>} optionalField - List of optional scope fields.
 * @returns {Object} MongoDB filter query.
 */
function targetingQuery(bodyData, tenantMeta, mandatoryField, optionalField) {
	let { mandatoryFactors, optionalFactors } = extractScopeFactors(tenantMeta, mandatoryField, optionalField)

	const andClauses = []

	// Add mandatory conditions if any
	if (Array.isArray(mandatoryFactors) && mandatoryFactors.length > 0) {
		const mandatoryQuery = UTILS.factorQuery(mandatoryFactors, bodyData)
		if (Array.isArray(mandatoryQuery) && mandatoryQuery.length > 0) {
			andClauses.push(...mandatoryQuery)
		}
	}

	// Add optional conditions as $or inside $and
	if (Array.isArray(optionalFactors) && optionalFactors.length > 0) {
		const optionalQuery = UTILS.factorQuery(optionalFactors, bodyData)
		if (Array.isArray(optionalQuery) && optionalQuery.length > 0) {
			andClauses.push({ $or: optionalQuery })
		}
	}

	let filterQuery = andClauses.length > 0 ? { $and: andClauses } : {}

	return filterQuery
}

/**
 * Filters and formats the scope data based on tenant metadata.
 *
 * - Only includes fields defined in mandatory and optional scope fields.
 * - Mandatory fields are always included: if not present or falsy in scopeData, defaults to ['ALL'].
 * - Optional fields are included only if present and truthy in scopeData.
 *
 * @param {Object} scopeData - The input scope object with field values.
 * @param {Object} tenantPublicDetailsMetaField - Metadata defining mandatory and optional scope fields.
 * @param {Object} messageConstants - Constants object containing ALL_SCOPE_VALUE and field keys.
 * @returns {Object} - The filtered scope object with valid fields and values.
 */
function getFilteredScope(scopeData, tenantPublicDetailsMetaField) {
	const mandatoryFields = tenantPublicDetailsMetaField[CONSTANTS.common.MANDATORY_SCOPE_FIELD] || []
	const optionalFields = tenantPublicDetailsMetaField[CONSTANTS.common.OPTIONAL_SCOPE_FIELD] || []

	const allAllowedFields = [...mandatoryFields, ...optionalFields]
	const filteredScope = {}

	for (const field of allAllowedFields) {
		const value = scopeData[field]

		if (value) {
			filteredScope[field] = value
		} else if (mandatoryFields.includes(field)) {
			filteredScope[field] = [CONSTANTS.common.ALL_SCOPE_VALUE]
		}
	}

	return filteredScope
}

module.exports = {
	camelCaseToTitleCase: camelCaseToTitleCase,
	lowerCase: lowerCase,
	checkIfStringIsUrl: checkIfStringIsUrl,
	hyphenCaseToCamelCase: hyphenCaseToCamelCase,
	valueParser: valueParser,
	convertStringToBoolean: convertStringToBoolean,
	getAllBooleanDataFromModels: getAllBooleanDataFromModels,
	epochTime: epochTime,
	isValidMongoId: isValidMongoId,
	convertProjectStatus: convertProjectStatus,
	revertProjectStatus: revertProjectStatus,
	revertStatusorNot: revertStatusorNot,
	checkValidUUID: checkValidUUID,
	createComparableDates: createComparableDates,
	noOfElementsInArray: noOfElementsInArray,
	operatorValidation: operatorValidation,
	generateUniqueId: generateUniqueId,
	getEndDate: getEndDate,
	getStartDate: getStartDate,
	convertStringToObjectId: convertStringToObjectId,
	filterLocationIdandCode: filterLocationIdandCode,
	generateTelemetryEventSkeletonStructure: generateTelemetryEventSkeletonStructure,
	generateTelemetryEvent: generateTelemetryEvent,
	checkIfValidUUID: checkIfValidUUID,
	md5Hash: md5Hash,
	dateDiffInDays: dateDiffInDays,
	arrayIdsTobjectIds: arrayIdsTobjectIds,
	formatISODateToReadableDate: formatISODateToReadableDate,
	generateChart: generateChart,
	handleSpecialCharsForCertificate: handleSpecialCharsForCertificate,
	arrayOfObjectToArrayOfObjectId: arrayOfObjectToArrayOfObjectId,
	getTranslatedData: getTranslatedData,
	calculateEndDate: calculateEndDate,
	generateExternalId,
	formatToTitleCase,
	formatKeywords,
	formatMetaInformation,
	convertResources,
	convertDurationToDays,
	factorQuery,
	validateRoles,
	targetingQuery,
	getFilteredScope,
}

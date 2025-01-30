/**
 * name : updateDurationInDaysForReusableTemplates.js
 * author : Vishnu
 * created-date : 29-Jan-2025
 * Description : Migration script for updating project templates with durationInDays field
 */

const path = require('path')
let rootPath = path.join(__dirname, '../../')
require('dotenv').config({ path: rootPath + '/.env' })

let _ = require('lodash')
let mongoUrl = process.env.MONGODB_URL
let dbName = mongoUrl.split('/').pop()
let url = mongoUrl.split(dbName)[0]
var MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID

var fs = require('fs')

// Function to validate if the duration is in the correct format of {number} {unit}
function isValidDurationFormat(duration) {
	const regex = /^\d+\s(day|days|week|weeks|month|months|year|years)$/i
	return regex.test(duration)
}

// Function to convert valid duration to days
async function convertDurationToDays(duration) {
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

;(async () => {
	let connection = await MongoClient.connect(url, { useNewUrlParser: true })
	let db = connection.db(dbName)
	try {
		let updatedProjectIds = []
		let invalidDurationIds = []

		// Get all project templates with isReusable = true and valid duration field
		let projectTemplates = await db
			.collection('projectTemplates')
			.find({
				isReusable: true,
				'metaInformation.duration': { $exists: true, $ne: '' },
			})
			.project({ _id: 1, 'metaInformation.duration': 1 })
			.toArray()

		let chunkOfProjectTemplates = _.chunk(projectTemplates, 10)
		let projectTemplateIds
		console.log('chunkOfProjectTemplates :', chunkOfProjectTemplates)

		for (let pointerToTemplate = 0; pointerToTemplate < chunkOfProjectTemplates.length; pointerToTemplate++) {
			projectTemplateIds = chunkOfProjectTemplates[pointerToTemplate].map((template) => template._id)

			// Get project templates
			let templates = await db
				.collection('projectTemplates')
				.find({
					_id: { $in: projectTemplateIds },
				})
				.project({ _id: 1, 'metaInformation.duration': 1 })
				.toArray()

			// Iterate through each template and process the duration field
			for (let counter = 0; counter < templates.length; counter++) {
				let template = templates[counter]
				let duration = template.metaInformation.duration
				console.log('duration----', duration)
				// Validate duration format
				if (isValidDurationFormat(duration)) {
					try {
						// If duration is in valid format, convert to days
						let days = await convertDurationToDays(duration)
						console.log('corresponding days: ', days)
						// Update the project template with the calculated durationInDays
						await db.collection('projectTemplates').findOneAndUpdate(
							{ _id: template._id },
							{
								$set: { durationInDays: days },
							}
						)

						updatedProjectIds.push(template._id)
					} catch (error) {
						console.error(
							`Error converting duration for template ID: ${template._id} with duration: ${duration}`
						)
					}
				} else {
					// If duration format is invalid, log the template ID as invalid
					invalidDurationIds.push(template._id)
					console.error(`Invalid duration format in template ID: ${template._id} with duration: ${duration}`)
				}
			}

			// Write the updated template IDs to a file
			fs.writeFile(
				'updatedProjectTemplateIds.json',
				JSON.stringify({ updatedProjectIds: updatedProjectIds, invalidDurationIds: invalidDurationIds }),
				function (err) {
					if (err) {
						console.error('Error writing updated IDs to file')
					}
				}
			)
		}

		console.log('Updated Templates Count: ', updatedProjectIds.length)
		console.log('Invalid Duration Templates Count: ', invalidDurationIds.length)
		console.log('Migration Completed')
		connection.close()
	} catch (error) {
		console.log(error)
	}
})().catch((err) => console.error(err))

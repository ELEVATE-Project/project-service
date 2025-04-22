const mongoose = require('mongoose')
const axios = require('axios')

// MongoDB URL and Collection
const mongoURL = 'mongodb://localhost:27017/elevate-project'
const collectionName = 'forms'

// Postgres DB connection
const { Client } = require('pg')
const client = new Client({
	connectionString: 'postgres://postgres:postgres@localhost:9700/scp',
})

// Connect to MongoDB
mongoose
	.connect(mongoURL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('Connected to MongoDB')
	})
	.catch((err) => {
		console.error('Failed to connect to MongoDB', err)
	})

// Define schema for forms collection (adjust fields based on JSON structure)
const formSchema = new mongoose.Schema({}, { strict: false })
const Form = mongoose.model(collectionName, formSchema)

// Fetch JSON data from URL and insert into MongoDB
async function fetchAndInsertProjectData() {
	try {
		await client.connect()
		const response = await axios.get(
			'https://raw.githubusercontent.com/ELEVATE-Project/observation-survey-projects-pwa/refs/heads/release-2.0.0/forms.json'
		)
		const data = response.data

		const modifiedData = data.map((form) => ({
			...form,
			organizationId: 1,
			deleted: false,
			version: 0,
		}))

		// Insert modified data into the forms collection
		await Form.insertMany(modifiedData)
		console.log('Data inserted successfully')
	} catch (error) {
		console.error('Error fetching or inserting data:', error)
	} finally {
		mongoose.connection.close()
	}
}

async function fetchAndInsertSCPData() {
	try {
		const response = await axios.get(
			'https://raw.githubusercontent.com/ELEVATE-Project/self-creation-portal/refs/heads/sprint-5/forms.json'
		)
		const forms = response.data

		for (const form of forms) {
			// Pull values from JSON, set defaults
			const { type, sub_type, data } = form

			// Insert with raw SQL
			const query = `
				INSERT INTO forms (type, sub_type, data, organization_id, version)
				VALUES ($1, $2, $3, $4, $5, $6, $7)
			`

			const values = [type, sub_type, data, 1, 0]
			await client.query(query, values)
		}
		console.log('Data inserted successfully')
	} catch (error) {
		console.error('Error fetching or inserting data:', error)
	} finally {
		mongoose.connection.close()
	}
}

// Execute the function
fetchAndInsertProjectData()
fetchAndInsertSCPData()

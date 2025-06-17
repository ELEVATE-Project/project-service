/**
 * name : app.js.
 * author : Aman Karki.
 * created-date : 13-July-2020.
 * Description : Root file.
 */
require('module-alias/register')
require('dotenv').config()
var fs = require('fs')

// Express
const express = require('express')
const app = express()
const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()

// Setup application config, establish DB connections and set global constants.
require('@config/globals')()
require('@config/connections')
require('@config/cloud-service')

// Check if all environment variables are provided.
const environmentData = require('@envVariables')()
if (!environmentData.success) {
	logger.error('Server could not start . Not all environment variable is provided', {
		triggerNotification: true,
	})
	process.exit()
}
// Health check
require('@healthCheck')(app)
// Required modules
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const expressValidator = require('express-validator')

// Enable CORS
app.use(cors())
app.use(expressValidator())

app.use(fileUpload())
app.use(bodyParser.json({ limit: '50MB' }))
app.use(bodyParser.urlencoded({ limit: '50MB', extended: false }))

app.use(express.static('public'))

app.get(process.env.API_DOC_URL, function (req, res) {
	res.sendFile(path.join(__dirname, './api-doc/index.html'))
})

app.all('*', (req, res, next) => {
	console.log({ 'Debugging ML Projects Service': true })
	console.log('<------------Request log starts here------------------>')
	console.log('Request URL: ', req.url)
	console.log('Request Headers: ', JSON.stringify(req.headers))
	console.log('Request Body: ', JSON.stringify(req.body))
	// console.log("Request Files: ", req.files);
	console.log('<---------------Request log ends here------------------>')
	next()
})

// Router module
const router = require('@routes')

// Add routing
router(app)

// Listen to the given port
app.listen(process.env.APPLICATION_PORT, () => {
	console.log('Environment : ' + process.env.APPLICATION_ENV)
	console.log('Application is running on the port : ' + process.env.APPLICATION_PORT)
})

let dir = './tmp'
if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir)
}

module.exports = app

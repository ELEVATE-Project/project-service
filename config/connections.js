/**
 * name : index.js
 * author : Aman Karki
 * created-date : 13-July-2020
 * Description : Configurations related information.
 */

/**
 * Mongodb Database configuration.
 * @function
 * @name mongodb_connect
 * @param {Object} configuration - mongodb database configuration.
 */

const mongodb_connect = function () {
	global.database = require('./db/mongodb')()
	global.ObjectId = database.ObjectId
	global.Abstract = require('../generics/abstract')
}

/**
 * Kafka connection.
 * @function
 * @name kafka_connect
 */

const kafka_connect = function () {
	global.kafkaClient = require('./kafka')()
}

// Configuration data.

const configuration = {
	name: 'ml-project-api',
}

mongodb_connect()
kafka_connect()

module.exports = configuration

/**
 * name : globals.js
 * author : Aman Karki
 * created-date : 13-July-2020
 * Description : Globals data with path aliases.
 */

require('module-alias/register') // Register module aliases

const fs = require('fs')
const path = require('path')
const requireAll = require('require-all')

module.exports = function () {
	global.async = require('async')
	global.PROJECT_ROOT_DIRECTORY = path.join(__dirname, '..')
	global.MODULES_BASE_PATH = '@modules'
	global.DB_QUERY_BASE_PATH = '@databaseQueries'
	global.GENERICS_FILES_PATH = '@generics'
	global.SERVICES_BASE_PATH = '@services'
	global.GENERIC_HELPERS_PATH = '@helpers'
	global._ = require('lodash')
	global.UTILS = require('@helpers/utils')

	global.CSV_FILE_STREAM = require('@generics/file-stream')
	require('@root/config/connections')

	global.HTTP_STATUS_CODE = require('@generics/http-status-codes')

	// Load database models.
	global.models = requireAll({
		dirname: path.resolve('models'),
		filter: /(.+)\.js$/,
		resolve: (Model) => Model,
	})

	// Load base v1 controllers
	const pathToController = path.resolve('controllers/v1/')

	fs.readdirSync(pathToController).forEach((file) => {
		checkWhetherFolderExistsOrNot(pathToController, file)
	})

	/**
	 * Check whether folder exists or not.
	 * @param {String} pathToFolder - path to folder.
	 * @param {String} file - file name.
	 */
	function checkWhetherFolderExistsOrNot(pathToFolder, file) {
		let folderExists = fs.lstatSync(path.join(pathToFolder, file)).isDirectory()

		if (folderExists) {
			fs.readdirSync(path.join(pathToFolder, file)).forEach((folderOrFile) => {
				checkWhetherFolderExistsOrNot(path.join(pathToFolder, file, '/'), folderOrFile)
			})
		} else {
			if (file.match(/\.js$/) !== null) {
				require(path.join(pathToFolder, file))
			}
		}
	}

	// Schema for db.
	global.schemas = {}
	fs.readdirSync(path.resolve('models')).forEach((file) => {
		if (file.match(/\.js$/) !== null) {
			const name = file.replace('.js', '')
			global.schemas[name] = require(path.resolve('models', file))
		}
	})

	// All controllers
	global.controllers = requireAll({
		dirname: path.resolve('controllers'),
		resolve: (Controller) => new Controller(),
	})

	// Message constants
	global.CONSTANTS = {}
	fs.readdirSync(path.resolve('generics/constants')).forEach((file) => {
		if (file.match(/\.js$/) !== null) {
			let name = file.replace('.js', '')
			name = UTILS.hyphenCaseToCamelCase(name)
			global.CONSTANTS[name] = require(path.resolve('generics/constants', file))
		}
	})

	// Kafka consumers
	fs.readdirSync(path.resolve('././generics/kafka/consumers')).forEach((file) => {
		if (file.match(/\.js$/) !== null) {
			const name = file.replace('.js', '')
			global[name + 'Consumer'] = require(path.resolve('././generics/kafka/consumers', file))
		}
	})
}

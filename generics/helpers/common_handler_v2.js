const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const { ChartJSNodeCanvas } = require('chartjs-node-canvas')
const width = 800 //px
const height = 450 //px
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height })
const path = require('path')
const rimraf = require('rimraf')
const ejs = require('ejs')
const request = require('request')
const rp = require('request-promise')
const filesHelper = require(MODULES_BASE_PATH + '/cloud-services/files/helper')
const axios = require('axios')
const GotenbergConnection = require(SERVICES_BASE_PATH + '/gotenberg')

/**
 * Generates a PDF report based on entity report data.
 * @param {Object} entityReportData - Data for generating the report.
 * @param {string} userId - User ID associated with the report generation.
 * @returns {Promise<Object>} A promise that resolves to an object containing PDF generation status and URL.
 */
exports.unnatiEntityReportPdfGeneration = async function (entityReportData, userId) {
	// Return a Promise to handle the asynchronous PDF generation process
	return new Promise(async function (resolve, reject) {
		// Generate a unique temporary folder path
		let currentTempFolder = 'tmp/' + uuidv4() + '--' + Math.floor(Math.random() * (10000 - 10 + 1) + 10)

		// Construct the full local path for the temporary folder
		let imgPath = path.resolve(__dirname, '../../', currentTempFolder)

		// Create the temporary folder if it doesn't exist
		if (!fs.existsSync(imgPath)) {
			fs.mkdirSync(imgPath)
		}

		// Copy Bootstrap CSS file to the temporary folder
		const sourceBootstrapPath = path.join(__dirname, '../../public/css/bootstrap.min.css')
		const destinationStylePath = path.join(imgPath, 'style.css')
		await copyBootStrapFile(sourceBootstrapPath, destinationStylePath)

		// let bootstrapStream = await copyBootStrapFile(__dirname + '/../public/css/bootstrap.min.css', imgPath + '/style.css');
		try {
			let formData = []
			// Copy images from public folder to the temporary folder
			let imgSourcePaths = [
				'/../public/images/note1.svg',
				'/../public/images/note2.svg',
				'/../public/images/note3.svg',
				'/../public/images/note4.svg',
			]
			for (let i = 0; i < imgSourcePaths.length; i++) {
				let imgName = 'note' + (i + 1) + '.svg'
				let src = path.join(__dirname, '..', imgSourcePaths[i])
				fs.copyFileSync(src, imgPath + ('/' + imgName))
				formData.push({
					value: fs.createReadStream(imgPath + ('/' + imgName)),
					options: {
						filename: imgName,
					},
				})
			}
			// Get chart objects for the entity report data
			let chartData = await getEntityReportChartObjects(entityReportData)
			//generate the chart using highchart server
			let entityReportCharts = await createChart(chartData, imgPath)
			formData.push(...entityReportCharts)
			// Prepare data for rendering the EJS template
			let ejsInputData = {
				chartData: entityReportCharts,
				response: entityReportData,
			}

			// Render the EJS template with the prepared data
			ejs.renderFile(path.join(__dirname, '../../views/unnatiEntityReport.ejs'), {
				data: ejsInputData,
			}).then(function (dataEjsRender) {
				let dir = imgPath
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir)
				}

				// Write the rendered HTML to a file within the temporary folder
				fs.writeFile(dir + '/index.html', dataEjsRender, function (errWriteFile, dataWriteFile) {
					if (errWriteFile) {
						throw errWriteFile
					} else {
						// Prepare options for converting HTML to PDF using Gotenberg
						let optionsHtmlToPdf = GotenbergConnection.getGotenbergConnection()
						optionsHtmlToPdf.formData = {
							files: [],
						}
						// Add HTML and CSS files to the formData array for PDF generation
						formData.push({
							value: fs.createReadStream(dir + '/index.html'),
							options: {
								filename: 'index.html',
							},
						})

						formData.push({
							value: fs.createReadStream(dir + '/style.css'),
							options: {
								filename: 'style.css',
							},
						})

						optionsHtmlToPdf.formData.files = formData
						// Convert HTML to PDF using Gotenberg and handle the response
						rp(optionsHtmlToPdf)
							.then(function (responseHtmlToPdf) {
								let pdfBuffer = Buffer.from(responseHtmlToPdf.body)
								if (responseHtmlToPdf.statusCode == 200) {
									let pdfFile = uuidv4() + '.pdf'
									// Save the generated PDF to the temporary folder
									fs.writeFile(dir + '/' + pdfFile, pdfBuffer, 'binary', async function (err) {
										if (err) {
										} else {
											// Upload the PDF file to cloud storage
											let uploadFileResponse = await uploadPdfToCloud(pdfFile, userId, dir)
											if (
												uploadFileResponse.success &&
												uploadFileResponse.data &&
												uploadFileResponse.data.length > 0
											) {
												rimraf(imgPath, () => {})

												return resolve({
													success: true,
													folderPath: uploadFileResponse.data,
												})
											} else {
												return resolve({
													status: false,
													message: CONSTANTS.common.COULD_NOT_GENERATE_PDF,
												})
											}
										}
									})
								}
							})
							.catch((err) => {
								resolve(err)
							})
					}
				})
			})
		} catch (err) {
			return reject(err)
		}
	})
}

/**
 * Generates a full PDF report containing Gantt chart visualizations and uploads it to cloud storage.
 * @param {Object} responseData - Data object for generating the report.
 * @param {string} userId - User ID for identifying the uploader.
 * @returns {Promise<Object>} A promise that resolves to an object representing the result of PDF generation and upload.
 */
exports.unnatiViewFullReportPdfGeneration = async function (responseData, userId) {
	return new Promise(async function (resolve, reject) {
		// Generate a unique temporary folder path
		var currentTempFolder = 'tmp/' + uuidv4() + '--' + Math.floor(Math.random() * (10000 - 10 + 1) + 10)
		// Construct the full local path for the temporary folder
		let imgPath = path.resolve(__dirname, '../../', currentTempFolder)

		// Create the temporary folder if it does not exist
		if (!fs.existsSync(imgPath)) {
			fs.mkdirSync(imgPath)
		}
		// Copy Bootstrap CSS file to the temporary folder
		const sourceBootstrapPath = path.join(__dirname, '../../public/css/bootstrap.min.css')
		const destinationStylePath = path.join(imgPath, 'style.css')
		let bootstrapStream = await copyBootStrapFile(sourceBootstrapPath, destinationStylePath)
		// let bootstrapStream = await copyBootStrapFile(__dirname + '/../public/css/bootstrap.min.css', imgPath + '/style.css');

		try {
			var FormData = []
			// const dataArray = Object.entries(responseData)
			//get the chart object
			let dataArray = new Array(responseData)
			let chartObj = await ganttChartObject(dataArray)
			//generate the chart using highchart server
			let ganttChartData = await createChart(chartObj[0], imgPath)
			FormData.push(...ganttChartData)

			// Prepare data object for rendering the EJS template
			let obj = {
				chartData: ganttChartData,
				reportType: responseData.reportType,
				projectData: chartObj[1],
				chartLibrary: 'chartjs',
			}
			// Render the EJS template into HTML
			ejs.renderFile(path.join(__dirname, '../../views/unnatiViewFullReport.ejs'), {
				data: obj,
			}).then(function (dataEjsRender) {
				var dir = imgPath
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir)
				}

				// Write the rendered HTML content to a file
				fs.writeFile(dir + '/index.html', dataEjsRender, function (errWriteFile, dataWriteFile) {
					if (errWriteFile) {
						throw errWriteFile
					} else {
						// Prepare options for converting HTML to PDF using Gotenberg service
						let optionsHtmlToPdf = GotenbergConnection.getGotenbergConnection()
						optionsHtmlToPdf.formData = {
							files: [],
						}

						// Include the CSS file for PDF styling
						FormData.push({
							value: fs.createReadStream(dir + '/index.html'),
							options: {
								filename: 'index.html',
							},
						})

						FormData.push({
							value: fs.createReadStream(dir + '/style.css'),
							options: {
								filename: 'style.css',
							},
						})

						optionsHtmlToPdf.formData.files = FormData

						// Convert HTML to PDF using Gotenberg service
						rp(optionsHtmlToPdf)
							.then(function (responseHtmlToPdf) {
								let pdfBuffer = Buffer.from(responseHtmlToPdf.body)
								if (responseHtmlToPdf.statusCode == 200) {
									// Write the generated PDF to a file
									let pdfFile = uuidv4() + '.pdf'
									fs.writeFile(dir + '/' + pdfFile, pdfBuffer, 'binary', async function (err) {
										if (err) {
											return console.log(err)
										} else {
											// Upload the PDF file to cloud storage
											let uploadFileResponse = await uploadPdfToCloud(pdfFile, userId, dir)
											let payload = {
												filePaths: [uploadFileResponse.data],
											}
											if (uploadFileResponse.success) {
												// Get downloadable URL for the uploaded PDF
												let pdfDownloadableUrl = await filesHelper.getDownloadableUrl(
													payload.filePaths
												)
												if (
													pdfDownloadableUrl.result[0] &&
													Object.keys(pdfDownloadableUrl.result[0]).length > 0
												) {
													// Clean up temporary files and return success response
													fs.readdir(imgPath, (err, files) => {
														if (err) throw err

														let i = 0
														// Delete all files in the temporary directory
														for (const file of files) {
															fs.unlink(path.join(imgPath, file), (err) => {
																if (err) throw err
															})

															if (i == files.length) {
																fs.unlink('../../' + currentTempFolder, (err) => {
																	if (err) throw err
																})
																console.log(
																	'path.dirname(filename).split(path.sep).pop()',
																	path.dirname(file).split(path.sep).pop()
																)
															}

															i = i + 1
														}
													})
													// Delete the temporary directory itself
													rimraf(imgPath, function () {
														console.log('done')
													})

													return resolve({
														success: CONSTANTS.common.SUCCESS,
														message: pdfDownloadableUrl.message,
														pdfUrl: pdfDownloadableUrl.result[0].url,
													})
												} else {
													return resolve({
														status: CONSTANTS.common.STATUS_FAILURE,
														message: pdfDownloadableUrl.message
															? pdfDownloadableUrl.message
															: CONSTANTS.common.COULD_NOT_GENERATE_PDF,
														pdfUrl: '',
													})
												}
											} else {
												return resolve({
													status: CONSTANTS.common.STATUS_FAILURE,
													message: uploadFileResponse.message
														? uploadFileResponse.message
														: CONSTANTS.common.COULD_NOT_GENERATE_PDF,
													pdfUrl: '',
												})
											}
										}
									})
								}
							})
							.catch((err) => {
								resolve(err)
							})
					}
				})
			})
		} catch (err) {
			resolve(err)
		}
	})
}

/**
 * Generates Gantt chart options and project data based on the given projects.
 * @param {Array<Object>} projects - An array of project objects.
 * @returns {Promise<Array<Array<Object>>>} A promise that resolves to an array containing:
 *                                          - Array of chart options for rendering Gantt charts.
 *                                          - Updated project data with assigned order.
 */
async function ganttChartObject(projects) {
	return new Promise(async function (resolve, reject) {
		let arrayOfChartData = []
		let projectData = []
		let i = 1

		// Process each project asynchronously
		await Promise.all(
			projects.map(async (eachProject) => {
				let data = []
				let labels = []
				let leastStartDate = ''

				// Process each task of the project
				await Promise.all(
					eachProject.projectDetails[0].tasks.map((eachTask) => {
						if (eachTask.startDate) {
							// Update the leastStartDate with the earliest task start date
							leastStartDate = eachTask.startDate
						}
						labels.push(eachTask.title)
						data.push({
							// Add task details to data array
							task: eachTask.title,
							startDate: eachTask.startDate,
							endDate: eachTask.endDate,
						})
					})
				)
				// Determine the actual least start date among tasks
				if (data.length > 0) {
					data.forEach((v) => {
						leastStartDate = new Date(v.startDate) < new Date(leastStartDate) ? v.startDate : leastStartDate
					})
				}

				// Define chart options for the project
				let chartOptions = {
					order: 1,
					options: {
						type: 'horizontalBar',
						data: {
							labels: labels,
							datasets: [
								{
									// Dataset for start dates relative to leastStartDate
									data: data.map((t) => {
										if (leastStartDate && t.startDate) {
											return UTILS.dateDiffInDays(new Date(leastStartDate), new Date(t.startDate))
										}
										return null
									}),
									datalabels: {
										color: '#025ced',
										//   formatter: function (value, context) {
										//     return '';
										//   },
									},
									backgroundColor: 'rgba(63,103,126,0)',
									hoverBackgroundColor: 'rgba(50,90,100,0)',
								},
								{
									// Dataset for task durations (end dates - start dates)
									data: data.map((t) => {
										if (t.startDate && t.endDate) {
											return UTILS.dateDiffInDays(new Date(t.startDate), new Date(t.endDate))
										}
									}),
									datalabels: {
										color: '#025ced',
										//   formatter: function (value, context) {
										//     return '';
										//   },
									},
								},
							],
						},
						options: {
							maintainAspectRatio: false,
							title: {
								display: true,
								text: eachProject.projectDetails[0].title,
							},
							legend: { display: false },
							scales: {
								x: {
									stacked: true,
									ticks: {
										// Custom tick formatter to display date labels
										callback: function (value, index, values) {
											if (leastStartDate) {
												const date = new Date(leastStartDate)
												date.setDate(value)
												return getDate(date)
											}
										},
									},
								},

								y: {
									stacked: true,
								},
							},
						},
					},
				}
				// Store chart options in the array
				arrayOfChartData.push(chartOptions)
				eachProject.order = i
				projectData.push(eachProject)
				i++
			})
		)

		resolve([arrayOfChartData, projectData])
	})
}

/**
 * Generates chart images from chart data using Chart.js and saves them as files.
 * @param {Array<Object>} chartData - An array of chart data objects.
 * @param {string} imgPath - The path where the generated chart images will be saved.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of form data objects.
 */
const createChart = async function (chartData, imgPath) {
	return new Promise(async function (resolve, reject) {
		try {
			let formData = []

			// Process each chart data asynchronously
			await Promise.all(
				chartData.map(async (data) => {
					// Generate a unique chart image filename using UUID
					let chartImage = 'chartPngImage_' + uuidv4() + '_.png'
					let imgFilePath = imgPath + '/' + chartImage
					// Render the chart to a buffer using Chart.js Node Canvas
					let imageBuffer = await chartJSNodeCanvas.renderToBuffer(data.options)
					// Write the image buffer to a file in the specified image path
					fs.writeFileSync(imgFilePath, imageBuffer)

					// Prepare form data entry for the chart image
					formData.push({
						order: data.order,
						value: fs.createReadStream(imgFilePath),
						options: {
							filename: chartImage,
						},
					})
				})
			)

			return resolve(formData)
		} catch (err) {
			return reject(err)
		}
	})
}

/**
 * Uploads a PDF file to cloud storage using a pre-signed URL.
 * @param {string} fileName - The name of the PDF file to upload.
 * @param {string} userId - The ID of the user initiating the upload.
 * @param {string} folderPath - The path to the folder where the PDF file is located.
 */
const uploadPdfToCloud = async function (fileName, userId, folderPath) {
	return new Promise(async function (resolve, reject) {
		try {
			// Generate a unique identifier
			let uniqueId = UTILS.generateUniqueId()
			let payload = {}
			payload[uniqueId] = {
				files: [fileName],
			}
			// Get pre-signed URLs for file upload
			let getSignedUrl = await filesHelper.preSignedUrls(payload, userId)
			if (getSignedUrl.data && Object.keys(getSignedUrl.data).length > 0) {
				// Extract the file upload URL from the response
				let fileUploadUrl = getSignedUrl.data[uniqueId].files[0].url
				// Read the PDF file data from the specified folder path
				let fileData = fs.readFileSync(folderPath + '/' + fileName)
				try {
					// Set headers based on cloud storage type (e.g., Azure Blob Storage)
					const headers = {
						'Content-Type':
							getSignedUrl.data.cloudStorage === CONSTANTS.common.GCP
								? 'multipart/form-data'
								: 'application/pdf',
						'x-ms-blob-type':
							getSignedUrl.data.cloudStorage === CONSTANTS.common.AZURE ? 'BlockBlob' : null,
					}

					// Upload the PDF file data to the specified file upload URL using Axios
					const uploadResponse = await axios.put(fileUploadUrl, fileData, { headers })

					return resolve({
						success: true,
						data: getSignedUrl.data[uniqueId].files[0].payload.sourcePath,
					})
				} catch (e) {
					console.log(e)
				}
			} else {
				return resolve({
					success: false,
				})
			}
		} catch (err) {
			return resolve({
				success: false,
				message: err.message,
			})
		}
	})
}

/**
 * Copy a Bootstrap CSS file from source path to destination path.
 * @param {string} from - Source path of the Bootstrap CSS file.
 * @param {string} to - Destination path to copy the Bootstrap CSS file.
 * @returns {Promise<ReadableStream>} A promise that resolves to a ReadableStream representing the copy operation.
 */
async function copyBootStrapFile(from, to) {
	// var fileInfo = await rp(options).pipe(fs.createWriteStream(radioFilePath))
	// Create a readable stream to read the source CSS file and write it to the destination path
	var readCss = fs.createReadStream(from).pipe(fs.createWriteStream(to))
	// Return a Promise to handle the completion or error of the file copy operation
	return new Promise(function (resolve, reject) {
		readCss.on('finish', function () {
			return resolve(readCss)
		})
		readCss.on('error', function (err) {
			return resolve(err)
		})
	})
}

/**
 * Retrieves chart data for task overview.
 * @param {Object} tasks - Tasks data for generating the chart.
 * @returns {Promise<Object>} A promise that resolves to the chart object.
 */
async function getEntityReportChartObjects(data) {
	// Return a Promise to handle the asynchronous chart object retrieval and preparation
	return new Promise(async function (resolve, reject) {
		let chartData = []

		// Define an array of async functions to fetch different types of chart objects concurrently

		let getChartObjects = [getTaskOverviewChart(data.tasks), getCategoryWiseChart(data.categories)]

		// Execute all async functions concurrently using Promise.all

		await Promise.all(getChartObjects).then(function (response) {
			chartData.push(response[0])
			chartData.push(response[1])
		})

		return resolve(chartData)
	})
}

/**
 * Generates a doughnut chart object based on category data.
 * @param {Object} categories - Object containing category data.
 * @returns {Promise<Object>} A promise that resolves to a doughnut chart object.
 */
async function getCategoryWiseChart(categories) {
	// Return a Promise to handle the asynchronous chart object generation
	return new Promise(async function (resolve, reject) {
		let total = categories['Total'] // Get the total count of categories
		delete categories['Total'] // Remove the 'Total' key from the categories object
		let labels = [] // Array to hold chart labels (category names)
		let data = [] // Array to hold chart data (percentage values)

		// Calculate percentage for each category and populate labels and data arrays
		Object.keys(categories).forEach((eachCategory) => {
			let percetage = ((categories[eachCategory] / total) * 100).toFixed(1)
			labels.push(eachCategory)
			data.push(percetage)
		})

		// Define chart options for the doughnut chart
		let chartOptions = {
			type: 'doughnut',
			data: {
				labels: labels,
				datasets: [
					{
						data: data,
						backgroundColor: [
							'rgb(255, 99, 132)',
							'rgb(54, 162, 235)',
							'rgb(255, 206, 86)',
							'rgb(231, 233, 237)',
							'rgb(75, 192, 192)',
							'rgb(151, 187, 205)',
							'rgb(220, 220, 220)',
							'rgb(247, 70, 74)',
							'rgb(70, 191, 189)',
							'rgb(253, 180, 92)',
							'rgb(148, 159, 177)',
							'rgb(77, 83, 96)',
							'rgb(95, 101, 217)',
							'rgb(170, 95, 217)',
							'rgb(140, 48, 57)',
							'rgb(209, 6, 40)',
							'rgb(68, 128, 51)',
							'rgb(125, 128, 51)',
							'rgb(128, 84, 51)',
							'rgb(179, 139, 11)',
						],
					},
				],
			},
			options: {
				legend: {
					position: 'bottom',
					labels: {
						padding: 30,
					},
				},
				layout: {
					padding: {
						top: 15,
						bottom: 25,
					},
				},
				plugins: {
					datalabels: {
						anchor: 'end',
						align: 'end',
						font: {
							size: 18,
						},
						formatter: (value) => {
							return value + '%'
						},
					},
				},
			},
		}

		// Create the chart object with defined order and options
		let chartObject = {
			order: 2,
			options: chartOptions,
		}
		resolve(chartObject)
	})
}

/**
 * Generates a doughnut chart object based on task overview data.
 * @param {Object} tasks - Object containing task overview data.
 * @returns {Promise<Object>} A promise that resolves to a doughnut chart object.
 */
async function getTaskOverviewChart(tasks) {
	// Return a Promise to handle the asynchronous preparation of the chart object
	return new Promise(async function (resolve, reject) {
		let total = tasks['Total']
		delete tasks['Total']

		let labels = []
		let data = []
		let backgroundColor = []

		// Check and process 'Completed' tasks
		if (tasks['Completed']) {
			labels.push('Completed')
			data.push(((tasks['Completed'] / total) * 100).toFixed(1))
			backgroundColor.push('#295e28')
			delete tasks['Completed']
		}

		// Check and process 'Not Started' tasks
		if (tasks['Not Started']) {
			labels.push('Not Started')
			data.push(((tasks['Not Started'] / total) * 100).toFixed(1))
			backgroundColor.push('#db0b0b')
			delete tasks['Not Started']
		}

		// Process remaining task statuses

		Object.keys(tasks).forEach((eachTask) => {
			let percetage = ((tasks[eachTask] / total) * 100).toFixed(1)
			labels.push(eachTask)
			data.push(percetage)
		})
		// Add additional background colors for doughnut segments
		backgroundColor = [
			...backgroundColor,
			...[
				'rgb(255, 99, 132)',
				'rgb(54, 162, 235)',
				'rgb(255, 206, 86)',
				'rgb(231, 233, 237)',
				'rgb(75, 192, 192)',
				'rgb(151, 187, 205)',
				'rgb(220, 220, 220)',
				'rgb(247, 70, 74)',
				'rgb(70, 191, 189)',
				'rgb(253, 180, 92)',
				'rgb(148, 159, 177)',
				'rgb(77, 83, 96)',
				'rgb(95, 101, 217)',
				'rgb(170, 95, 217)',
				'rgb(140, 48, 57)',
				'rgb(209, 6, 40)',
				'rgb(68, 128, 51)',
				'rgb(125, 128, 51)',
				'rgb(128, 84, 51)',
				'rgb(179, 139, 11)',
			],
		]

		// Define chart options for the doughnut chart
		let chartOptions = {
			type: 'doughnut',
			data: {
				labels: labels,
				datasets: [
					{
						data: data,
						backgroundColor: backgroundColor,
					},
				],
			},
			options: {
				cutoutPercentage: 80,
				legend: {
					position: 'bottom',
					labels: {
						padding: 30,
					},
				},
				layout: {
					padding: {
						top: 25,
					},
				},
				plugins: {
					datalabels: {
						anchor: 'end',
						align: 'end',
						font: {
							size: 18,
						},
						formatter: (value) => {
							return value + '%'
						},
					},
				},
			},
		}

		// Create the chart object with defined order and options
		let chartObject = {
			order: 1,
			options: chartOptions,
		}

		resolve(chartObject)
	})
}

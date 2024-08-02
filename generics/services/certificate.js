/**
 * name : certificate.js
 * author : Vishnu
 * Date : 07-Oct-2022
 * Description : Sunbird-RC certificate api.
 */

//dependencies
const request = require('request')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const QRCode = require('qrcode')
const FormData = require('form-data')
const GotenbergConnection = require(SERVICES_BASE_PATH + '/gotenberg')
const common_handler = require(GENERICS_FILES_PATH + '/helpers/common_handler')
const projectQueries = require(DB_QUERY_BASE_PATH + '/projects')

/**
 * Project certificate creation
 * @function
 * @name createCertificate
 * @param {Object} bodyData - Body data
 * @returns {JSON} - Certificate creation details.
 */

const createCertificate = function (bodyData, asyncMode = true) {
	return new Promise(async (resolve, reject) => {
		try {
			let svgTempalte = await axios.get(bodyData.templateUrl)
			svgTempalte = svgTempalte.data

			const qrCodeData = await QRCode.toDataURL(`/v1/userProjects/verifyCertificate/${bodyData.projectId}`)

			const placeHolderContents = svgTempalte
				.replace('{{credentialSubject.recipientName}}', bodyData.name)
				.replace('{{credentialSubject.projectName}}', bodyData.projectName)
				.replace('{{dateFormat issuanceDate "DD MMMM  YYYY"}}', bodyData.completedDate)
				.replace('{{qrCode}}', qrCodeData)

			const certificateTempFolderPath = path.resolve(__dirname + '/../../certificateTempFolder')
			if (fs.existsSync(certificateTempFolderPath)) {
				fs.rmSync(certificateTempFolderPath, { recursive: true, force: true })
			}
			fs.mkdirSync(certificateTempFolderPath)
			const svgTemplatePath = certificateTempFolderPath + '/template.svg'
			fs.writeFileSync(svgTemplatePath, placeHolderContents)
			fs.readFileSync(svgTemplatePath, 'utf-8', (error, data) => {
				if (error) {
					if (fs.existsSync(certificateTempFolderPath)) {
						fs.rmSync(certificateTempFolderPath, { recursive: true, force: true })
					}
					throw {
						message: CONSTANTS.apiResponses.CERTIFICATE_GENERATION_FAILED,
					}
				}
				const singleLineSvg = data.replace(/\s+/g, ' ').trim()
				fs.writeFileSync(svgTemplatePath, singleLineSvg, 'utf-8', (error) => {
					if (error) {
						if (fs.existsSync(certificateTempFolderPath)) {
							fs.rmSync(certificateTempFolderPath, { recursive: true, force: true })
						}
						throw {
							message: CONSTANTS.apiResponses.CERTIFICATE_GENERATION_FAILED,
						}
					}
				})
			})

			let result = {
				success: true,
			}

			const formData = new FormData()
			formData.append('files', fs.createReadStream(svgTemplatePath))
			const gotenbergOptionsForCertificate = GotenbergConnection.gotenbergConnectionForCertificate(
				bodyData.projectId,
				bodyData.userId,
				asyncMode
			)
			const response = await axios.post(gotenbergOptionsForCertificate.uri, formData, {
				headers: {
					...gotenbergOptionsForCertificate.headers,
					...formData.getHeaders(),
				},
				responseType: gotenbergOptionsForCertificate.responseType,
			})

			if (!asyncMode) {
				const certificatePdfPath = certificateTempFolderPath + '/output.pdf'
				fs.writeFileSync(certificatePdfPath, response.data)

				const pdfPreSignedUrl = await common_handler.uploadPdfToCloud(
					'output.pdf',
					bodyData.userId,
					certificateTempFolderPath
				)
				const svgPreSignedUrl = await common_handler.uploadPdfToCloud(
					'template.svg',
					bodyData.userId,
					certificateTempFolderPath
				)
				let updateObject = {
					$set: {},
				}
				if (pdfPreSignedUrl.success && pdfPreSignedUrl.data != '') {
					updateObject['$set']['certificate.pdfPath'] = pdfPreSignedUrl.data
					updateObject['$set']['certificate.svgPath'] = svgPreSignedUrl.data
					updateObject['$set']['certificate.issuedOn'] = new Date()
					let updatedProject = await projectQueries.findOneAndUpdate(
						{
							_id: bodyData.projectId,
						},
						updateObject
					)
				}
				if (fs.existsSync(certificateTempFolderPath)) {
					fs.rmSync(certificateTempFolderPath, { recursive: true, force: true })
				}
			}
			result['data'] = {
				transactionId: response.headers['gotenberg-trace'],
			}
			return resolve(result)
		} catch (error) {
			return reject(error)
		}
	})
}

/**
 * Project certificate issuer-kid
 * @function
 * @name getCertificateIssuerKid
 * @returns {JSON} - Certificate issuer kid details.
 */

// const getCertificateIssuerKid = function () {
//     return new Promise(async (resolve, reject) => {
//         try {
//             let issuerKidUrl =
//             process.env.CERTIFICATE_SERVICE_URL + CONSTANTS.endpoints.GET_CERTIFICATE_KID

//             let bodyData = {"filters": {}}

//             const options = {
//                 headers : {
//                     "Content-Type": "application/json"
//                 },
//                 json : bodyData
//             }
//             console.log("issuer Kid url : ",issuerKidUrl)
//             console.log("issuer Kid bodyData : ",JSON.stringify(bodyData))
//             request.post(issuerKidUrl,options,getKidCallback)
//             function getKidCallback(err, data) {
//                 let result = {
//                     success : true
//                 }

//                 if (err) {
//                     console.log("KID rc call error : ",err.message)
//                     result.success = false
//                 } else {
//                     let response = data.body
//                     console.log("KID success response : ",response)
//                     if( Object.keys(response).length >  0 && response.data[0].osid && response.data[0].osid !== "" ) {
//                         result["data"] = response.data[0].osid
//                     } else {
//                         result.success = false
//                     }
//                 }
//                 return resolve(result)
//             }
//             setTimeout(function () {
//                 return resolve (result = {
//                     success : false
//                  })
//             }, CONSTANTS.common.SERVER_TIME_OUT)

//         } catch (error) {
//             console.log("catch error : ",error.message)
//             return reject(error)
//         }
//     })
// }

module.exports = {
	createCertificate: createCertificate,
	// getCertificateIssuerKid : getCertificateIssuerKid
}

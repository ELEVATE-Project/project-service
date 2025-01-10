/**
 * name : helper.js
 * author : prajwal
 * created-date : 09-Jan-2025
 * Description : Testimonials extraction helper funtion
 */

/**
 * Testimonials
 * @class
 */

module.exports = class Testimonials {
	/**
	 * Extract testimonials from csv.
	 * @method
	 * @name extractTestimonialsFromCsv
	 * @param {Object} parsedCsvData - Parsed csv data.
	 * @returns {Array} testimonials data.
	 */

	static extractTestimonialsFromCsv(parsedCsvData) {
		return new Promise((resolve, reject) => {
			try {
				let extractedTestimonials = []
				for (let testimonialCount = 1; testimonialCount <= 10; testimonialCount++) {
					let testimonial = 'testimonial' + testimonialCount + '-'
					let testimonialText = testimonial + 'text'
					let testimonialAuthor = testimonial + 'author'
					let testimonialObj = {}
					if (parsedCsvData[testimonialText] && parsedCsvData[testimonialText] !== '') {
						testimonialObj['text'] = parsedCsvData[testimonialText].trim()
						testimonialObj['author'] = parsedCsvData[testimonialAuthor].trim()
						extractedTestimonials.push(testimonialObj)
					}
				}
				return resolve({
					success: true,
					data: extractedTestimonials,
				})
			} catch (error) {
				return reject(error)
			}
		})
	}
}

/**
 * name : updateComponentsToProgram.js
 * author : Saish Borkar
 * created-date : 08-10-2025
 * Description : Migration script to update the components field in programs collection
 */

require('dotenv').config({ path: '../../.env' })

const { MongoClient } = require('mongodb')
const mongoose = require('mongoose')
const fs = require('fs')
const { randomUUID } = require('crypto') // ✅ for unique file names

const MONGODB_URL = process.env.MONGODB_URL
if (!MONGODB_URL) {
	console.error('❌ Error: MONGODB_URL not found in environment variables.')
	process.exit(1)
}

// 🧩 Default configuration (multiple program-to-solution mappings)
const DEFAULTS = [
	{
		programId: '68c0781d1702a1001476261c',
		solutionIds: ['68e3a61fa634a9291cc1c932', '68e3a719a634a9291cc1ca0f'],
	},
	{
		programId: '68db7e07c24cb20014ffbc47',
		solutionIds: ['68e37aa9a634a9291cc1c748', '68e37cc1a634a9291cc1c7bd'],
	},
	{
		programId: '68c7e9e01702a1001476337d',
		solutionIds: ['68c7ebc71702a100147633ba', '68c7ec0d1702a10014763405'],
	},
]

const DB = MONGODB_URL.split('/').pop()
const args = process.argv.slice(2)
const ObjectId = mongoose.Types.ObjectId

// 🎯 Helper to fetch argument values
function getArgValue(flag) {
	const arg = args.find((a) => a.startsWith(`--${flag}=`))
	return arg ? arg.split('=')[1] : null
}

// 🎯 Parse CLI arguments
const programIdArg = getArgValue('programId')
const solutionIdsArg = getArgValue('solutionIds')
	? getArgValue('solutionIds')
			.split(',')
			.map((id) => id.trim())
	: null

// 🧱 Database setup
const dbClient = new MongoClient(MONGODB_URL)

// ✅ This array will hold logs of success/failure for writing to file
const migrationResults = []

// 🚀 Main Logic
async function updateProgramComponents(programs, programId, solutionIds) {
	console.log(`\n🏗  Processing Program: ${programId}`)
	console.log(`🔗 Adding Solutions: ${solutionIds.join(', ')}`)

	const resultEntry = {
		programId,
		newlyAddedSolutions: [],
		alreadyPresent: [],
		status: 'success',
	}

	try {
		const program = await programs.findOne({ _id: new ObjectId(programId) })
		if (!program) {
			console.warn(`⚠️  Program not found for ID: ${programId}`)
			resultEntry.status = 'not_found'
			migrationResults.push(resultEntry)
			return
		}

		const existingComponents = program.components || []
		const componentIds = existingComponents.map((comp) => comp.toString())

		const newComponents = solutionIds.filter((id) => !componentIds.includes(id)).map((id) => new ObjectId(id))

		resultEntry.newlyAddedSolutions = solutionIds.filter((id) => !componentIds.includes(id))
		resultEntry.alreadyPresent = solutionIds.filter((id) => componentIds.includes(id))

		if (newComponents.length > 0) {
			await programs.updateOne(
				{ _id: new ObjectId(programId) },
				{
					$set: { updatedAt: new Date() },
					$push: { components: { $each: newComponents } },
				}
			)
			console.log(`✅ Added ${newComponents.length} new component(s) to program ${programId}.`)
		} else {
			console.log('⚠️  All provided solution IDs already exist in components. No update needed.')
		}
	} catch (err) {
		console.error(`❌ Error updating program ${programId}:`, err)
		resultEntry.status = 'failed'
		resultEntry.error = err.message
	}

	// ✅ Push each result for logging later
	migrationResults.push(resultEntry)
}

// 🏁 Runner function
async function runMigration() {
	const uniqueId = randomUUID()
	const outputFile = `migration_result_${uniqueId}.txt`

	try {
		await dbClient.connect()
		console.log(`\n🏁 Connected to DB: ${DB}`)

		const db = dbClient.db(DB)
		const programs = db.collection('programs')

		console.log(programIdArg, solutionIdsArg)

		if (programIdArg && solutionIdsArg) {
			await updateProgramComponents(programs, programIdArg, solutionIdsArg)
		} else {
			console.log('\n📦 Running default program-to-solution mappings...')
			for (const mapping of DEFAULTS) {
				await updateProgramComponents(programs, mapping.programId, mapping.solutionIds)
			}
		}

		// 🧾 After all updates, write migration results to a file
		const logContent = [
			'==== Migration Results ====\n',
			`Timestamp: ${new Date().toISOString()}`,
			`Database: ${DB}`,
			'',
			JSON.stringify(migrationResults, null, 2),
			'\n=============================\n',
		].join('\n')

		fs.writeFileSync(outputFile, logContent)
		console.log(`\n📝 Migration results written to: ${outputFile}`)
	} catch (err) {
		console.error('❌ Error during migration:', err)
	} finally {
		await dbClient.close()
		console.log('\n🟢 Migration completed and connection closed.')
	}
}

runMigration()

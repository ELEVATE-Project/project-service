/**
 * name : updateScopeData.js
 * author : Prajwal
 * created-date : 29-May-2025
 * Description : Migration script to update scope of programs and solutions
 */

require('dotenv').config({ path: '../../.env' })
const { ObjectId } = require('mongodb')
const { MongoClient } = require('mongodb')
const PROJECT_MONGODB_URL = process.env.MONGODB_URL
const ENTITY_MONGODB_URL = process.env.ENTITY_MONGODB_URL
const SURVEY_MONGODB_URL = process.env.SURVEY_MONGODB_URL
const projectDBClient = new MongoClient(PROJECT_MONGODB_URL, { useUnifiedTopology: true })
const entityDBClient = new MongoClient(ENTITY_MONGODB_URL, { useUnifiedTopology: true })
const surveyDBClient = new MongoClient(SURVEY_MONGODB_URL, { useUnifiedTopology: true })
let entitiesDocs
let uniqueProfessionalRole
let uniqueProfessionalSubRoles

const professionalRole =
	'teacher,functionaries-officials,teacher-educators-coordinators,sh,functionaries-officials,student,  teacher,sh,teacher-educators-coordinators,functionaries-officials,student,sh,student,SchoolHead,Teacher,Educators/Coordinators,Teacher,student,Functionaries/Officials,student,functionaries-officials,sh,functionaries-officials'

const professionalSubRoles =
	'teacher-class-6-10,teacher-class-9-10,teacher-class-11-12,special-educators,physical-education-teacher,director-SCERT,principal-DIET,collector-DM-DC,head-state-training-center,education-officer,chief-education-officer,teacher-educator-CTE,teacher-educator-BASIC,tblock-resource-centre-coordinator-BRCC,cluster-resource-centre-oordinator-CRCC,state-coordinator,student-class-11-12,student-class-8-10,student-higher-education,student-pre-service-teacher,MIS-coordinator,subject-inspector,evaluation-officer,extension-officer,student-class-1-5,student-class-3-5,student-class-6-8,student-class-6-10,teacher-class-9-10,teacher-class-11-12,special-educators,physical-education-teacher,art-music-performing-teacher,teacher-class-1-5,teacher-class-3-5,teacher-class-6-8,teacher-class-6-10,teacher-class-9-10,principal-head-teacher,vice-principal-asst-head-teacher,head-teacher-incharge,student-preschool-class-2,student-class-1-5,teacher-class-1-5,teacher-class-3-5,teacher-educator-SCERT,teacher-educator-DIET,additional-director,joint-director,principal-head-teacher,vice-principal-asst-head-teacher,student-preschool-class-2 ,student-class-1-5 ,student-class-3-5 ,student-class-6-8 ,student-class-6-10 ,student-class-9-10 ,student-class-11-12 ,student-class-8-10 ,student-higher-education ,student-pre-service-teacher ,principal-head-teacher ,vice-principal-asst-head-teacher ,head-teacher-incharge,Student (Preschool- Class 2), Student (Class 1-5), Student (Class 3-5), Student (Class 6-8), Student (Class 6-10), Student (Class 9-10), Student (Class 11-12), Student (Class 8-10), Student (Higher Education), Student (pre-service teacher),Teacher Educator (DIET), Teacher Educator (IASE), Teacher Educator (Univ Deptt), Teacher Educator (TEI), Teacher Educator (SIET), Teacher Educator (CTE), Teacher Educator (BASIC), Block Resource Centre Coordinator (BRCC), Cluster Resource Centre Coordinator (CRCC), State Coordinator, District Coordinator, Assistant District Coordinator, Coordinator, Mentor/Advisor, Resource Person (State/District/Block), Shikshak Sankul, Principal, Secretary/Commissioner/Secretary (School Education), Additional Secretary/Commissioner (School Education),Block Education Officer (BEO), MIS coordinator, Subject Inspector, Evaluation Officer, Extension Officer, CDPO (Child development Project officer), Supervisor, Program Officer, Basic Shiksha Adhikari, Director (Primary Education), Desk Officer (Education),Director (Secondary and Higher Secondary Education), Director (Scheme), Director (Balbharati), Director (State Education Board),student-class-8-10,chief-education-officer,vice-principal-asst-head-teacher,chief-education-officer,student-preschool-class-2 ,student-class-1-5 ,student-class-3-5 ,student-class-6-8 ,student-class-6-10 ,student-class-9-10 ,student-class-11-12 ,student-class-8-10 ,student-higher-education ,student-pre-service-teacher ,principal-head-teacher ,vice-principal-asst-head-teacher ,head-teacher-incharge,principal-head-teacher, vice-principal-asst-head-teacher, head-teacher-incharge, director-SCERT, principal-DIET, collector-DM-DC, head-state-training-center, education-officer,principal-head-teacher, vice-principal-asst-head-teacher, head-teacher-incharge, director-SCERT, principal-DIET, collector-DM-DC, head-state-training-center, education-officer,principal-head-teacher, vice-principal-asst-head-teacher, head-teacher-incharge, director-SCERT, principal-DIET, collector-DM-DC, head-state-training-center, education-officer,teacher-class-6-10,teacher-class-9-10,teacher-class-11-12,special-educators,physical-education-teacher,director-SCERT,principal-DIET,collector-DM-DC,head-state-training-center,education-officer,chief-education-officer,teacher-educator-CTE,teacher-educator-BASIC,tblock-resource-centre-coordinator-BRCC,cluster-resource-centre-oordinator-CRCC,state-coordinator,Desk-officer-education,Desk-officer-education,Desk-officer-education'

const programData = {
	AWS_Prog_MYS_May20: {
		professional_role: 'teacher,functionaries-officials',
		professional_subroles:
			'teacher-class-6-10,teacher-class-9-10,teacher-class-11-12,special-educators,physical-education-teacher,director-SCERT,principal-DIET,collector-DM-DC,head-state-training-center,education-officer,chief-education-officer',
	},

	May20project_MYS: {
		professional_role: 'teacher-educators-coordinators,sh',
		professional_subroles:
			'teacher-educator-CTE,teacher-educator-BASIC,tblock-resource-centre-coordinator-BRCC,cluster-resource-centre-oordinator-CRCC,state-coordinator',
	},

	AWS_Program_may20: {
		professional_role: 'functionaries-officials,student',
		professional_subroles:
			'student-class-11-12,student-class-8-10,student-higher-education,student-pre-service-teacher,MIS-coordinator,subject-inspector,evaluation-officer,extension-officer',
	},

	May20project: {
		professional_role: 'student,teacher',
		professional_subroles:
			'student-class-1-5,student-class-3-5,student-class-6-8,student-class-6-10,teacher-class-9-10,teacher-class-11-12,special-educators,physical-education-teacher,art-music-performing-teacher',
	},

	AWS_Prog_may_20_2025: {
		professional_role: 'teacher,sh',
		professional_subroles:
			'teacher-class-1-5,teacher-class-3-5,teacher-class-6-8,teacher-class-6-10,teacher-class-9-10,principal-head-teacher,vice-principal-asst-head-teacher,head-teacher-incharge',
	},

	May20ProgPS_Sh_T_Stu_Ec_Fo_BEN: {
		professional_role: 'student ,teacher ,sh ,teacher-educators-coordinators ,functionaries-officials',
		professional_subroles:
			'student-preschool-class-2,student-class-1-5,teacher-class-1-5,teacher-class-3-5,teacher-educator-SCERT,teacher-educator-DIET,additional-director,joint-director,principal-head-teacher,vice-principal-asst-head-teacher',
	},

	Prog_obs_sur_may_20_BLR: {
		professional_role: 'student,sh',
		professional_subroles:
			'student-preschool-class-2 ,student-class-1-5 ,student-class-3-5 ,student-class-6-8 ,student-class-6-10 ,student-class-9-10 ,student-class-11-12 ,student-class-8-10 ,student-higher-education ,student-pre-service-teacher ,principal-head-teacher ,vice-principal-asst-head-teacher ,head-teacher-incharge',
	},

	HT_You_Teacherssdff: {
		professional_role: 'student,SchoolHead',
		professional_subroles:
			'Student (Preschool- Class 2), Student (Class 1-5), Student (Class 3-5), Student (Class 6-8), Student (Class 6-10), Student (Class 9-10), Student (Class 11-12), Student (Class 8-10), Student (Higher Education), Student (pre-service teacher)',
	},

	'survey & Observation for head_masteresss': {
		professional_role: 'Teacher Educators/Coordinators,Teacher,student',
		professional_subroles:
			'Teacher Educator (DIET), Teacher Educator (IASE), Teacher Educator (Univ Deptt), Teacher Educator (TEI), Teacher Educator (SIET), Teacher Educator (CTE), Teacher Educator (BASIC), Block Resource Centre Coordinator (BRCC), Cluster Resource Centre Coordinator (CRCC), State Coordinator, District Coordinator, Assistant District Coordinator, Coordinator, Mentor/Advisor, Resource Person (State/District/Block), Shikshak Sankul, Principal, Secretary/Commissioner/Secretary (School Education), Additional Secretary/Commissioner (School Education)',
	},

	TestFlow888axxss: {
		professional_role: 'Functionaries/Officials',
		professional_subroles:
			'Block Education Officer (BEO), MIS coordinator, Subject Inspector, Evaluation Officer, Extension Officer, CDPO (Child development Project officer), Supervisor, Program Officer, Basic Shiksha Adhikari, Director (Primary Education), Desk Officer (Education),Director (Secondary and Higher Secondary Education), Director (Scheme), Director (Balbharati), Director (State Education Board)',
	},

	Prog_MYSOREorg_May26_2025: {
		professional_role: 'student,functionaries-officials',
		professional_subroles: 'student-class-8-10,chief-education-officer',
	},

	Prog_BLR_May26_2025: {
		professional_role: 'sh,functionaries-officials',
		professional_subroles: 'vice-principal-asst-head-teacher,chief-education-officer',
	},

	May_18_MYSORE: {
		professional_role: 'student',
		professional_subroles:
			'student-preschool-class-2 ,student-class-1-5 ,student-class-3-5 ,student-class-6-8 ,student-class-6-10 ,student-class-9-10 ,student-class-11-12 ,student-class-8-10 ,student-higher-education ,student-pre-service-teacher ,principal-head-teacher ,vice-principal-asst-head-teacher ,head-teacher-incharge',
	},

	May_18_Bengaluru: {
		professional_role: 'functionaries-officials, School Head',
		professional_subroles:
			'principal-head-teacher, vice-principal-asst-head-teacher, head-teacher-incharge, director-SCERT, principal-DIET, collector-DM-DC, head-state-training-center, education-officer',
	},

	May_20_Bengaluru_kannada: {
		professional_role: 'functionaries-officials, School Head',
		professional_subroles:
			'principal-head-teacher, vice-principal-asst-head-teacher, head-teacher-incharge, director-SCERT, principal-DIET, collector-DM-DC, head-state-training-center, education-officer',
	},

	May_18_Bengaluru_telugu_22: {
		professional_role: 'functionaries-officials, School Head',
		professional_subroles:
			'principal-head-teacher, vice-principal-asst-head-teacher, head-teacher-incharge, director-SCERT, principal-DIET, collector-DM-DC, head-state-training-center, education-officer',
	},

	AWS_Prog_MYS_may21st2nd: {
		professional_role: 'teacher,functionaries-officials',
		professional_subroles:
			'teacher-class-6-10,teacher-class-9-10,teacher-class-11-12,special-educators,physical-education-teacher,director-SCERT,principal-DIET,collector-DM-DC,head-state-training-center,education-officer,chief-education-officer',
	},

	may19_Mys_kannada: {
		professional_role: 'teacher-educators-coordinators,sh',
		professional_subroles:
			'teacher-educator-CTE,teacher-educator-BASIC,tblock-resource-centre-coordinator-BRCC,cluster-resource-centre-oordinator-CRCC,state-coordinator',
	},

	May_18_Bengaluru_tamil_2277_projects: {
		professional_role: 'functionaries-officials',
		professional_subroles: 'Desk-officer-education',
	},

	May_18_Bengaluru_telugu_2277_projects: {
		professional_role: 'functionaries-officials',
		professional_subroles: 'Desk-officer-education',
	},

	May_18_Bengaluru_hindi_2277_projects: {
		professional_role: 'functionaries-officials',
		professional_subroles: 'Desk-officer-education',
	},
}

function returnUniqueItems(rolesArr) {
	const uniqueItems = [...new Set(rolesArr.map((item) => item.toLowerCase().trim()))]
	return uniqueItems
}

async function fetchEntityDocs(entityDB) {
	entitiesDocs = await entityDB
		.collection('entities')
		.find(
			{
				'metaInformation.externalId': { $in: [...uniqueProfessionalRole, ...uniqueProfessionalSubRoles] },
			},
			{
				projection: { _id: 1, entityType: 1, tenantId: 1, 'metaInformation.externalId': 1 },
			}
		)
		.toArray()
}

async function runMigration() {
	await entityDBClient.connect()
	await projectDBClient.connect()
	await surveyDBClient.connect()
	const entityDB = entityDBClient.db()
	const projectDB = projectDBClient.db()
	const surveyDB = surveyDBClient.db()
	uniqueProfessionalRole = returnUniqueItems(professionalRole.split(','))
	uniqueProfessionalSubRoles = returnUniqueItems(professionalSubRoles.split(','))
	await fetchEntityDocs(entityDB)
	for (const programId of Object.keys(programData)) {
		// update programs in projects db
		const program1 = await projectDB
			.collection('programs')
			.findOne({ externalId: programId }, { projection: { _id: 1, scope: 1, tenantId: 1, components: 1 } })
		// update valid programs
		if (program1) {
			const progProfRoles = returnUniqueItems(programData[programId].professional_role.split(','))
			const progProfSubroles = returnUniqueItems(programData[programId].professional_subroles.split(','))
			const tenantId = program1.tenantId
			const professional_role = entitiesDocs
				.filter(
					(item) => item.tenantId === tenantId && progProfRoles.includes(item.metaInformation?.externalId)
				)
				.map((item) => item._id)
			const professional_subroles = entitiesDocs
				.filter(
					(item) => item.tenantId === tenantId && progProfSubroles.includes(item.metaInformation?.externalId)
				)
				.map((item) => item._id)

			const updateProgam = await projectDB.collection('programs').findOneAndUpdate(
				{
					_id: program1._id,
				},
				{
					$set: {
						'scope.professional_role': professional_role,
						'scope.professional_subroles': professional_subroles,
					},
				}
			)
			if (updateProgam) console.log(`Program bearing ${program1._id} updated in projects.`)

			// update corresponding solutions
			for (const solutionId of program1.components) {
				const updateSolution = await projectDB.collection('solutions').findOneAndUpdate(
					{
						_id: ObjectId(solutionId),
					},
					{
						$set: {
							'scope.professional_role': professional_role,
							'scope.professional_subroles': professional_subroles,
						},
					}
				)
				if (updateSolution) console.log(`Solution bearing ${solutionId} updated in projects.`)
			}
		}

		// update programs in survey db
		const program2 = await surveyDB
			.collection('programs')
			.findOne({ externalId: programId }, { projection: { _id: 1, scope: 1, tenantId: 1, components: 1 } })
		// update valid programs
		if (program2) {
			const progProfRoles = returnUniqueItems(programData[programId].professional_role.split(','))
			const progProfSubroles = returnUniqueItems(programData[programId].professional_subroles.split(','))
			const tenantId = program2.tenantId
			const professional_role = entitiesDocs
				.filter(
					(item) => item.tenantId === tenantId && progProfRoles.includes(item.metaInformation?.externalId)
				)
				.map((item) => item._id)
			const professional_subroles = entitiesDocs
				.filter(
					(item) => item.tenantId === tenantId && progProfSubroles.includes(item.metaInformation?.externalId)
				)
				.map((item) => item._id)

			const updateProgam = await surveyDB.collection('programs').findOneAndUpdate(
				{
					_id: program2._id,
				},
				{
					$set: {
						'scope.professional_role': professional_role,
						'scope.professional_subroles': professional_subroles,
					},
				}
			)
			if (updateProgam) console.log(`Program bearing ${program2._id} updated in survey.`)

			// update corresponding solutions
			for (const solutionId of program2.components) {
				const updateSolution = await surveyDB.collection('solutions').findOneAndUpdate(
					{
						_id: ObjectId(solutionId),
					},
					{
						$set: {
							'scope.professional_role': professional_role,
							'scope.professional_subroles': professional_subroles,
						},
					}
				)
				if (updateSolution) console.log(`Solution bearing ${solutionId} updated in survey.`)
			}
		}
	}

	await entityDBClient.close()
	await projectDBClient.close()
	await surveyDBClient.close()
}

runMigration()

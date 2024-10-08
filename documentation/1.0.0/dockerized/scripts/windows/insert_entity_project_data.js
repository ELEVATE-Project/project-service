const { MongoClient } = require('mongodb');

const url = process.env.MONGODB_URL;
const entityDB = 'elevate-entity';
const projectDB = 'elevate-project'
const projectData = require('./project_data.js');
const entityData = require('./entity_data.js');
async function insertData(collectionName, dataFile,dbName) {
    const client = new MongoClient(url);

    try {
        // Connect to MongoDB
        await client.connect();
        console.log(`Connected to MongoDB for ${collectionName}`);

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Read the data from the file
        const data = dataFile

        if(!data){
            await client.close();
            return;
        }

        const result = await collection.insertMany(data);
        //console.log(`Inserted ${result.insertedCount} documents into ${collectionName}`);
    } finally {
        await client.close();
    }
}

async function main({dataToBeInserted}) {
    await insertData('programs', dataToBeInserted.programData,projectDB);
    await insertData('solutions',dataToBeInserted.solutionData,projectDB);
    await insertData('projectTemplates', dataToBeInserted.projectTemplatesData,projectDB);
    // await insertData('projectTemplateTasks',dataToBeInserted.projectTemplateTasksData,projectDB);
    await insertData('projectCategories',dataToBeInserted.projectCategoriesData,projectDB);
    // await insertData('projects',dataToBeInserted.projectsData,projectDB);
    // await insertData('programUsers',dataToBeInserted.programUsersData,projectDB);
    await insertData('forms',dataToBeInserted.formsData,projectDB);
    await insertData('configurations',dataToBeInserted.configurationsData,projectDB);
    // await insertData('certificateTemplates',dataToBeInserted.certificateTemplatesData,projectDB);
    await insertData('entities',dataToBeInserted.entitiesData,entityDB);
    await insertData('entityTypes',dataToBeInserted.entityTypesData,entityDB);
    await insertData('userRoleExtension',dataToBeInserted.userRoleExtensionData,entityDB);

}

main({dataToBeInserted:projectData}).then(()=>{
    console.log('project data populated successfully.')
}).catch(console.error);
main({dataToBeInserted:entityData}).then(()=>{
    console.log('entity data populated successfully.')
}).catch(console.error);
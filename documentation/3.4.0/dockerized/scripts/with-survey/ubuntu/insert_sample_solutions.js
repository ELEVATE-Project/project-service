const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017/"; // MongoDB URL
const dbName = "elevate-project";
const dbName2 = "elevate-entity";
const dbName3 = "elevate-samiksha";
const entityData = require("./entity_sampleData.js");
const projectData = require("./project_sampleData.js");
const surveyData = require("./survey_sampleData.js");

async function insertData(collectionName, dataFile, curretDB = dbName) {
  const client = new MongoClient(url);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log(`Connected to MongoDB for ${collectionName}`);

    const db = client.db(curretDB);
    const collection = db.collection(collectionName);

    // Read the data from the file
    const data = dataFile;

    if (!data) {
      await client.close();
      return;
    }

    const result = await collection.insertMany(data);
    //console.log(`Inserted ${result.insertedCount} documents into ${collectionName}`);
  } finally {
    await client.close();
  }
}

async function main({ dataToBeInserted }) {
  await insertData("entities", dataToBeInserted.entities, dbName2);
  await insertData("entityTypes", dataToBeInserted.entityType, dbName2);
  await insertData("programs", dataToBeInserted.programData);
  await insertData("solutions", dataToBeInserted.solutionData);
  await insertData("projectTemplates", dataToBeInserted.projectTemplatesData);
  await insertData(
    "projectTemplateTasks",
    dataToBeInserted.projectTemplateTasksData
  );
  await insertData(
    "certificateTemplates",
    dataToBeInserted.certificateTemplatesData
  );
  await insertData(
    "certificateBaseTemplates",
    dataToBeInserted.certificateBaseTemplatesData
  );
  await insertData("projectCategories", dataToBeInserted.projectCategoriesData);

  await insertData("solutions", dataToBeInserted.solutionData, dbName3);
  await insertData("criteria", dataToBeInserted.criteriaData, dbName3);
  await insertData("criteriaQuestions", dataToBeInserted.criteriaQuestionsData,dbName3);
  await insertData("frameworks", dataToBeInserted.frameworkData,dbName3);
  await insertData("questions", dataToBeInserted.questionsData,dbName3);

}

main({ dataToBeInserted: entityData })
  .then(() => {
    console.log("Entity data populated successfully.");
  })
  .catch(console.error);
main({ dataToBeInserted: projectData })
  .then(() => {
    console.log("project data populated successfully.");
  })
  .catch(console.error);
main({ dataToBeInserted: surveyData })
  .then(() => {
    console.log("Survey data populated successfully.");
  })
  .catch(console.error);

@echo off

rem Enable delayed expansion
setlocal enabledelayedexpansion

rem Set MongoDB connection details
set MONGO_HOST=localhost
set MONGO_PORT=27017
set ENTITY_SERVICE_DB_NAME=elevate-entity
set ENTITY_TYPE_COLLECTION=entityTypes
set ENTITIES_COLLECTION=entities
set PROJECT_SERVICE_DB_NAME=elevate-project
rem Insert Entity Type (state)
echo Inserting EntityType 'state' into %ENTITY_TYPE_COLLECTION% collection in %ENTITY_SERVICE_DB_NAME% database...

for /f "delims=" %%i in ('docker exec -i project_mongo_1 mongo --host %MONGO_HOST% --port %MONGO_PORT% --quiet --eval "var result=db.getSiblingDB('%ENTITY_SERVICE_DB_NAME%').%ENTITY_TYPE_COLLECTION%.insertOne({\"name\": \"state\", \"toBeMappedToParentEntities\": true, \"immediateChildrenEntityType\": [\"district\"], \"isDeleted\": false}); result.insertedId;"') do set ENTITY_TYPE_ID=%%i
echo EntityType ID for 'state': !ENTITY_TYPE_ID!

rem Insert Entity Type (district)
echo Inserting EntityType 'district' into %ENTITY_TYPE_COLLECTION% collection in %ENTITY_SERVICE_DB_NAME% database...

for /f "delims=" %%i in ('docker exec -i project_mongo_1 mongo --host %MONGO_HOST% --port %MONGO_PORT% --quiet --eval "var result=db.getSiblingDB('%ENTITY_SERVICE_DB_NAME%').%ENTITY_TYPE_COLLECTION%.insertOne({\"name\": \"district\", \"toBeMappedToParentEntities\": true, \"immediateChildrenEntityType\": [\"block\"], \"isDeleted\": false}); result.insertedId;"') do set ENTITY_TYPE_DISTRICT_ID=%%i
echo EntityType ID for 'district': !ENTITY_TYPE_DISTRICT_ID!

rem Insert State Entity Document
echo Inserting State Entity document into %ENTITIES_COLLECTION% collection...
setlocal enabledelayedexpansion

rem ... (other parts of your script)

rem Construct MongoDB query dynamically with delayed expansion
set "mongo_query=var result=db.getSiblingDB('%ENTITY_SERVICE_DB_NAME%').%ENTITIES_COLLECTION%.insertOne({\"name\": \"Karnataka\", \"entityType\": \"state\", \"entityTypeId\": '!ENTITY_TYPE_ID!', \"userId\": \"1\", \"metaInformation\": {\"externalId\": \"KR001\", \"name\": \"Karnataka\"}, \"childHierarchyPath\": []}); result.insertedId;"

for /f "delims=" %%i in ('docker exec -i project_mongo_1 mongo --host %MONGO_HOST% --port %MONGO_PORT% --quiet --eval "!mongo_query!"') do set "ENTITY_ID=%%i"

echo Entity ID for 'Karnataka': !ENTITY_ID!


rem Insert District Entity Document
echo Inserting District Entity document into %ENTITIES_COLLECTION% collection...

set "mongo_query=var result=db.getSiblingDB('%ENTITY_SERVICE_DB_NAME%').%ENTITIES_COLLECTION%.insertOne({\"name\": \"Bangalore\", \"entityType\": \"district\", \"entityTypeId\": '!ENTITY_TYPE_DISTRICT_ID!', \"userId\": \"1\", \"metaInformation\": {\"externalId\": \"BN001\", \"name\": \"Bangalore\"}, \"childHierarchyPath\": [], \"groups\": {}}); result.insertedId;"

for /f "delims=" %%i in ('docker exec -i project_mongo_1 mongo --host %MONGO_HOST% --port %MONGO_PORT% --quiet --eval "!mongo_query!"') do set "ENTITY_DISTRICT_ID=%%i"

echo Entity ID for 'Bangalore': !ENTITY_DISTRICT_ID!

rem Update State Entity to add District in 'groups' field
echo Updating State entity with District group information...
echo %ENTITY_ID% to update

rem Update State Entity to add District in 'groups' field
echo Updating State entity with District group information...


rem Remove the ObjectId wrapper to get just the string ID value
set ENTITY_ID=%ENTITY_ID:~9,-1%
rem
set ENTITY_DISTRICT_ID=%ENTITY_DISTRICT_ID:~9,-1%

rem Construct the MongoDB update query with proper escaping
set "mongo_update_query=db.getSiblingDB('%ENTITY_SERVICE_DB_NAME%').%ENTITIES_COLLECTION%.updateOne({\"_id\": ObjectId(\"%ENTITY_ID%\")}, {\"$set\": {\"groups.district\": [ObjectId(\"%ENTITY_DISTRICT_ID%\")]}});"

rem Execute the MongoDB query inside the Docker container
docker exec project_mongo_1 mongo --host %MONGO_HOST% --port %MONGO_PORT% --quiet --eval "%mongo_update_query%"


if errorlevel 1 (
    echo "Error updating State entity with District group information. Check the ObjectIDs: %ENTITY_ID% and %ENTITY_DISTRICT_ID%"
    exit /b 1
)

rem Clean up ENTITY_TYPE_ID if necessary (e.g., trimming unwanted characters)
set ENTITY_TYPE_ID=%ENTITY_TYPE_ID:~9,-1%

rem Display ENTITY_TYPE_ID for debugging
echo ENTITY_TYPE_ID before: %ENTITY_TYPE_ID%

rem Construct the MongoDB document, ensuring ObjectId is correctly formatted
set "USER_EXTENSION_DOCUMENT={\"status\":\"ACTIVE\",\"createdBy\":\"SYSTEM\",\"updatedBy\":\"SYSTEM\",\"deleted\":false,\"userRoleId\":\"8\",\"title\":\"State Education Officer\",\"entityTypes\":[{\"entityType\":\"state\",\"entityTypeId\":'!ENTITY_TYPE_ID!'}],\"updatedAt\":\"2024-09-09T09:31:47.135Z\",\"createdAt\":\"2024-09-09T09:31:47.135Z\",\"__v\":0}"

rem Display the document for debugging (optional)
echo Document to insert: %USER_EXTENSION_DOCUMENT%

rem Construct the MongoDB query string
set "mongo_update_query=db.getSiblingDB('%ENTITY_SERVICE_DB_NAME%').userRoleExtension.insertOne(%USER_EXTENSION_DOCUMENT%);"

rem Display the query for debugging (optional)
echo MongoDB query: !mongo_update_query!

rem Insert the document into MongoDB and capture the inserted ID
for /f "delims=" %%i in ('docker exec -i project_mongo_1 mongo --host %MONGO_HOST% --port %MONGO_PORT% --quiet --eval "!mongo_update_query!"') do set "USER_EXTENSION_ID=%%i"
rem Display the inserted document's ID
echo Inserted document ID: %USER_EXTENSION_ID%


set PROJECT_DB_NAME=elevate-project
set PROJECT_CATEGORY_COLLECTION=projectCategories

rem Project Category data to insert
set "PROJECT_CATEGORY_DOCUMENT=[{ \"externalId\": \"educationLeader\", \"name\": \"Education Leader\", \"status\": \"active\" }, { \"externalId\": \"community\", \"name\": \"Community\", \"status\": \"active\" }, { \"externalId\": \"teacher\", \"name\": \"Teacher\", \"status\": \"active\" }]"

echo "Project category data being added to %PROJECT_CATEGORY_COLLECTION% collection in %PROJECT_DB_NAME% database...."

rem Insert the data and capture the returned ObjectId values
for /f "tokens=*" %%i in ('docker exec -it project_mongo_1 mongo --host %MONGO_HOST% --port %MONGO_PORT% --quiet --eval "var doc = %PROJECT_CATEGORY_DOCUMENT%; var result = db.getSiblingDB('%PROJECT_DB_NAME%').%PROJECT_CATEGORY_COLLECTION%.insertMany(doc); if (result.insertedIds && Object.keys(result.insertedIds).length > 0) { print(Object.values(result.insertedIds).join(\",\")); } else { throw new Error('Insert failed'); }"') do set PROJECT_CATEGORY_ID=%%i

rem Display the inserted IDs
echo Inserted Project Category IDs: %PROJECT_CATEGORY_ID%

rem Now split the Project Category IDs into an array
rem Use comma as the delimiter to split the returned ObjectIds
setlocal enabledelayedexpansion
rem Split into multiple tokens
for /f "tokens=1,2,3,* delims=," %%a in ("%PROJECT_CATEGORY_ID%") do (
    set "CATEGORY_ID_0=%%a"
   
)


rem Clean the ObjectIds if needed
rem Here we assume clean_object_id is a function that you already have in your batch script
rem For example:
rem set CATEGORY_ID_1=!CATEGORY_ID_1:~1,-1!
rem set CATEGORY_ID_2=!CATEGORY_ID_2:~1,-1!
rem set CATEGORY_ID_3=!CATEGORY_ID_3:~1,-1!

rem Echo the cleaned IDs
echo Cleaned Project Category IDs:
echo !CATEGORY_ID_1!
echo !CATEGORY_ID_2!
echo !CATEGORY_ID_3!

set PROGRAMS_COLLECTION=programs

echo %ENTITY_ID% : this is the valeue

rem Insert Program Document
echo Inserting Program document into %PROGRAMS_COLLECTION% collection in %PROJECT_DB_NAME% database....



rem Define the query
set "mongo_query=db.getSiblingDB('%PROJECT_DB_NAME%').%PROGRAMS_COLLECTION%.insertOne({\"resourceType\": [\"program\"], \"language\": [\"English\"], \"keywords\": [], \"concepts\": [], \"components\": [], \"isAPrivateProgram\": false, \"isDeleted\": false, \"requestForPIIConsent\": true, \"rootOrganisations\": [], \"createdFor\": [], \"deleted\": false, \"status\": \"active\", \"owner\": \"1\", \"createdBy\": \"1\", \"updatedBy\": \"1\", \"externalId\": \"PG01\", \"name\": \"School Hygiene Improvement Initiative\", \"description\": \"The School Hygiene Improvement Initiative is dedicated to ensuring clean, safe, and healthy environments in schools.\", \"startDate\": \"2024-04-16T00:00:00.000Z\", \"endDate\": \"2025-12-16T18:29:59.000Z\", \"scope\": {\"state\":['!ENTITY_ID!'] , \"roles\": [\"state_education_officer\"], \"entityType\": \"state\"}}).insertedId"

rem Insert the document and capture the output
for /f "tokens=*" %%i in ('docker exec -i project_mongo_1 mongo --host %MONGO_HOST% --port %MONGO_PORT% --quiet --eval "!mongo_query!"') do set "PROGRAM_ID=%%i"

rem Check if PROGRAM_ID was set
if defined PROGRAM_ID (
    echo Program ID: %PROGRAM_ID%
) else (
    echo Error: Failed to retrieve Program ID. Please check the MongoDB query and the container status.
)

echo Program ID: %PROGRAM_ID%
rem Clean the ObjectId string to extract the raw ID

echo "Program ID: %PROGRAM_ID%"

rem Set MongoDB collection name
set "PROJECT_TEMPLATES_COLLECTION=projectTemplates"
set  CATEGORY_ID_1=%CATEGORY_ID_0:~9,-75%
set  CATEGORY_ID_2=%CATEGORY_ID_0:~46,-38%
set  CATEGORY_ID_3=%CATEGORY_ID_0:~83,-2%
set  PROGRAM_ID=%PROGRAM_ID:~9,-1%

echo "CATEGORY_ID_1:%CATEGORY_ID_1%"
echo "CATEGORY_ID_2:%CATEGORY_ID_2%"
echo "CATEGORY_ID_3:%CATEGORY_ID_3%"

echo "PROGRAM_ID : %PROGRAM_ID%"
rem Define the JSON document with escaped double quotes and placeholders for IDs
rem Build the PROJECT_TEMPLATES_DOCUMENT JSON string with delayed expansion
set "PROJECT_TEMPLATES_DOCUMENT=[{\"description\":\"The School Hygiene Improvement Initiative is dedicated to ensuring clean, safe, and healthy environments in schools...\",\"concepts\":[\"\"],\"keywords\":[\"\"],\"isDeleted\":false,\"recommendedFor\":[],\"tasks\":[],\"learningResources\":[{\"link\":\"https:\/\/youtu.be\/libKVRa01L8?feature=shared\",\"app\":\"projectService\",\"id\":\"libKVRa01L8?feature=shared\"}],\"isReusable\":false,\"title\":\"Washroom Hygiene\",\"externalId\":\"WASH-HYGIENE\",\"categories\":[{\"_id\":ObjectId(\"!CATEGORY_ID_1!\"),\"externalId\":\"educationLeader\",\"name\":\"Education Leader\"}],\"status\":\"published\",\"programId\":ObjectId(\"!PROGRAM_ID!\")},  {\"description\":\"The School Hygiene Improvement Initiative is dedicated to ensuring clean, safe, and healthy environments in schools...\",\"concepts\":[\"\"],\"keywords\":[\"\"],\"isDeleted\":false,\"recommendedFor\":[],\"tasks\":[],\"learningResources\":[{\"link\":\"https:\/\/youtu.be\/libKVRa01L8?feature=shared\",\"app\":\"projectService\",\"id\":\"libKVRa01L8?feature=shared\"}],\"isReusable\":false,\"title\":\"Library Management\",\"externalId\":\"LIB-MANAGEMENT\",\"categories\":[{\"_id\":ObjectId(\"!CATEGORY_ID_1!\"),\"externalId\":\"educationLeader\",\"name\":\"Education Leader\"}],\"status\":\"published\",\"programId\":ObjectId(\"!PROGRAM_ID!\")},{\"description\":\"Providing access to quality sports equipment fosters teamwork, promotes physical fitness, and nurtures the spirit of competition, ultimately contributing to the holistic development...\",\"concepts\":[\"\"],\"keywords\":[\"\"],\"isDeleted\":false,\"recommendedFor\":[],\"tasks\":[],\"learningResources\":[{\"link\":\"https:\/\/youtu.be\/libKVRa01L8?feature=shared\",\"app\":\"projectService\",\"id\":\"libKVRa01L8?feature=shared\"}],\"isReusable\":false,\"title\":\"Sports Management\",\"externalId\":\"SPORTS-MANAGEMENT\",\"categories\":[{\"_id\":ObjectId(\"!CATEGORY_ID_1!\"),\"externalId\":\"educationLeader\",\"name\":\"Education Leader\"}],\"status\":\"published\",\"programId\":ObjectId(\"!PROGRAM_ID!\")},]"


rem Display a message indicating the start of data insertion
echo Project template data being added to %PROJECT_TEMPLATES_COLLECTION% collection in %PROJECT_DB_NAME% database....

rem Run MongoDB command to insert the document and capture the inserted IDs
for /f "delims=" %%i in ('docker exec -i project_mongo_1 mongo --host %MONGO_HOST% --port %MONGO_PORT% --quiet --eval "var doc = %PROJECT_TEMPLATES_DOCUMENT%; var result = db.getSiblingDB('%PROJECT_DB_NAME%').%PROJECT_TEMPLATES_COLLECTION%.insertMany(doc); if (result.insertedIds && Object.keys(result.insertedIds).length > 0) { print(result.insertedIds); } else { throw new Error('Insert failed'); }"') do set "PROJECT_TEMPLATE_ID=%%i"
rem Display raw inserted document IDs
echo Inserted document IDs (raw): %PROJECT_TEMPLATE_ID%

rem Remove "ObjectId(" and ")" around each ID, then separate IDs by comma
set "PROJECT_TEMPLATE_ID=%PROJECT_TEMPLATE_ID:ObjectId(=%"
set "PROJECT_TEMPLATE_ID=%PROJECT_TEMPLATE_ID:)=%"
set "PROJECT_TEMPLATE_ID=%PROJECT_TEMPLATE_ID:),=%,%"

rem Enable delayed expansion for variable handling within loops
setlocal enabledelayedexpansion
set "i=0"

rem Parse individual ObjectIds into an array
for %%A in (%PROJECT_TEMPLATE_ID%) do (
    set "PROJECT_TEMPLATE_ID_ARRAY[!i!]=%%A"
    set /a i+=1
)

rem Display cleaned ObjectIds
echo Project Template IDs:
for /l %%i in (0,1,!i!-1) do (
    echo !PROJECT_TEMPLATE_ID_ARRAY[%%i]!
)

rem Assign specific IDs to variables for further use, if present
set "PROJECT_TEMPLATE_ID_1=!PROJECT_TEMPLATE_ID_ARRAY[0]!"
set "PROJECT_TEMPLATE_ID_2=!PROJECT_TEMPLATE_ID_ARRAY[1]!"
set "PROJECT_TEMPLATE_ID_3=!PROJECT_TEMPLATE_ID_ARRAY[2]!"
set "PROJECT_TEMPLATE_ID_4=!PROJECT_TEMPLATE_ID_ARRAY[3]!"

rem Display individual IDs if needed
echo Project Template ID 1: %PROJECT_TEMPLATE_ID_1%
echo Project Template ID 2: %PROJECT_TEMPLATE_ID_2%
echo Project Template ID 3: %PROJECT_TEMPLATE_ID_3%
echo Project Template ID 4: %PROJECT_TEMPLATE_ID_4%

set "PROJECT_TEMPLATE_TASKS_COLLECTION=projectTemplateTasks"

rem Define JSON data with dynamic ObjectId references
set "PROJECT_TEMPLATE_TASKS_DOCUMENTS=[{\"isDeleted\":false,\"isDeletable\":false,\"taskSequence\":[],\"children\":[],\"visibleIf\":[],\"hasSubTasks\":false,\"learningResources\":[{\"name\":\"Washroom management learning resource\",\"link\":\"https://youtube.com/watch?v=XExMb0XBhw4\",\"app\":\"projectService\",\"id\":\"watch?v=XExMb0XBhw4\"}],\"deleted\":false,\"type\":\"content\",\"projectTemplateId\":ObjectId(\"!PROJECT_TEMPLATE_ID_1!\"),\"projectTemplateExternalId\":\"WASH-HYGIENE\",\"name\":\"Keep the washroom clean.\",\"externalId\":\"Wash-Hyg-01\",\"description\":\"\",\"sequenceNumber\":\"1\",\"metaInformation\":{\"hasAParentTask\":\"NO\",\"parentTaskOperator\":\"\",\"parentTaskValue\":\"\",\"parentTaskId\":\"\",\"startDate\":\"30/08/2021\",\"endDate\":\"30/08/2029\",\"minNoOfSubmissionsRequired\":\"\"},\"__v\":NumberInt(0)},{\"isDeleted\":false,\"isDeletable\":false,\"taskSequence\":[],\"children\":[],\"visibleIf\":[],\"hasSubTasks\":false,\"learningResources\":[{\"name\":\"Library management learning resource\",\"link\":\"https://youtube.com/watch?v=XExMb0XBhw4\",\"app\":\"projectService\",\"id\":\"watch?v=XExMb0XBhw4\"}],\"deleted\":false,\"type\":\"content\",\"projectTemplateId\":ObjectId(\"!PROJECT_TEMPLATE_ID_2!\"),\"projectTemplateExternalId\":\"LIB-MANAGEMENT\",\"name\":\"Stack the books properly in the library.\",\"externalId\":\"Lib-Mana-01\",\"description\":\"\",\"sequenceNumber\":\"1\",\"metaInformation\":{\"hasAParentTask\":\"NO\",\"parentTaskOperator\":\"\",\"parentTaskValue\":\"\",\"parentTaskId\":\"\",\"startDate\":\"30/08/2021\",\"endDate\":\"30/08/2029\",\"minNoOfSubmissionsRequired\":\"\"},\"__v\":NumberInt(0)},{\"isDeleted\":false,\"isDeletable\":false,\"taskSequence\":[],\"children\":[],\"visibleIf\":[],\"hasSubTasks\":false,\"learningResources\":[{\"name\":\"Drinking water management learning resource\",\"link\":\"https://youtube.com/watch?v=XExMb0XBhw4\",\"app\":\"projectService\",\"id\":\"watch?v=XExMb0XBhw4\"}],\"deleted\":false,\"type\":\"content\",\"projectTemplateId\":ObjectId(\"!PROJECT_TEMPLATE_ID_3!\"),\"projectTemplateExternalId\":\"DRINKING-WATER-AVAILABILITY\",\"name\":\"Keep the drinking water vessels clean.\",\"externalId\":\"Drink-Wat-01\",\"description\":\"\",\"sequenceNumber\":\"1\",\"metaInformation\":{\"hasAParentTask\":\"NO\",\"parentTaskOperator\":\"\",\"parentTaskValue\":\"\",\"parentTaskId\":\"\",\"startDate\":\"30/08/2021\",\"endDate\":\"30/08/2029\",\"minNoOfSubmissionsRequired\":\"\"},\"__v\":NumberInt(0)},{\"isDeleted\":false,\"isDeletable\":false,\"taskSequence\":[],\"children\":[],\"visibleIf\":[],\"hasSubTasks\":false,\"learningResources\":[{\"name\":\"Sports management learning resource\",\"link\":\"https://youtube.com/watch?v=XExMb0XBhw4\",\"app\":\"projectService\",\"id\":\"watch?v=XExMb0XBhw4\"}],\"deleted\":false,\"type\":\"content\",\"projectTemplateId\":ObjectId(\"!PROJECT_TEMPLATE_ID_3!\"),\"projectTemplateExternalId\":\"SPORTS-MANAGEMENT\",\"name\":\"Stack the sport equipments in correct order.\",\"externalId\":\"Spor-Mana-01\",\"description\":\"\",\"sequenceNumber\":\"1\",\"metaInformation\":{\"hasAParentTask\":\"NO\",\"parentTaskOperator\":\"\",\"parentTaskValue\":\"\",\"parentTaskId\":\"\",\"startDate\":\"30/08/2021\",\"endDate\":\"30/08/2029\",\"minNoOfSubmissionsRequired\":\"\"},\"__v\":NumberInt(0)}]"

echo Project template tasks data being added to %PROJECT_TEMPLATE_TASKS_COLLECTION% collection in %PROJECT_DB_NAME% database....

rem Insert the documents using docker exec and capture the inserted IDs
for /f "tokens=*" %%i in ('docker exec -i project_mongo_1 mongo --host %MONGO_HOST% --port %MONGO_PORT% --quiet --eval "var doc = %PROJECT_TEMPLATE_TASKS_DOCUMENTS%; var result = db.getSiblingDB('%PROJECT_DB_NAME%').%PROJECT_TEMPLATE_TASKS_COLLECTION%.insertMany(doc); if (result.insertedIds && Object.keys(result.insertedIds).length > 0) { print(result.insertedIds); } else { throw new Error('Insert failed'); }"') do set "PROJECT_TEMPLATE_TASKS_ID=%%i"

rem Remove "ObjectId(" and ")" from each ID
set "PROJECT_TEMPLATE_TASKS_ID=%PROJECT_TEMPLATE_TASKS_ID:ObjectId(=%"
set "PROJECT_TEMPLATE_TASKS_ID=%PROJECT_TEMPLATE_TASKS_ID:)=%"
set "PROJECT_TEMPLATE_TASKS_ID=%PROJECT_TEMPLATE_TASKS_ID:),=%,%"

rem Parse and display individual IDs
echo Inserted Project Template Tasks IDs:
setlocal enabledelayedexpansion
set "i=0"
for %%A in (%PROJECT_TEMPLATE_TASKS_ID%) do (
    set "PROJECT_TEMPLATE_TASK_ID_!i!=%%A"
    echo Project Template Task ID !i!: %%A
    set /a i+=1
)

rem Solution Collection Setup (you may add further code for processing solutions if needed)
set "SOLUTIONS_COLLECTION=solutions"

rem JSON data with timestamps instead of ISODate, and placeholders for ObjectId
set "SOLUTION_DOCUMENT=[{\"resourceType\":[\"Improvement Project Solution\"],\"language\":[\"English\"],\"keywords\":[\"Improvement Project\"],\"entities\":[\"%ENTITY_ID%\"],\"programId\":ObjectId(\"%PROGRAM_ID%\"),\"name\":\"Washroom Hygiene\",\"description\":\"The School Hygiene Improvement Initiative is dedicated to ensuring clean, safe, and healthy environments in schools...\",\"programExternalId\":\"PG01\",\"scope\":{\"state\":[\"%ENTITY_ID%\"],\"roles\":[\"state_education_officer\"],\"entityType\":\"state\"},\"projectTemplateId\":ObjectId(\"%PROJECT_TEMPLATE_ID_1%\"),\"startDate\":ISODate(\"2024-08-30T00:00:00.000Z\"),\"endDate\":ISODate(\"2029-08-30T00:00:00.000Z\"),\"isDeleted\":false,\"isAPrivateProgram\":false,\"isReusable\":false,\"status\":\"active\",\"type\":\"improvementProject\"},{\"resourceType\":[\"Improvement Project Solution\"],\"language\":[\"English\"],\"keywords\":[\"Improvement Project\"],\"entities\":[\"%ENTITY_ID%\"],\"programId\":ObjectId(\"%PROGRAM_ID%\"),\"name\":\"Library Management\",\"description\":\"A robust library management program fosters a culture of reading and learning, empowering students to explore diverse resources...\",\"programExternalId\":\"PG01\",\"scope\":{\"state\":[\"%ENTITY_ID%\"],\"roles\":[\"state_education_officer\"],\"entityType\":\"state\"},\"projectTemplateId\":ObjectId(\"%PROJECT_TEMPLATE_ID_2%\"),\"startDate\":ISODate(\"2024-08-30T00:00:00.000Z\"),\"endDate\":ISODate(\"2029-08-30T00:00:00.000Z\"),\"isDeleted\":false,\"isAPrivateProgram\":false,\"isReusable\":false,\"status\":\"active\",\"type\":\"improvementProject\"},{\"resourceType\":[\"Improvement Project Solution\"],\"language\":[\"English\"],\"keywords\":[\"Improvement Project\"],\"entities\":[\"%ENTITY_ID%\"],\"programId\":ObjectId(\"%PROGRAM_ID%\"),\"name\":\"Drinking Water Management\",\"description\":\"Ensuring access to clean and safe water in schools is vital for fostering a healthy learning environment, enhancing student well-being, and promoting overall academic success.\",\"programExternalId\":\"PG01\",\"scope\":{\"state\":[\"%ENTITY_ID%\"],\"roles\":[\"state_education_officer\"],\"entityType\":\"state\"},\"projectTemplateId\":ObjectId(\"%PROJECT_TEMPLATE_ID_3%\"),\"startDate\":ISODate(\"2024-08-30T00:00:00.000Z\"),\"endDate\":ISODate(\"2029-08-30T00:00:00.000Z\"),\"isDeleted\":false,\"isAPrivateProgram\":false,\"isReusable\":false,\"status\":\"active\",\"type\":\"improvementProject\"}]"

echo Solution data being added to %SOLUTIONS_COLLECTION% collection in %PROJECT_DB_NAME% database....

rem Insert the document using docker exec and capture the inserted IDs
for /f "tokens=*" %%i in (
    'docker exec -i project_mongo_1 mongo --host %MONGO_HOST% --port %MONGO_PORT% --quiet --eval "var doc = %SOLUTION_DOCUMENT%; var result = db.getSiblingDB('%PROJECT_DB_NAME%').%SOLUTIONS_COLLECTION%.insertMany(doc); if (result.insertedIds && Object.keys(result.insertedIds).length > 0) { print(result.insertedIds); } else { throw new Error('Insert failed'); }"'
) do set "SOLUTION_ID=%%i"

rem Remove "ObjectId(" and ")" from each ID and parse them individually
set "SOLUTION_ID=%SOLUTION_ID:ObjectId(=%"
set "SOLUTION_ID=%SOLUTION_ID:)=%"
set "SOLUTION_ID=%SOLUTION_ID:),=%,%"

rem Parse and display individual IDs
echo Inserted Solution IDs: 
setlocal enabledelayedexpansion
set "i=0"
for %%A in (%SOLUTION_ID%) do (
    set "SOLUTION_ID_!i!=%%A"
    echo Solution ID !i!: %%A
    set /a i+=1
)
echo %PROJECT_TEMPLATE_ID_1%
echo  %SOLUTION_ID_1%
echo %PROJECT_TEMPLATE_TASK_ID_0%
rem Function to execute MongoDB update command in Docker
setlocal enabledelayedexpansion

rem Construct the MongoDB update query with proper escaping
set "mongo_update_query=db.getSiblingDB('%PROJECT_DB_NAME%').%PROJECT_TEMPLATES_COLLECTION%.updateOne({\"_id\": ObjectId(\"%PROJECT_TEMPLATE_ID_1%\")}, {\"$set\": {\"solutionId\": ObjectId(\"%SOLUTION_ID_0%\")}, \"$push\": {\"tasks\": ObjectId(\"%PROJECT_TEMPLATE_TASK_ID_0%\")}});"

rem Execute the MongoDB query inside the Docker container
docker exec -it project_mongo_1 mongo --host "!MONGO_HOST!" --port "!MONGO_PORT!" --quiet --eval "%mongo_update_query%"

set "mongo_update_query=db.getSiblingDB('%PROJECT_DB_NAME%').%PROJECT_TEMPLATES_COLLECTION%.updateOne({\"_id\": ObjectId(\"%PROJECT_TEMPLATE_ID_2%\")}, {\"$set\": {\"solutionId\": ObjectId(\"%SOLUTION_ID_1%\")}, \"$push\": {\"tasks\": ObjectId(\"%PROJECT_TEMPLATE_TASK_ID_1%\")}});"

rem Execute the MongoDB query inside the Docker container
docker exec -it project_mongo_1 mongo --host "!MONGO_HOST!" --port "!MONGO_PORT!" --quiet --eval "%mongo_update_query%"

set "mongo_update_query=db.getSiblingDB('%PROJECT_DB_NAME%').%PROJECT_TEMPLATES_COLLECTION%.updateOne({\"_id\": ObjectId(\"%PROJECT_TEMPLATE_ID_3%\")}, {\"$set\": {\"solutionId\": ObjectId(\"%SOLUTION_ID_2%\")}, \"$push\": {\"tasks\": ObjectId(\"%PROJECT_TEMPLATE_TASK_ID_2%\")}});"

rem Execute the MongoDB query inside the Docker container
docker exec -it project_mongo_1 mongo --host "!MONGO_HOST!" --port "!MONGO_PORT!" --quiet --eval "%mongo_update_query%"

:: Set configuration variables
set "CONFIGURATIONS_COLLECTION=configurations"

:: Create the JSON for the configuration document
set "CONFIGURATIONS_DOCUMENT={\"code\":\"keysAllowedForTargeting\",\"meta\":{\"profileKeys\":[\"state\",\"district\",\"school\",\"block\",\"cluster\",\"board\",\"class\",\"roles\",\"entities\",\"entityTypeId\",\"entityType\",\"subject\",\"medium\"]}}"

:: Output a message indicating data being added
echo Configurations data being added to %CONFIGURATIONS_COLLECTION% collection in %PROJECT_DB_NAME% database....

:: Insert CONFIGURATION_ID using docker exec
for /f "delims=" %%i in ('docker exec -it project_mongo_1 mongo --host "%MONGO_HOST%" --port "%MONGO_PORT%" --quiet --eval "var doc = %CONFIGURATIONS_DOCUMENT%; var result = db.getSiblingDB('%PROJECT_DB_NAME%').%CONFIGURATIONS_COLLECTION%.insertOne(doc); if (result.insertedId) { print(result.insertedId); } else { throw new Error('Insert failed'); }"') do set "CONFIGURATION_ID=%%i"

:: Remove unwanted parts of the result to get just the ObjectId
set "CONFIGURATION_ID=!CONFIGURATION_ID:~1,-1!"

:: Output the Configurations ID
echo Configurations ID: !CONFIGURATION_ID!
echo Document updated successfully.

echo All MongoDB operations completed successfully.

rem End delayed expansion
endlocal

@echo off
setlocal enabledelayedexpansion

rem Extract the MongoDB connection string
set MONGODB_URL=%1

rem Extract the database variables
for /f "tokens=4,5,6 delims=/: " %%a in ("%MONGODB_URL%") do (
    set DB_HOST=%%a
    set DB_PORT=%%b
    set DB_NAME=%%c
)

echo Extracted Database Variables:
echo DB_HOST: %DB_HOST%
echo DB_PORT: %DB_PORT%
echo DB_NAME: %DB_NAME%

rem Check if the MongoDB container is up
for /f "tokens=*" %%i in ('docker ps -q -f name=project_mongo_1') do (
    set CONTAINER_UP=1
)
if not defined CONTAINER_UP (
    echo MongoDB container is not running.
    exit /b 1
)
echo MongoDB container is up.

rem Wait for MongoDB to be ready
echo Waiting for MongoDB to be ready...
:wait_for_connection
mongo --host %DB_HOST% --port %DB_PORT% --eval "print('waited for connection')" >nul 2>&1
if errorlevel 1 (
    timeout /t 1 >nul
    goto wait_for_connection
)

echo MongoDB is ready.

rem Download the forms.json file
echo Downloading forms.json from GitHub...
curl -o forms.json https://raw.githubusercontent.com/ELEVATE-Project/observation-survey-projects-pwa/refs/heads/release-2.0.0/forms.json

rem Add default organizationId and deleted:false to forms.json
echo Adding default organizationId and deleted:false to forms.json...
jq "[.[] | .organizationId = 1 | .deleted = false | .version = 0]" forms.json > forms_with_orgId.json

rem Check the contents of the modified file
echo Checking contents of forms_with_orgId.json:
type forms_with_orgId.json

rem Delete existing documents from the forms collection
echo Deleting existing documents from the forms collection...
mongo --host %DB_HOST% --port %DB_PORT% %DB_NAME% --eval "db.forms.deleteMany({})"

rem Insert new documents from modified forms.json into MongoDB
echo Inserting new documents from modified forms.json into MongoDB...
mongoimport --host %DB_HOST% --port %DB_PORT% --db %DB_NAME% --collection forms --file forms_with_orgId.json --jsonArray

rem Clean up
del forms.json forms_with_orgId.json

endlocal
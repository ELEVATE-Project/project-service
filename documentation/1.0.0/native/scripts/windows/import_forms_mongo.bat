@echo off
setlocal enabledelayedexpansion


if "%ORGANIZATION_ID%"=="" set ORGANIZATION_ID=1

rem Set MongoDB connection details
set DB_HOST=127.0.0.1
set DB_PORT=27017
set DB_NAME=elevate-project

echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo Database: %DB_NAME%

echo Extracted Database Variables:
echo DB_HOST: !DB_HOST!
echo DB_PORT: !DB_PORT!
echo DB_NAME: !DB_NAME!
echo Using organizationId: !ORGANIZATION_ID!


echo Waiting for MongoDB to be ready...
:wait_for_mongo
mongo --host !DB_HOST! --port !DB_PORT! --eval "print(\"waited for connection\")" >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 1 >nul
    goto wait_for_mongo
)

echo MongoDB is ready.

REM Download the forms.json file
:: Download the forms.json file from GitHub
curl -o forms.json https://raw.githubusercontent.com/ELEVATE-Project/observation-survey-projects-pwa/refs/heads/release-2.0.0/forms.json
curl -o modifyform.js https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/dockerized/scripts/windows/modifyform.js
:: Modify forms.json to add organizationId, deleted, and version fields
echo Running Node.js script to modify forms.json...
node modifyform.js

:: Check if the modified file was created
if exist forms_with_orgId.json (
    echo forms_with_orgId.json created successfully.
) else (
    echo Failed to create forms_with_orgId.json.
    exit /b 1
)

set JSON_FILE_PATH=.\forms_with_orgId.json

echo !JSON_FILE_PATH!

REM Get the absolute path of the JSON file
for %%F in (!JSON_FILE_PATH!) do set ABSOLUTE_PATH=%%~dpF%%F

REM Replace backslashes with forward slashes for MongoDB compatibility
set ABSOLUTE_PATH=%ABSOLUTE_PATH:\=/%

if %errorlevel% neq 0 (
    echo Failed to import the JSON file into MongoDB.
    exit /b 1
) else (
    echo JSON file imported successfully.
)

REM Delete existing documents from the forms collection
echo Deleting existing documents from the forms collection...
mongo --host !DB_HOST! --port !DB_PORT! !DB_NAME! --eval "db.forms.deleteMany({})"

REM Insert new documents from modified forms.json into MongoDB
echo Inserting new documents from modified forms.json into MongoDB...
mongo --host !DB_HOST! --port !DB_PORT! --eval "var data = cat('!ABSOLUTE_PATH!'); db.getSiblingDB('!DB_NAME!').forms.insertMany(JSON.parse(data))"


REM Clean up
del forms.json
del forms_with_orgId.json

endlocal
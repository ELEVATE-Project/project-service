@echo off
setlocal enabledelayedexpansion

REM Check if Docker is running
echo Checking if Docker is running...
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker is not running. Please start Docker Desktop.
    pause
    exit /b
)

REM Start MongoDB Docker container if not running
echo Checking if MongoDB container is running...
docker inspect -f "{{.State.Running}}" project_mongo_1 >nul 2>&1
if errorlevel 1 (
    echo Starting MongoDB container...
    docker start project_mongo_1
) else (
    echo MongoDB container is already running.
)

REM Wait for MongoDB to be ready (optional delay)
timeout /t 5 /nobreak >nul

REM Check if Node.js is installed
echo Checking Node.js installation...
node -v >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js to continue.
    pause
    exit /b
)

REM Run the Node.js script to populate data
echo Running the Node.js script to populate MongoDB data...

REM Set MongoDB URL (Replace with your actual MongoDB connection string)
set MONGODB_URL=mongodb://localhost:27017

REM Execute Node.js script to insert data
@REM node insert_entity_project_data.js
docker exec -it project sh -c "node documentation/1.0.0/dockerized/scripts/windows/insert_entity_project_data.js"
REM Check if the script was executed successfully
if errorlevel 1 (
    echo An error occurred while populating the database.
) else (
    echo Data insertion completed successfully.
)

pause

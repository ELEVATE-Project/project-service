@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

echo ==========================================
echo Project Standalone Setup - Windows
echo ==========================================

echo.
echo Downloading entity sample data files...
echo ------------------------------------------

curl -L -o entity_sampleData.js ^
https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/common-files/dockerized/project-with-survey/entity_sampleData.js

curl -L -o project_sampleData.js ^
https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/common-files/dockerized/project-with-survey/project_sampleData.js

curl -L -o survey_sampleData.js ^
https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/common-files/dockerized/project-with-survey/survey_sampleData.js

curl -L -o insert_sample_solutions.js ^
https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/common-files/dockerized/project-with-survey/insert_sample_solutions.js

echo.
echo Files downloaded successfully.
echo.

REM ------------------------------------------------
REM Check and install Node.js
REM ------------------------------------------------
echo Checking Node.js installation...
node -v >nul 2>&1

IF ERRORLEVEL 1 (
    echo Node.js not found. Installing Node.js...
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
) ELSE (
    echo Node.js is already installed.
)

REM ------------------------------------------------
REM Check npm installation
REM ------------------------------------------------
echo.
echo Checking npm installation...
npm -v >nul 2>&1

IF ERRORLEVEL 1 (
    echo npm not found. Please reinstall Node.js.
    pause
    exit /b
)

REM ------------------------------------------------
REM Install mongodb npm package (REQUIRED CHANGE)
REM ------------------------------------------------
echo.
echo Installing mongodb npm package...

npm i mongodb

IF ERRORLEVEL 1 (
    echo Failed to install mongodb npm package.
    pause
    exit /b
) ELSE (
    echo mongodb npm package installed successfully.
)

REM ------------------------------------------------
REM Check and install MongoDB Server
REM ------------------------------------------------
echo.
echo Checking MongoDB installation...
mongod --version >nul 2>&1

IF ERRORLEVEL 1 (
    echo MongoDB Server not found. Installing MongoDB Server...
    winget install MongoDB.Server --accept-package-agreements --accept-source-agreements
) ELSE (
    echo MongoDB Server is already installed.
)

REM ------------------------------------------------
REM Check and install MongoDB Shell (mongosh)
REM ------------------------------------------------
echo.
echo Checking MongoDB Shell (mongosh)...
mongosh --version >nul 2>&1

IF ERRORLEVEL 1 (
    echo MongoDB Shell not found. Installing mongosh...
    winget install MongoDB.Shell --accept-package-agreements --accept-source-agreements
) ELSE (
    echo MongoDB Shell is already installed.
)

echo.
echo ==========================================
echo Setup completed successfully!
echo ==========================================

pause
ENDLOCAL

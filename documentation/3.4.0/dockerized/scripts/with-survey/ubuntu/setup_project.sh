#!/bin/bash

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> setup_log.txt
}

# Step 1: Download Docker Compose file
log "Downloading Docker Compose file..."
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/dockerFiles/with-survey/docker-compose-project.yml
log "Docker Compose file downloaded."

# Step 2: Download environment files
log "Downloading environment files..."
curl -L \
    -O https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/dockerized/envs/interface_env \
    -O https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/dockerized/envs/entity_management_env \
    -O https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/dockerized/envs/project_env \
    -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/notification_env \
    -O https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/dockerized/envs/scheduler_env \
    -O https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/dockerized/envs/user_env \
    -O https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/dockerized/envs/env.js \
    -O https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/envs/samiksha_env
log "Environment files downloaded."

# Step 3: Download replace_volume_path.sh script
log "Downloading replace_volume_path.sh script..."
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/dockerized/scripts/mac-linux/replace_volume_path.sh
log "replace_volume_path.sh script downloaded."

# Step 4: Make replace_volume_path.sh executable
log "Making replace_volume_path.sh executable..."
chmod +x replace_volume_path.sh
log "Made replace_volume_path.sh executable."

# Step 5: Run replace_volume_path.sh script
log "Running replace_volume_path.sh script..."
./replace_volume_path.sh
log "replace_volume_path.sh script executed."

# Step 6: Download additional scripts
log "Downloading docker-compose scripts..."
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/scripts/with-survey/ubuntu/docker-compose-up.sh
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/scripts/with-survey/ubuntu/docker-compose-down.sh
log "docker-compose scripts downloaded."

# Step 7: Make the scripts executable
log "Making docker-compose scripts executable..."
chmod +x docker-compose-up.sh
chmod +x docker-compose-down.sh
log "Made docker-compose scripts executable."

# Step 8: Create user directory and download SQL file
log "Creating user directory and downloading distributionColumns.sql..."
mkdir -p user && curl -o ./user/distributionColumns.sql -JL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/distribution-columns/user/distributionColumns.sql
log "User directory created and distributionColumns.sql downloaded."

# Step 9: Download and make citus_setup.sh executable
log "Downloading citus_setup.sh..."
curl -OJL https://github.com/ELEVATE-Project/project-service/blob/setupGuide-3.4/documentation/3.4.0/dockerized/scripts/stand-alone/ubuntu/citus_setup.sh
chmod +x citus_setup.sh

# Install MongoDB driver (usually needed if connecting directly to MongoDB/Citus)
npm install mongodb

# Install Mongoose (Object Data Modeling library, if the scripts use it)
npm install mongoose

# Step 11: Download additional scripts to add data
log "Downloading sample data scripts..."
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/scripts/with-survey/ubuntu/survey_sampleData.js
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/scripts/with-survey/ubuntu/entity_sampleData.js
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/scripts/with-survey/ubuntu/insert_sample_solutions.js
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/scripts/with-survey/ubuntu/insert_sample_data.sh
log "sample data scripts downloaded."


log "Downloading config.json file..."
curl -L https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/scripts/with-survey/ubuntu/configFile.json -o config.json
log "config.json file is downloaded."

# Step 13: Run docker-compose-up.sh script
log "Running docker-compose-up.sh script..."
./docker-compose-up.sh
log "docker-compose-up.sh script executed."

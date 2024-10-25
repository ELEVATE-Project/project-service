#!/bin/bash

# Script to set up the Project application environment

# Log file to record the process
LOGFILE="setup_project.log"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOGFILE"
}

# Step 1: Download the docker-compose file
log_message "Starting Step 1: Downloading docker-compose-project.yml"
curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/docker-compose-project.yml
log_message "Completed Step 1: docker-compose-project.yml downloaded."

# Step 2: Download environment files
log_message "Starting Step 2: Downloading environment files"
curl -L \
 -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/interface_env \
 -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/entity_management_env \
 -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/project_env \
 -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/notification_env \
 -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/scheduler_env \
 -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/user_env \
 -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/env.js
log_message "Completed Step 2: Environment files downloaded."

# Step 3: Download the replace_volume_path.sh script
log_message "Starting Step 3: Downloading replace_volume_path.sh"
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/dockerized/scripts/mac-linux/replace_volume_path.sh
log_message "Completed Step 3: replace_volume_path.sh downloaded."

# Step 4: Make replace_volume_path.sh executable
log_message "Starting Step 4: Making replace_volume_path.sh executable"
chmod +x replace_volume_path.sh
log_message "Completed Step 4: replace_volume_path.sh is now executable."

# Step 5: Run the replace_volume_path.sh script
log_message "Starting Step 5: Running replace_volume_path.sh"
./replace_volume_path.sh
log_message "Completed Step 5: replace_volume_path.sh executed."

# Step 6: Download docker-compose scripts
log_message "Starting Step 6: Downloading docker-compose scripts"
curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/scripts/mac-linux/docker-compose-up.sh
curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/scripts/mac-linux/docker-compose-down.sh
log_message "Completed Step 6: docker-compose scripts downloaded."

# Step 7: Make docker-compose scripts executable
log_message "Starting Step 7: Making docker-compose scripts executable"
chmod +x docker-compose-up.sh
chmod +x docker-compose-down.sh
log_message "Completed Step 7: docker-compose scripts are now executable."

# Step 8: Download the citus_setup.sh script
log_message "Starting Step 8: Downloading citus_setup.sh"
curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/scripts/mac-linux/citus_setup.sh
log_message "Completed Step 8: citus_setup.sh downloaded."

# Step 9: Make citus_setup.sh executable
log_message "Starting Step 9: Making citus_setup.sh executable"
chmod +x citus_setup.sh
log_message "Completed Step 9: citus_setup.sh is now executable."

# Step 10: Create sample-data/user directory and download sampleData.sql
log_message "Starting Step 10: Creating directory and downloading sampleData.sql"
mkdir -p sample-data/user && \
curl -L https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/sample-data/mac-linux/user/sampleData.sql -o sample-data/user/sampleData.sql
log_message "Completed Step 10: Directory created and sampleData.sql downloaded."

# Step 11: Download and make insert_sample_data.sh executable
log_message "Starting Step 11: Downloading insert_sample_data.sh"
curl -L -o insert_sample_data.sh https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/dockerized/scripts/mac-linux/insert_sample_data.sh
chmod +x insert_sample_data.sh
log_message "Completed Step 11: insert_sample_data.sh downloaded and made executable."

# Step 12: Download add_sample_project_entity_data.sh
log_message "Starting Step 12: Downloading add_sample_project_entity_data.sh"
curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/scripts/mac-linux/add_sample_project_entity_data.sh
chmod +x add_sample_project_entity_data.sh
log_message "Completed Step 12: add_sample_project_entity_data.sh downloaded and made executable."

# Step 13: Run the docker-compose-up.sh script
log_message "Starting Step 13: Running docker-compose-up.sh"
./docker-compose-up.sh
log_message "Completed Step 13: docker-compose-up.sh executed."

log_message "Project application setup completed."

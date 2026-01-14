#!/bin/bash
set -e

# -----------------------------
# Logging function
# -----------------------------
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a setup_log.txt
}

# -----------------------------
# Step 0: Install Homebrew, Node.js, MongoDB
# -----------------------------
log "Installing Homebrew (if missing)..."
if ! command -v brew >/dev/null 2>&1; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

log "Installing Node.js..."
brew install node || true

log "Installing MongoDB Community 7.0..."
brew tap mongodb/brew || true
brew install mongodb-community@7.0 || true
log "Node.js and MongoDB installation completed."

# -----------------------------
# Step 1: Check Docker availability
# -----------------------------
log "Checking Docker availability..."
if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker is not installed. Install Docker Desktop for Mac first."
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi
log "Docker is installed and running."

# -----------------------------
# Step 2: Download Docker Compose file
# -----------------------------
log "Downloading Docker Compose file..."
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/dockerFiles/project-with-survey/docker-compose-project.yml
log "Docker Compose file downloaded."

# -----------------------------
# Step 3: Download environment files
# -----------------------------
log "Downloading environment files..."
curl -L \
    -O https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/dockerized/envs/interface_env \
    -O https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/dockerized/envs/entity_management_env \
    -O https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/dockerized/envs/project_env \
    -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/notification_env \
    -O https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/dockerized/envs/scheduler_env \
    -O https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/dockerized/envs/user_env \
    -O https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/envs/samiksha_env
log "Environment files downloaded."

# -----------------------------
# Step 4: replace_volume_path.sh
# -----------------------------
log "Downloading replace_volume_path.sh..."
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/dockerized/scripts/mac-linux/replace_volume_path.sh
chmod +x replace_volume_path.sh
./replace_volume_path.sh
log "Volume paths updated."

# -----------------------------
# Step 5: docker-compose scripts (mac-safe)
# -----------------------------
# Step 6: Download additional scripts
log "Downloading docker-compose scripts..."
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/scripts/project-with-survey/ubuntu/docker-compose-up.sh
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/scripts/project-with-survey/ubuntu/docker-compose-down.sh
log "docker-compose scripts downloaded."

# ---- SAFE patch (command only, filenames untouched)
sed -i '' 's/^docker-compose /docker compose /g' docker-compose-up.sh
sed -i '' 's/^docker-compose /docker compose /g' docker-compose-down.sh
log "docker-compose scripts patched safely."

# -----------------------------
# Step 6: SQL distribution file
# -----------------------------
log "Downloading distributionColumns.sql..."
mkdir -p user
curl -o ./user/distributionColumns.sql -JL \
https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/distribution-columns/user/distributionColumns.sql
log "distributionColumns.sql downloaded."

# -----------------------------
# Step 7: Citus setup script
# -----------------------------
log "Downloading citus_setup.sh..."
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/dockerized/scripts/stand-alone/ubuntu/citus_setup.sh
chmod +x citus_setup.sh
log "citus_setup.sh downloaded."

# -----------------------------
# Step 8: Sample data scripts
# -----------------------------
log "Downloading sample data scripts..."
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/scripts/project-with-survey/ubuntu/survey_sampleData.js
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/scripts/project-with-survey/ubuntu/entity_sampleData.js
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/scripts/project-with-survey/ubuntu/project_sampleData.js
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideWithSurvey/documentation/3.4.0/dockerized/scripts/project-with-survey/ubuntu/insert_sample_solutions.js
curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/macSetupWithSurvey/documentation/3.4.0/dockerized/scripts/project-with-survey/mac-os/insert_sample_data.sql
log "sample data scripts downloaded."

# -----------------------------
# Step 9: Node dependencies (FIX)
# -----------------------------
log "Installing Node dependencies..."
if [ ! -f package.json ]; then
    npm init -y
fi
npm install mongodb
log "MongoDB Node driver installed."

# -----------------------------
# Step 10: config.json
# -----------------------------
log "Downloading config.json..."
curl -L https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/dockerized/scripts/stand-alone/ubuntu/configFile.json -o config.json
log "config.json downloaded."

# -----------------------------
# Step 11: Start services
# -----------------------------
log "Starting services using docker compose..."
./docker-compose-up.sh
log "Docker services started successfully."
#!/bin/bash
# ----------------------------------------------------------------------
# ELEVATE Project Data Setup Script
#
# This script performs the following actions:
# 1. Downloads sample data files from the ELEVATE-Project GitHub repository.
# 2. Installs the 'mongoose' package (required to run the sample scripts).
# 3. Executes the sample data insertion script using Node.js.
# ----------------------------------------------------------------------

# Exit immediately if a command exits with a non-zero status (ensures script stops on download failure)
set -e

echo "Starting data setup script..."

# --- 1. Define URL and Files ---
BASE_URL="https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideSCP/documentation/3.4.0/native/scripts/scp/ubuntu"

ENTITY_FILE="entity_sampleData.js"
PROJECT_FILE="project_sampleData.js"
INSERT_SCRIPT="insert_sample_solutions.js"

# --- 2. Download Files ---
echo "1. Downloading sample data files..."

# Download entity_sampleData.js
curl -L "${BASE_URL}/${ENTITY_FILE}" -o "${ENTITY_FILE}"
echo "Downloaded ${ENTITY_FILE}"

# Download project_sampleData.js
curl -L "${BASE_URL}/${PROJECT_FILE}" -o "${PROJECT_FILE}"
echo "Downloaded ${PROJECT_FILE}"

# Download insert_sample_solutions.js (saved correctly to be run by node)
curl -L "${BASE_URL}/${INSERT_SCRIPT}" -o "${INSERT_SCRIPT}"
echo "Downloaded ${INSERT_SCRIPT}"

# NOTE on Original Request: If you need to populate 'user/src/.env' with a specific file,
# you would add another 'curl' command here, but the file you linked was a JS script.

# --- 3. Install Dependencies ---
echo ""
echo "2. Installing required Node packages (mongoose)..."
npm install mongoose
npm install mongodb

# --- 4. Run Insertion Script ---
echo ""
echo "3. Running the sample data insertion script..."
node "${INSERT_SCRIPT}"

echo ""
echo "--- Data setup complete! ---"
#!/bin/bash

# Extract the MongoDB connection string
MONGODB_URL="$1"

# Extract the database variables
DB_HOST=$(echo $MONGODB_URL | awk -F'[/:]' '{print $4}')
DB_PORT=$(echo $MONGODB_URL | awk -F'[/:]' '{print $5}')
DB_NAME=$(echo $MONGODB_URL | awk -F'[/:]' '{print $6}')

echo "Extracted Database Variables:"
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"
echo "DB_NAME: $DB_NAME"

# Check if the MongoDB container is up
if [ "$(docker ps -q -f name=project_mongo_1)" ]; then
    echo "MongoDB container is up."
else
    echo "MongoDB container is not running."
    exit 1
fi

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
until docker exec project_mongo_1 mongo --host $DB_HOST --port $DB_PORT --eval "print(\"waited for connection\")"; do
    sleep 1
done

echo "MongoDB is ready."

# Download the forms.json file
echo "Downloading forms.json from GitHub..."
curl -o forms.json https://raw.githubusercontent.com/ELEVATE-Project/observation-survey-projects-pwa/refs/heads/release-2.0.0/forms.json

# Modify forms.json to add organizationId, deleted, and version without jq
echo "Adding organizationId, deleted:false, and version:0 to forms.json..."

# Add organizationId, deleted, and version fields using sed and awk
sed 's/{/{ "organizationId": 1, "deleted": false, "version": 0, /' forms.json > forms_modified.json

# Insert the modified JSON file into MongoDB using mongoimport
echo "Inserting new documents into the forms collection..."
docker cp forms_modified.json project_mongo_1:/forms_modified.json
docker exec project_mongo_1 mongoimport --host $DB_HOST --port $DB_PORT --db $DB_NAME --collection forms --file /forms_modified.json --jsonArray

# Clean up
rm forms.json forms_modified.json

echo "Data insertion complete."

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
until mongo --host $DB_HOST --port $DB_PORT --eval "print(\"waited for connection\")"; do
    sleep 1
done

echo "MongoDB is ready."

# Download the forms.json file
echo "Downloading forms.json from GitHub..."
curl -o forms.json https://raw.githubusercontent.com/5Amogh/observation-survey-projects-pwa/refs/heads/release-2.0.0/forms.json

# Add default organizationId and deleted:false to forms.json
echo "Adding default organizationId and deleted:false to forms.json..."
jq '[.[] | .organizationId = 1 | .deleted = false | .version = 0]' forms.json > /tmp/forms_with_orgId.json

# Check the contents of the modified file
echo "Checking contents of /tmp/forms_with_orgId.json:"
cat /tmp/forms_with_orgId.json

# Delete existing documents from the forms collection
echo "Deleting existing documents from the forms collection..."
mongo --host $DB_HOST --port $DB_PORT $DB_NAME --eval 'db.forms.deleteMany({})'

# Insert new documents from modified forms.json into MongoDB
echo "Inserting new documents from modified forms.json into MongoDB..."
mongoimport --host $DB_HOST --port $DB_PORT --db $DB_NAME --collection forms --file /tmp/forms_with_orgId.json --jsonArray

# Clean up
rm forms.json /tmp/forms_with_orgId.json
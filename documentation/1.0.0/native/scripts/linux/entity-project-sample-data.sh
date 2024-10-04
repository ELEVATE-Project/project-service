#!/bin/bash

clean_object_id() {
    local object_id="$1"

    # Use parameter expansion to remove unwanted characters
    cleaned_id="${object_id//ObjectId(/}"
    cleaned_id="${cleaned_id//)/}"
    cleaned_id="${cleaned_id//\'/}"

    echo "$cleaned_id"
}


MONGO_HOST=localhost
MONGO_PORT=27017

# Entity database details
ENTITY_SERVICE_DB_NAME="elevate-entity"
ENTITY_TYPE_COLLECTION="entityTypes"
ENTITIES_COLLECTION="entities"

ENTITY_TYPE_DOCUMENT=$(cat <<EOF
{
    "name": "state",
    "toBeMappedToParentEntities": true,
    "immediateChildrenEntityType": []
}
EOF
)

echo "EntityType data being added to $ENTITY_TYPE_COLLECTION collection in $ENTITY_SERVICE_DB_NAME database...."
ENTITY_TYPE_ID=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $ENTITY_TYPE_DOCUMENT
    var result = db.getSiblingDB('$ENTITY_SERVICE_DB_NAME').$ENTITY_TYPE_COLLECTION.insertOne(doc);
    if (result.insertedId) {
        print(result.insertedId);
    } else {
        throw new Error('Insert failed');
    }
")

ENTITY_TYPE_ID=$(clean_object_id "$ENTITY_TYPE_ID")
echo "EntityType ID: $ENTITY_TYPE_ID"

ENTITIES_DOCUMENT=$(cat <<EOF
{
    "name" : "Karnataka",
    "entityType" : "state",
    "entityTypeId" : "$ENTITY_TYPE_ID",
    "userId" : "1"
}
EOF
)

echo "Entity data being added to $ENTITIES_COLLECTION collection in $ENTITY_SERVICE_DB_NAME database...."

ENTITY_ID=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $ENTITIES_DOCUMENT
    var result = db.getSiblingDB('$ENTITY_SERVICE_DB_NAME').$ENTITIES_COLLECTION.insertOne(doc);
    if (result.insertedId) {
        print(result.insertedId);
    } else {
        throw new Error('Insert failed');
    }
")

ENTITY_ID=$(clean_object_id "$ENTITY_ID")
echo "Entity ID: $ENTITY_ID"

# Project database details
PROJECT_DB_NAME="elevate-project"
PROJECT_CATEGORY_COLLECTION="projectCategories"

PROJECT_CATEGORY_DOCUMENT=$(cat <<EOF
{
    "externalId" : "educationLeader",
    "name" : "Education Leader"
}
EOF
)

echo "Project category data being added to $PROJECT_CATEGORY_COLLECTION collection in $PROJECT_DB_NAME database...."

PROJECT_CATEGORY_ID=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $PROJECT_CATEGORY_DOCUMENT
    var result = db.getSiblingDB('$PROJECT_DB_NAME').$PROJECT_CATEGORY_COLLECTION.insertOne(doc);
    if (result.insertedId) {
        print(result.insertedId);
    } else {
        throw new Error('Insert failed');
    }
")

PROJECT_CATEGORY_ID=$(clean_object_id "$PROJECT_CATEGORY_ID")
echo "Project Category ID: $PROJECT_CATEGORY_ID"

PROGRAMS_COLLECTION="programs"

PROGRAMS_DOCUMENT=$(cat <<EOF
{
    "resourceType": ["program"],
    "language": ["English"],
    "keywords": [],
    "concepts": [],
    "components": [],
    "isAPrivateProgram": false,
    "isDeleted": false,
    "requestForPIIConsent": true,
    "rootOrganisations": [],
    "createdFor": [],
    "deleted": false,
    "status": "active",
    "owner": "1",
    "createdBy": "1",
    "updatedBy": "1",
    "externalId": "PG01",
    "name": "School Hygiene Improvement Initiative",
    "description": "The School Hygiene Improvement Initiative is dedicated to ensuring clean, safe, and healthy environments in schools. This program focuses on promoting hygiene best practices among students, staff, and administrators to prevent the spread of illnesses, enhance student well-being, and foster an atmosphere conducive to learning. Through regular cleanliness audits, sanitation drives, and hygiene awareness campaigns, the program aims to improve the condition of school facilities, particularly washrooms, classrooms, and common areas. Special emphasis is placed on educating students about personal hygiene, proper handwashing techniques, and maintaining a clean environment to create a culture of responsibility and care within the school community.",
    "startDate": "2024-04-16T00:00:00.000Z",
    "endDate": "2025-12-16T18:29:59.000Z",
    "scope": {
        "state": ["$ENTITY_ID"],
        "roles": ["district_education_officer"],
        "entityType": "state"
    }
}
EOF
)

echo "Program data being added to $PROGRAMS_COLLECTION collection in $PROJECT_DB_NAME database...."

PROGRAM_ID=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $PROGRAMS_DOCUMENT
    var result = db.getSiblingDB('$PROJECT_DB_NAME').$PROGRAMS_COLLECTION.insertOne(doc);
    if (result.insertedId) {
        print(result.insertedId);
    } else {
        throw new Error('Insert failed');
    }
")

PROGRAM_ID=$(clean_object_id "$PROGRAM_ID")
echo "Program ID: $PROGRAM_ID"

PROJECT_TEMPLATES_COLLECTION="projectTemplates"

PROJECT_TEMPLATES_DOCUMENT=$(cat <<EOF
{
    "description": "The School Hygiene Improvement Initiative is dedicated to ensuring clean, safe, and healthy environments in schools...",
    "concepts": [""],
    "keywords": [""],
    "isDeleted": false,
    "recommendedFor": [],
    "tasks": [],
    "learningResources": [{
        "link": "https://youtu.be/libKVRa01L8?feature=shared",
        "app": "projectService",
        "id": "libKVRa01L8?feature=shared"
    }],
    "isReusable": false,
    "title": "Washroom Hygiene",
    "externalId": "WASH-HYGIENE",
    "categories": [{
        "_id": "$PROJECT_CATEGORY_ID",
        "externalId": "educationLeader",
        "name": "Education Leader"
    }],
    "status": "published",
    "programId": "$PROGRAM_ID"
}
EOF
)

echo "Project template data being added to $PROJECT_TEMPLATES_COLLECTION collection in $PROJECT_DB_NAME database...."

PROJECT_TEMPLATE_ID=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $PROJECT_TEMPLATES_DOCUMENT
    var result = db.getSiblingDB('$PROJECT_DB_NAME').$PROJECT_TEMPLATES_COLLECTION.insertOne(doc);
    if (result.insertedId) {
        print(result.insertedId);
    } else {
        throw new Error('Insert failed');
    }
")

PROJECT_TEMPLATE_ID=$(clean_object_id "$PROJECT_TEMPLATE_ID")
echo "Project Template ID: $PROJECT_TEMPLATE_ID"

SOLUTIONS_COLLECTION="solutions"

SOLUTION_DOCUMENT=$(cat <<EOF
{
    "resourceType": ["Improvement Project Solution"],
    "language": ["English"],
    "keywords": ["Improvement Project"],
    "entities": ["$ENTITY_ID"],
    "programId": "$PROGRAM_ID",
    "name": "Washroom Hygiene",
    "description": "The School Hygiene Improvement Initiative is dedicated to ensuring clean, safe, and healthy environments in schools...",
    "programExternalId": "PG01",
    "scope": {
        "state": ["$ENTITY_ID"],
        "roles": ["district_education_officer"],
        "entityType": "state"
    },
    "projectTemplateId": "$PROJECT_TEMPLATE_ID"
}
EOF
)

echo "Solution data being added to $SOLUTIONS_COLLECTION collection in $PROJECT_DB_NAME database...."

SOLUTION_ID=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $SOLUTION_DOCUMENT
    var result = db.getSiblingDB('$PROJECT_DB_NAME').$SOLUTIONS_COLLECTION.insertOne(doc);
    if (result.insertedId) {
        print(result.insertedId);
    } else {
        throw new Error('Insert failed');
    }
")
SOLUTION_ID=$(clean_object_id "$SOLUTION_ID")
echo "Solution ID: $SOLUTION_ID"

CONFIGURATIONS_COLLECTION="configurations"

CONFIGURATIONS_DOCUMENT=$(cat <<EOF
{
    "code" : "keysAllowedForTargeting",
    "meta" : {
        "profileKeys" : [
            "state", "district", "school", "block", "cluster",
            "board", "class", "roles", "entities", "entityTypeId",
            "entityType", "subject", "medium"
        ]
    }
}
EOF
)

echo "Configurations data being added to $CONFIGURATIONS_COLLECTION collection in $PROJECT_DB_NAME database...."

CONFIGURATION_ID=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $CONFIGURATIONS_DOCUMENT
    var result = db.getSiblingDB('$PROJECT_DB_NAME').$CONFIGURATIONS_COLLECTION.insertOne(doc);
    if (result.insertedId) {
        print(result.insertedId.valueOf()); // Print the ID directly
    } else {
        throw new Error('Insert failed');
    }
")

CONFIGURATION_ID=$(clean_object_id "$CONFIGURATION_ID")
echo "Configurations ID: $CONFIGURATION_ID"

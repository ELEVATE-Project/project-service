#!/bin/bash

# MongoDB details
MONGO_HOST="mongodb_container"
MONGO_PORT="27017"
MONGO_CONTAINER_NAME="mongodb_container"


# Entity database details
ENTITY_SERVICE_DB_NAME="elevate-entity"
ENTITY_TYPE_COLLECTION="entityTypes"
ENTITIES_COLLECTION="entities"

ENTITY_TYPE_DOCUMENT=$(cat <<EOF
{
    "name" : "state",
    "toBeMappedToParentEntities" : true,
    "immediateChildrenEntityType" : []
}
EOF
)

echo "EntityType data being added to $ENTITY_TYPE_COLLECTION collection in $ENTITY_SERVICE_DB_NAME database...."

ENTITY_TYPE_INSERTED_DOCUMENT=$(mongo --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet <<EOF
use $ENTITY_SERVICE_DB_NAME;
var result = db.$ENTITY_TYPE_COLLECTION.insert($ENTITY_TYPE_DOCUMENT);
var insertedDocument = db.$ENTITY_TYPE_COLLECTION.findOne({ _id: result.insertedIds[0] });
EOF
)

# Extract the _id from the inserted document using jq
ENTITY_TYPE_ID=$(echo "$ENTITY_TYPE_INSERTED_DOCUMENT" | jq -r '._id.$oid')
echo "EntityType ID: $ENTITY_TYPE_ID"


ENTITIES_DOCUMENT=$(cat <<EOF 
{
    "name" : "Karnatka",
    "entityType" : "state",
    "entityTypeId" : `$ENTITY_TYPE_ID`,
    "userId" : "1"
}
EOF
)

echo "Entity data being added to $ENTITIES_COLLECTION collection in $ENTITY_SERVICE_DB_NAME database...."

ENTITY_INSERTED_DOCUMENT=$(mongo --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet <<EOF
use $ENTITY_SERVICE_DB_NAME;
var result = db.$ENTITIES_COLLECTION.insert($ENTITIES_DOCUMENT);
var insertedDocument = db.$ENTITIES_COLLECTION.findOne({ _id: result.insertedIds[0] });
EOF
)

# Extract the _id from the inserted document using jq
ENTITY_ID=$(echo "$ENTITY_INSERTED_DOCUMENT" | jq -r '._id.$oid')
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

PROJECT_CATEGORY_INSERTED_DOCUMENT=$(mongo --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet <<EOF
use $PROJECT_DB_NAME;
var result = db.$PROJECT_CATEGORY_COLLECTION.insert($PROJECT_CATEGORY_DOCUMENT);
var insertedDocument = db.$PROJECT_CATEGORY_COLLECTION.findOne({ _id: result.insertedIds[0] });
EOF
)

# Extract the _id from the inserted document using jq
PROJECT_CATEGORY_ID=$(echo "$PROJECT_CATEGORY_INSERTED_DOCUMENT" | jq -r '._id.$oid')
echo "Project Category ID: $PROJECT_CATEGORY_ID"

PROGRAMS_COLLECTION="programs"

PROGRAMS_DOCUMENT=$(cat <<EOF 
{
    "resourceType": [
        "program"
    ],
    "language": [
        "English"
    ],
    "keywords": [],
    "concepts": [],
    "components": [
    ],
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
    "imageCompression": {
        "quality": 10
    },
    "startDate": "2024-04-16T00:00:00.000Z",
    "endDate": "2025-12-16T18:29:59.000Z",
    "scope": {
        "state": [`$ENTITY_ID`],
        "roles": ["district_education_officer"]
        "entityType": "state"
    }
}
EOF
)

echo "Program data being added to $PROGRAMS_COLLECTION collection in $PROJECT_DB_NAME database...."

PROGRAM_INSERTED_DOCUMENT=$(mongo --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet <<EOF
use $PROJECT_DB_NAME;
var result = db.$PROGRAMS_COLLECTION.insert($PROGRAMS_DOCUMENT);
var insertedDocument = db.$PROGRAMS_COLLECTION.findOne({ _id: result.insertedIds[0] });
EOF
)

# Extract the _id from the inserted document using jq
PROGRAM_ID=$(echo "$PROGRAM_INSERTED_DOCUMENT" | jq -r '._id.$oid')
echo "Program ID: $PROGRAM_ID"

PROJECT_TEMPLATES_COLLECTION="projectTemplates"

PROJECT_TEMPLATES_DOCUMENT=$(cat <<EOF 
{
    "description": "The School Hygiene Improvement Initiative is dedicated to ensuring clean, safe, and healthy environments in schools. This program focuses on promoting hygiene best practices among students, staff, and administrators to prevent the spread of illnesses, enhance student well-being, and foster an atmosphere conducive to learning. Through regular cleanliness audits, sanitation drives, and hygiene awareness campaigns, the program aims to improve the condition of school facilities, particularly washrooms, classrooms, and common areas. Special emphasis is placed on educating students about personal hygiene, proper handwashing techniques, and maintaining a clean environment to create a culture of responsibility and care within the school community.",
    "concepts": [
        ""
    ],
    "keywords": [
        ""
    ],
    "isDeleted": false,
    "recommendedFor": [],
    "tasks": [
    ],
    "createdBy": "1",
    "updatedBy": "1",
    "learningResources": [
        {
            "link": "https://youtu.be/libKVRa01L8?feature=shared",
            "app": "projectService",
            "id": "libKVRa01L8?feature=shared"
        }
    ],
    "isReusable": false,
    "taskSequence": [
    ],
    "averageRating": 0,
    "noOfRatings": 0,
    "ratings": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0
    },
    "deleted": false,
    "title": "Washroom Hygiene",
    "externalId": "WASH-HYGIENE",
    "categories": [
        {
            "_id": `$PROJECT_CATEGORY_ID`,
            "externalId" : "educationLeader",
            "name" : "Education Leader"
        }
    ],
    "entityType": "",
    "taskCreationForm": "",
    "metaInformation": {
        "goal": "TEMP",
        "rationale": "",
        "primaryAudience": "",
        "duration": "2 months",
        "successIndicators": "",
        "risks": "",
        "approaches": ""
    },
    "status": "published",
    "solutionId": `$SOLUTION_ID`,
    "solutionExternalId": "SOL01",
    "programId": `$PROGRAM_ID`,
    "programExternalId": "PG01",
    "parentTemplateId": "66d56ece8e6f27c2598a26b5"
}
EOF
)

echo "Project template data being added to $PROJECT_TEMPLATES_COLLECTION collection in $PROJECT_DB_NAME database...."

PROJECT_TEMPLATE_INSERTED_DOCUMENT=$(mongo --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet <<EOF
use $PROJECT_DB_NAME;
var result = db.$PROJECT_TEMPLATES_COLLECTION.insert($PROJECT_TEMPLATES_DOCUMENT);
var insertedDocument = db.$PROJECT_TEMPLATES_COLLECTION.findOne({ _id: result.insertedIds[0] });
EOF
)

# Extract the _id from the inserted document using jq
PROJECT_TEMPLATE_ID=$(echo "$PROJECT_TEMPLATES_DOCUMENT" | jq -r '._id.$oid')
echo "Project Template ID: $PROJECT_TEMPLATE_ID"


SOLUTIONS_COLLECTION="solutions"

SOLUTION_DOCUMENT=$(cat <<EOF 
{
    "resourceType": [
        "Improvement Project Solution"
    ],
    "language": [
        "English"
    ],
    "keywords": [
        "Improvement Project"
    ],
    "concepts": [],
    "themes": [],
    "flattenedThemes": [],
    "entities": [
        `$ENTITY_ID`
    ],
    "registry": [],
    "isRubricDriven": false,
    "enableQuestionReadOut": false,
    "captureGpsLocationAtQuestionLevel": false,
    "isAPrivateProgram": false,
    "allowMultipleAssessemts": false,
    "isDeleted": false,
    "pageHeading": "Domains",
    "minNoOfSubmissionsRequired": 1,
    "rootOrganisations": [],
    "createdFor": [],
    "deleted": false,
    "programExternalId": "PG01",
    "entityType": "state",
    "externalId": "SOL01",
    "name": "Washroom Hygiene",
    "description": "The School Hygiene Improvement Initiative is dedicated to ensuring clean, safe, and healthy environments in schools. This program focuses on promoting hygiene best practices among students, staff, and administrators to prevent the spread of illnesses, enhance student well-being, and foster an atmosphere conducive to learning. Through regular cleanliness audits, sanitation drives, and hygiene awareness campaigns, the program aims to improve the condition of school facilities, particularly washrooms, classrooms, and common areas. Special emphasis is placed on educating students about personal hygiene, proper handwashing techniques, and maintaining a clean environment to create a culture of responsibility and care within the school community.",
    "isReusable": false,
    "startDate": "2024-04-16T00:00:00.000Z",
    "endDate": "2025-12-16T18:29:59.000Z",
    "subType": "improvementProject",
    "type": "improvementProject",
    "programId": `$PROGRAM_ID`,
    "programName": "School Hygiene Improvement Initiative",
    "programDescription": "The School Hygiene Improvement Initiative is dedicated to ensuring clean, safe, and healthy environments in schools. This program focuses on promoting hygiene best practices among students, staff, and administrators to prevent the spread of illnesses, enhance student well-being, and foster an atmosphere conducive to learning. Through regular cleanliness audits, sanitation drives, and hygiene awareness campaigns, the program aims to improve the condition of school facilities, particularly washrooms, classrooms, and common areas. Special emphasis is placed on educating students about personal hygiene, proper handwashing techniques, and maintaining a clean environment to create a culture of responsibility and care within the school community.",
    "status": "active",
    "__v": 0,
    "scope": {
        "state": [`$ENTITY_ID`],
        "roles": ["district_education_officer"]
        "entityType": "state"
    },
    "updatedBy": "1",
    "author": "1",
    "creator": "Priyanka",
    "projectTemplateId" : `$PROJECT_TEMPLATE_ID`
}
EOF
)

echo "Solution data being added to $SOLUTIONS_COLLECTION collection in $PROJECT_DB_NAME database...."

SOLUTION_INSERTED_DOCUMENT=$(mongo --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet <<EOF
use $PROJECT_DB_NAME;
var result = db.$SOLUTIONS_COLLECTION.insert($SOLUTION_DOCUMENT);
var insertedDocument = db.$SOLUTIONS_COLLECTION.findOne({ _id: result.insertedIds[0] });
EOF
)

# Extract the _id from the inserted document using jq
SOLUTION_ID=$(echo "$SOLUTION_INSERTED_DOCUMENT" | jq -r '._id.$oid')
echo "Solution ID: $SOLUTION_ID"


CONFIGURATIONS_COLLECTION="configurations"

CONFIGURATIONS_DOCUMENT=$(cat <<EOF 
{
    "code" : "keysAllowedForTargeting",
    "meta" : {
        "profileKeys" : [
            "state",
            "district",
            "school",
            "block",
            "cluster",
            "board",
            "class",
            "roles",
            "entities",
            "entityTypeId",
            "entityType",
            "subject",
            "medium"
        ]
    }
}
EOF
)

echo "Configurations data being added to $CONFIGURATIONS_DOCUMENT collection in $PROJECT_DB_NAME database...."

CONFIGURATIONS_INSERTED_DOCUMENT=$(mongo --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet <<EOF
use $PROJECT_DB_NAME;
var result = db.$CONFIGURATIONS_COLLECTION.insert($CONFIGURATIONS_DOCUMENT);
var insertedDocument = db.$CONFIGURATIONS_DOCUMENT.findOne({ _id: result.insertedIds[0] });
EOF
)

# Extract the _id from the inserted document using jq
CONFIGURATION_ID=$(echo "$CONFIGURATIONS_INSERTED_DOCUMENT" | jq -r '._id.$oid')
echo "Configuration ID: $CONFIGURATION_ID"
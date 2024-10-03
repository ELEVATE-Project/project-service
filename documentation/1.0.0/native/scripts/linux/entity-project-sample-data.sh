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
    "immediateChildrenEntityType": ["district"],
    "isDeleted": false
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


ENTITY_TYPE_DISTRICT_DOCUMENT=$(cat <<EOF
{
    "name" : "district",
    "toBeMappedToParentEntities" : true,
    "immediateChildrenEntityType" : [ 
        "block"
    ],
    "isDeleted" : false
}
EOF
)

echo "EntityType data being added to $ENTITY_TYPE_COLLECTION collection in $ENTITY_SERVICE_DB_NAME database...."

ENTITY_TYPE_DISTRICT_DOCUMENT_ID=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $ENTITY_TYPE_DISTRICT_DOCUMENT
    var result = db.getSiblingDB('$ENTITY_SERVICE_DB_NAME').$ENTITY_TYPE_COLLECTION.insertOne(doc);
    if (result.insertedId) {
        print(result.insertedId);
    } else {
        throw new Error('Insert failed');
    }
")

ENTITY_TYPE_DISTRICT_DOCUMENT_ID=$(clean_object_id "$ENTITY_TYPE_DISTRICT_DOCUMENT_ID")
echo "EntityType ID for district doc: $ENTITY_TYPE_DISTRICT_DOCUMENT_ID"


ENTITIES_DOCUMENT=$(cat <<EOF
{
    "name" : "Karnataka",
    "entityType" : "state",
    "entityTypeId" : "$ENTITY_TYPE_ID",
    "userId" : "1",
    "metaInformation" : {
        "externalId" : "KR001",
        "name" : "Karnataka"
    },
    "childHierarchyPath": []
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


ENTITIES_DOCUMENT_DISTRICT_TYPE=$(cat <<EOF
{
    "name" : "Bangalore",
    "entityType" : "district",
    "entityTypeId" : "$ENTITY_TYPE_DISTRICT_DOCUMENT_ID",
    "userId" : "1",
    "metaInformation" : {
        "externalId" : "BN001",
        "name" : "Bangalore"
    },
    "childHierarchyPath" : [],
    "groups" : {}
}
EOF
)

echo "Entity data being added to $ENTITIES_COLLECTION collection in $ENTITY_SERVICE_DB_NAME database...."

ENTITY_ID_DISTRICT=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $ENTITIES_DOCUMENT_DISTRICT_TYPE
    var result = db.getSiblingDB('$ENTITY_SERVICE_DB_NAME').$ENTITIES_COLLECTION.insertOne(doc);
    if (result.insertedId) {
        print(result.insertedId);
    } else {
        throw new Error('Insert failed');
    }
")

# ENTITY_ID_DISTRICT=$(clean_object_id "$ENTITY_ID_DISTRICT")
echo "Entity ID bangalore: $ENTITY_ID_DISTRICT"

# Updating groups
mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var updateResult = db.getSiblingDB('$ENTITY_SERVICE_DB_NAME').$ENTITIES_COLLECTION.updateOne(
        {_id: ObjectId('$ENTITY_ID')},
        { 
            \$set: { 
                'groups.district': [$ENTITY_ID_DISTRICT]
            }
        }
    );
    if (updateResult.matchedCount > 0) {
        print('Entity document updated successfully');
    } else {
        throw new Error('Update failed');
    }
"




# Project database details
PROJECT_DB_NAME="elevate-project"
PROJECT_CATEGORY_COLLECTION="projectCategories"

PROJECT_CATEGORY_DOCUMENT=$(cat <<EOF
{
    "externalId" : "educationLeader",
    "name" : "Education Leader",
    "status" : "active"
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
        "roles": ["state_education_officer"],
        "entityType": "state"
    },
    "projectTemplateId": ObjectId("$PROJECT_TEMPLATE_ID"),
    "startDate" : ISODate("2021-08-30T00:00:00.000Z"),
    "endDate" : ISODate("2029-08-30T00:00:00.000Z"),
    "isDeleted" : false,
    "isAPrivateProgram" : false,
    "isReusable" : false,
    "status" : "active",
    "type" : "improvementProject",
    "updatedAt" : ISODate("2021-08-30T00:00:00.000Z")
}
EOF
)

echo "Solution data being added to $SOLUTIONS_COLLECTION collection in $PROJECT_DB_NAME database...."

# Insert SOLUTION_ID using docker exec
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

# Updating project template with the solution ID
mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var updateResult = db.getSiblingDB('$PROJECT_DB_NAME').$PROJECT_TEMPLATES_COLLECTION.updateOne(
        {_id: ObjectId('$PROJECT_TEMPLATE_ID')},  // Assuming PROJECT_TEMPLATE_ID is an ObjectId
        { 
            \$set: { 
                'solutionId': '$SOLUTION_ID'  // Use single quotes to avoid conflicts with Bash variable expansion
            }
        }
    );
    if (updateResult.matchedCount > 0) {
        print('Solution document updated successfully');
    } else {
        throw new Error('Update failed');
    }
"


FORMS_COLLECTION='forms'
FORM_DOCUMENTS='[{
    "version" : 13,
    "deleted" : false,
    "type" : "homelist",
    "subType" : "homelists",
    "data" : [ 
        {
            "type" : "bannerList",
            "listingData" : [ 
                {
                    "title" : "Hey, Welcome back!",
                    "discription" : ""
                }
            ]
        }, 
        {
            "type" : "solutionList",
            "listingData" : [ 
                {
                    "name" : "Projects",
                    "img" : "assets/images/ic_project.svg",
                    "redirectionUrl" : "/listing/project",
                    "listType" : "project",
                    "solutionType" : "improvementProject",
                    "reportPage" : false,
                    "description" : "Manage and track your school improvement easily, by creating tasks and planning project timelines"
                }, 
                {
                    "name" : "Survey",
                    "img" : "assets/images/ic_survey.svg",
                    "redirectionUrl" : "/listing/survey",
                    "listType" : "survey",
                    "solutionType" : "survey",
                    "reportPage" : false,
                    "reportIdentifier" : "surveyReportPage",
                    "description" : "Provide information and feedback through quick and easy surveys"
                }, 
                {
                    "name" : "Reports",
                    "img" : "assets/images/ic_report.svg",
                    "redirectionUrl" : "/project-report",
                    "listType" : "report",
                    "reportPage" : true,
                    "description" : "Make sense of data to enable your decision-making based on your programs with ease",
                    "list" : [ 
                        {
                            "name" : "Improvement Project Reports",
                            "img" : "assets/images/ic_project.svg",
                            "redirectionUrl" : "/project-report",
                            "listType" : "project",
                            "solutionType" : "improvementProject",
                            "reportPage" : false,
                            "description" : "Manage and track your school improvement easily, by creating tasks and planning project timelines"
                        }, 
                        {
                            "name" : "Survey Reports",
                            "img" : "assets/images/ic_survey.svg",
                            "redirectionUrl" : "/listing/survey",
                            "listType" : "survey",
                            "solutionType" : "survey",
                            "reportPage" : true,
                            "reportIdentifier" : "surveyReportPage",
                            "description" : "Provide information and feedback through quick and easy surveys"
                        }
                    ]
                }, 
                {
                    "name" : "Library",
                    "img" : "assets/images/library.svg",
                    "redirectionUrl" : "/project-library",
                    "listType" : "library",
                    "description" : ""
                }
            ]
        }
    ],
    "organizationId" : 1,
    "updatedAt" : "2024-06-05T08:47:14.987Z",
    "createdAt" : "2024-06-05T08:47:14.987Z",
    "__v" : 0
},
{
    "version" : 28,
    "deleted" : false,
    "type" : "form",
    "subType" : "formFields",
    "data" : [ 
        {
            "name" : "name",
            "label" : "Enter your name",
            "value" : "",
            "type" : "text",
            "placeHolder" : "Ex. Enter your name",
            "errorMessage" : {
                "required" : "Enter your name",
                "pattern" : "This field can only contain alphabets"
            },
            "validators" : {
                "required" : true,
                "pattern" : "^[a-zA-Z\\s]*$"
            },
            "disable" : "false"
        }, 
        {
            "name" : "state",
            "label" : "Select your state",
            "placeHolder" : "Select your state",
            "value" : "",
            "type" : "select",
            "errorMessage" : {
                "required" : "Please select your state"
            },
            "validators" : {
                "required" : true
            },
            "dynamicEntity" : true,
            "options" : [],
            "disable" : "false"
        }, 
        {
            "name" : "roles",
            "label" : "Choose your role",
            "value" : "",
            "type" : "chip",
            "dynamicUrl" : "/entity-management/v1/entities/targetedRoles/",
            "errorMessage" : {
                "required" : "Select a role"
            },
            "validators" : {
                "required" : true
            },
            "options" : [],
            "dependsOn" : "state",
            "multiple" : true,
            "disable" : "false"
        }
    ],
    "organizationId" : 1,
    "updatedAt" : "2024-06-25T10:08:58.689Z",
    "createdAt" : "2024-06-25T10:08:58.689Z",
    "__v" : 0
},
{
    "version": 0,
    "deleted": false,
    "type": "KR001",
    "subType": "KR001",
    "data": [
        {
            "name": "district",
            "label": "Select your district",
            "placeHolder": "Select your district",
            "value": "",
            "type": "select",
            "errorMessage": {
                "required": "Please select your district"
            },
            "validators": {
                "required": true
            },
            "options": [],
            "dependsOn": "state",
            "disable": "false"
        }
    ],
    "organizationId": 1,
    "updatedAt": "2024-08-23T11:32:06.172Z",
    "createdAt": "2024-08-23T11:32:06.172Z",
    "__v": 0
}]'

echo "Forms data being added to forms collection in $PROJECT_DB_NAME database...."

# Insert FORM using docker exec
FORM_ID=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $FORM_DOCUMENTS;
    var result = db.getSiblingDB('$PROJECT_DB_NAME').$FORMS_COLLECTION.insertMany(doc);
    
    if (result.insertedIds && Object.keys(result.insertedIds).length > 0) {
        print(result.insertedIds);
    } else {
        throw new Error('Insert failed'); // Throw an error if no IDs were inserted
    }
")

# Print the inserted Form IDs
echo "Form IDs: $FORM_ID"




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


USER_EXTENSION_DOCUMENT=$(cat <<EOF
{
    "status" : "ACTIVE",
    "createdBy" : "SYSTEM",
    "updatedBy" : "SYSTEM",
    "deleted" : false,
    "userRoleId" : "8",
    "title" : "State Education Officer",
    "entityTypes" : [ 
        {
            "entityType" : "state",
            "entityTypeId" : "$ENTITY_TYPE_ID",
        }
    ],
    "updatedAt" : "2024-09-09T09:31:47.135Z",
    "createdAt" : "2024-09-09T09:31:47.135Z",
    "__v" : 0
}
EOF
)

echo "User data being added to userRoleExtension collection in $ENTITY_SERVICE_DB_NAME database...."
# Insert SOLUTION_ID using docker exec
USER_EXTENSION_ID=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $USER_EXTENSION_DOCUMENT;
    var result = db.getSiblingDB('$ENTITY_SERVICE_DB_NAME').userRoleExtension.insertOne(doc);
    if (result.insertedId) {
        print(result.insertedId);
    } else {
        throw new Error('Insert failed');
    }
")

USER_EXTENSION_ID=$(clean_object_id "$USER_EXTENSION_ID")
echo "UserExtention ID: $USER_EXTENSION_ID"


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

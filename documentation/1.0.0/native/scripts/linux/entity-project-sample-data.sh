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
[{
    "externalId" : "educationLeader",
    "name" : "Education Leader",
    "status" : "active"
},{
    "externalId" : "community",
    "name" : "Community",
    "status" : "active"
},{
    "externalId" : "teacher",
    "name" : "Teacher",
    "status" : "active"
}]
EOF
)

echo "Project category data being added to $PROJECT_CATEGORY_COLLECTION collection in $PROJECT_DB_NAME database...."

PROJECT_CATEGORY_ID=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $PROJECT_CATEGORY_DOCUMENT;
    var result = db.getSiblingDB('$PROJECT_DB_NAME').$PROJECT_CATEGORY_COLLECTION.insertMany(doc);
    if (result.insertedIds && Object.keys(result.insertedIds).length > 0) {
        print(result.insertedIds);
    } else {
        throw new Error('Insert failed');
    }
")


# Convert the string into an array
IFS=',' read -r -a PROJECT_CATEGORY_ID_ARRAY <<< "$PROJECT_CATEGORY_ID"
PROJECT_CATEGORY_ID=$(echo "$PROJECT_CATEGORY_ID" | grep -oP "ObjectId\('\K[0-9a-f]{24}" | head -n 1)

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
        "state": ['$ENTITY_ID'],
        "roles": ["district_education_officer"],
        "entityType": "state"
    }
}
EOF
)

echo "Program data being added to $PROGRAMS_COLLECTION collection in $PROJECT_DB_NAME database...."

# Insert PROGRAM_ID using mongosh
PROGRAM_ID=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $PROGRAMS_DOCUMENT;
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
[{
    "description": "The School Hygiene Improvement Initiative is dedicated to ensuring clean, safe, and healthy environments in schools...",
    "concepts": [""],
    "keywords": [""],
    "isDeleted": false,
    "recommendedFor": [],
    "tasks": [],
    "learningResources": [{
        "name" : "Washroom management learning resource",
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
    "programId": "$PROGRAM_ID",
},
{   "description": "A robust library management program fosters a culture of reading and learning, empowering students to explore diverse resources...",
    "concepts": [""],
    "keywords": [""],
    "isDeleted": false,
    "recommendedFor": [],
    "tasks": [],
    "learningResources": [{
        "name" : "Library Management learning resource",
        "link": "https://youtu.be/libKVRa01L8?feature=shared",
        "app": "projectService",
        "id": "libKVRa01L8?feature=shared"
    }],
    "isReusable": false,
    "title": "Library Management",
    "externalId": "LIB-MANAGEMENT",
    "categories": [{
        "_id": "$PROJECT_CATEGORY_ID",
        "externalId": "educationLeader",
        "name": "Education Leader"
    }],
    "status": "published",
    "programId": "$PROGRAM_ID",
},
{   "description": "Ensuring access to clean and safe water in schools is vital for fostering a healthy learning environment, enhancing student well-being, and promoting overall academic success.",
    "concepts": [""],
    "keywords": [""],
    "isDeleted": false,
    "recommendedFor": [],
    "tasks": [],
    "learningResources": [{
        "name" : "Drinking water management learning resource",
        "link": "https://youtu.be/libKVRa01L8?feature=shared",
        "app": "projectService",
        "id": "libKVRa01L8?feature=shared"
    }],
    "isReusable": false,
    "title": "Drinking Water Availability",
    "externalId": "DRINKING-WATER-AVAILABILITY",
    "categories": [{
        "_id": "$PROJECT_CATEGORY_ID",
        "externalId": "educationLeader",
        "name": "Education Leader"
    }],
    "status": "published",
    "programId": "$PROGRAM_ID",
},
{   "description": "Providing access to quality sports equipment fosters teamwork, promotes physical fitness, and nurtures the spirit of competition, ultimately contributing to the holistic development...",
    "concepts": [""],
    "keywords": [""],
    "isDeleted": false,
    "recommendedFor": [],
    "tasks": [],
    "learningResources": [{
        "name" : "Sports management learning resource",
        "link": "https://youtu.be/libKVRa01L8?feature=shared",
        "app": "projectService",
        "id": "libKVRa01L8?feature=shared"
    }],
    "isReusable": false,
    "title": "Sports Management",
    "externalId": "SPORTS-MANAGEMENT",
    "categories": [{
        "_id": "$PROJECT_CATEGORY_ID",
        "externalId": "educationLeader",
        "name": "Education Leader"
    }],
    "status": "published",
    "programId": "$PROGRAM_ID",
}]
EOF
)

echo "Project template data being added to $PROJECT_TEMPLATES_COLLECTION collection in $PROJECT_DB_NAME database...."

# Insert PROJECT_TEMPLATE_ID using docker exec
PROJECT_TEMPLATE_ID=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $PROJECT_TEMPLATES_DOCUMENT;
    var result = db.getSiblingDB('$PROJECT_DB_NAME').$PROJECT_TEMPLATES_COLLECTION.insertMany(doc);
    if (result.insertedIds && Object.keys(result.insertedIds).length > 0) {
        print(result.insertedIds);
    } else {
        throw new Error('Insert failed');
    }
")

# Convert the string into an array
IFS=',' read -r -a PROJECT_TEMPLATE_ID_ARRAY <<< "$PROJECT_TEMPLATE_ID"


PROJECT_TEMPLATE_ID_1=$(echo "$PROJECT_TEMPLATE_ID" | grep -oP "ObjectId\('\K[0-9a-f]{24}" | head -n 1)
PROJECT_TEMPLATE_ID_2=$(echo "$PROJECT_TEMPLATE_ID" | grep -oP "ObjectId\('\K[0-9a-f]{24}" | sed -n '2p')
PROJECT_TEMPLATE_ID_3=$(echo "$PROJECT_TEMPLATE_ID" | grep -oP "ObjectId\('\K[0-9a-f]{24}" | sed -n '3p')
PROJECT_TEMPLATE_ID_4=$(echo "$PROJECT_TEMPLATE_ID" | grep -oP "ObjectId\('\K[0-9a-f]{24}" | sed -n '4p')


PROJECT_TEMPLATE_TASKS_COLLECTION="projectTemplateTasks"
PROJECT_TEMPLATE_TASKS_DOCUMENTS=$(cat <<EOF
[
{
    "isDeleted" : false,
    "isDeletable" : false,
    "taskSequence" : [

    ],
    "children" : [

    ],
    "visibleIf" : [

    ],
    "hasSubTasks" : false,
    "learningResources" : [
        {
            "name" : "Washroom management learning resource",
            "link" : "https://youtube.com/watch?v=XExMb0XBhw4",
            "app" : "projectService",
            "id" : "watch?v=XExMb0XBhw4"
        }
    ],
    "deleted" : false,
    "type" : "content",
    "projectTemplateId": ObjectId('$PROJECT_TEMPLATE_ID_1'),
    "projectTemplateExternalId" : "WASH-HYGIENE",
    "name" : "Keep the washroom clean.",
    "externalId" : "Wash-Hyg-01",
    "description" : "",
    "sequenceNumber" : "1",
    "metaInformation" : {
        "hasAParentTask" : "NO",
        "parentTaskOperator" : "",
        "parentTaskValue" : "",
        "parentTaskId" : "",
        "startDate" : "30/08/2021",
        "endDate" : "30/08/2029",
        "minNoOfSubmissionsRequired" : ""
    },
    "__v" : NumberInt(0)
},
{
    "isDeleted" : false,
    "isDeletable" : false,
    "taskSequence" : [

    ],
    "children" : [

    ],
    "visibleIf" : [

    ],
    "hasSubTasks" : false,
    "learningResources" : [
        {
            "name" : "Library management learning resource",
            "link" : "https://youtube.com/watch?v=XExMb0XBhw4",
            "app" : "projectService",
            "id" : "watch?v=XExMb0XBhw4"
        }
    ],
    "deleted" : false,
    "type" : "content",
    "projectTemplateId": ObjectId('$PROJECT_TEMPLATE_ID_2'),
    "projectTemplateExternalId" : "LIB-MANAGEMENT",
    "name" : "Stack the books properly in the library.",
    "externalId" : "Lib-Mana-01",
    "description" : "",
    "sequenceNumber" : "1",
    "metaInformation" : {
        "hasAParentTask" : "NO",
        "parentTaskOperator" : "",
        "parentTaskValue" : "",
        "parentTaskId" : "",
        "startDate" : "30/08/2021",
        "endDate" : "30/08/2029",
        "minNoOfSubmissionsRequired" : ""
    },
    "__v" : NumberInt(0)
},
{
    "isDeleted" : false,
    "isDeletable" : false,
    "taskSequence" : [

    ],
    "children" : [

    ],
    "visibleIf" : [

    ],
    "hasSubTasks" : false,
    "learningResources" : [
        {
            "name" : "Drinking water management learning resource",
            "link" : "https://youtube.com/watch?v=XExMb0XBhw4",
            "app" : "projectService",
            "id" : "watch?v=XExMb0XBhw4"
        }
    ],
    "deleted" : false,
    "type" : "content",
    "projectTemplateId": ObjectId('$PROJECT_TEMPLATE_ID_3'),
    "projectTemplateExternalId" : "DRINKING-WATER-AVAILABILITY",
    "name" : "Keep the drinking water vessels clean.",
    "externalId" : "Drink-Wat-01",
    "description" : "",
    "sequenceNumber" : "1",
    "metaInformation" : {
        "hasAParentTask" : "NO",
        "parentTaskOperator" : "",
        "parentTaskValue" : "",
        "parentTaskId" : "",
        "startDate" : "30/08/2021",
        "endDate" : "30/08/2029",
        "minNoOfSubmissionsRequired" : ""
    },
    "__v" : NumberInt(0)

},
{
    "isDeleted" : false,
    "isDeletable" : false,
    "taskSequence" : [

    ],
    "children" : [

    ],
    "visibleIf" : [

    ],
    "hasSubTasks" : false,
    "learningResources" : [
        {
            "name" : "Sports management learning resource",
            "link" : "https://youtube.com/watch?v=XExMb0XBhw4",
            "app" : "projectService",
            "id" : "watch?v=XExMb0XBhw4"
        }
    ],
    "deleted" : false,
    "type" : "content",
    "projectTemplateId": ObjectId('$PROJECT_TEMPLATE_ID_4'),
    "projectTemplateExternalId" : "SPORTS-MANAGEMENT",
    "name" : "Stack the sport equipments in correct order.",
    "externalId" : "Spor-Mana-01",
    "description" : "",
    "sequenceNumber" : "1",
    "metaInformation" : {
        "hasAParentTask" : "NO",
        "parentTaskOperator" : "",
        "parentTaskValue" : "",
        "parentTaskId" : "",
        "startDate" : "30/08/2021",
        "endDate" : "30/08/2029",
        "minNoOfSubmissionsRequired" : ""
    },
    "__v" : NumberInt(0)

}]
EOF
)

echo "Project template tasks data being added to $PROJECT_TEMPLATE_TASKS_COLLECTION collection in $PROJECT_DB_NAME database...."

# Insert PROJECT_TEMPLATE_ID using docker exec
PROJECT_TEMPLATE_TASKS_ID=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $PROJECT_TEMPLATE_TASKS_DOCUMENTS;
    var result = db.getSiblingDB('$PROJECT_DB_NAME').$PROJECT_TEMPLATE_TASKS_COLLECTION.insertMany(doc);
    if (result.insertedIds && Object.keys(result.insertedIds).length > 0) {
        print(result.insertedIds);
    } else {
        throw new Error('Insert failed');
    }
")

# Convert the string into an array
IFS=',' read -r -a PROJECT_TEMPLATE_TASKS_ID_ARRAY <<< "$PROJECT_TEMPLATE_TASKS_ID"


echo $PROJECT_TEMPLATE_TASKS_ID


PROJECT_TEMPLATE_TASK_ID_1=$(echo "$PROJECT_TEMPLATE_TASKS_ID" | grep -oP "ObjectId\('\K[0-9a-f]{24}" | head -n 1)
PROJECT_TEMPLATE_TASK_ID_2=$(echo "$PROJECT_TEMPLATE_TASKS_ID" | grep -oP "ObjectId\('\K[0-9a-f]{24}" | sed -n '2p')
PROJECT_TEMPLATE_TASK_ID_3=$(echo "$PROJECT_TEMPLATE_TASKS_ID" | grep -oP "ObjectId\('\K[0-9a-f]{24}" | sed -n '3p')
PROJECT_TEMPLATE_TASK_ID_4=$(echo "$PROJECT_TEMPLATE_TASKS_ID" | grep -oP "ObjectId\('\K[0-9a-f]{24}" | sed -n '4p')

SOLUTIONS_COLLECTION="solutions"

SOLUTION_DOCUMENT=$(cat <<EOF
[{
    "resourceType": ["Improvement Project Solution"],
    "language": ["English"],
    "keywords": ["Improvement Project"],
    "entities": ['$ENTITY_ID'],
    "programId": ObjectId('$PROGRAM_ID'),
    "name": "Washroom Hygiene",
    "description": "The School Hygiene Improvement Initiative is dedicated to ensuring clean, safe, and healthy environments in schools...",
    "programExternalId": "PG01",
    "scope": {
        "state": ['$ENTITY_ID'],
        "roles": ["state_education_officer"],
        "entityType": "state"
    },
    "projectTemplateId": ObjectId('$PROJECT_TEMPLATE_ID_1'),
    "startDate" : ISODate("2021-08-30T00:00:00.000Z"),
    "endDate" : ISODate("2029-08-30T00:00:00.000Z"),
    "isDeleted" : false,
    "isAPrivateProgram" : false,
    "isReusable" : false,
    "status" : "active",
    "type" : "improvementProject"
},
{
    "resourceType": ["Improvement Project Solution"],
    "language": ["English"],
    "keywords": ["Improvement Project"],
    "entities": ['$ENTITY_ID'],
    "programId": ObjectId('$PROGRAM_ID'),
    "name": "Library Management",
    "description": "A robust library management program fosters a culture of reading and learning, empowering students to explore diverse resources...",
    "programExternalId": "PG01",
    "scope": {
        "state": ['$ENTITY_ID'],
        "roles": ["state_education_officer"],
        "entityType": "state"
    },
    "projectTemplateId": ObjectId('$PROJECT_TEMPLATE_ID_2'),
    "startDate" : ISODate("2021-08-30T00:00:00.000Z"),
    "endDate" : ISODate("2029-08-30T00:00:00.000Z"),
    "isDeleted" : false,
    "isAPrivateProgram" : false,
    "isReusable" : false,
    "status" : "active",
    "type" : "improvementProject"
},
{
    "resourceType": ["Improvement Project Solution"],
    "language": ["English"],
    "keywords": ["Improvement Project"],
    "entities": ['$ENTITY_ID'],
    "programId": ObjectId('$PROGRAM_ID'),
    "name": "Drinking Water Management",
    "description": "Ensuring access to clean and safe water in schools is vital for fostering a healthy learning environment, enhancing student well-being, and promoting overall academic success.",
    "programExternalId": "PG01",
    "scope": {
        "state": ['$ENTITY_ID'],
        "roles": ["state_education_officer"],
        "entityType": "state"
    },
    "projectTemplateId": ObjectId('$PROJECT_TEMPLATE_ID_3'),
    "startDate" : ISODate("2021-08-30T00:00:00.000Z"),
    "endDate" : ISODate("2029-08-30T00:00:00.000Z"),
    "isDeleted" : false,
    "isAPrivateProgram" : false,
    "isReusable" : false,
    "status" : "active",
    "type" : "improvementProject"
},
{
    "resourceType": ["Improvement Project Solution"],
    "language": ["English"],
    "keywords": ["Improvement Project"],
    "entities": ['$ENTITY_ID'],
    "programId": ObjectId('$PROGRAM_ID'),
    "name": "Sports Management",
    "description": "Providing access to quality sports equipment fosters teamwork, promotes physical fitness, and nurtures the spirit of competition, ultimately contributing to the holistic development...",
    "programExternalId": "PG01",
    "scope": {
        "state": ['$ENTITY_ID'],
        "roles": ["district_education_officer"],
        "entityType": "state"
    },
    "projectTemplateId": ObjectId('$PROJECT_TEMPLATE_ID_4'),
    "startDate" : ISODate("2021-08-30T00:00:00.000Z"),
    "endDate" : ISODate("2029-08-30T00:00:00.000Z"),
    "isDeleted" : false,
    "isAPrivateProgram" : false,
    "isReusable" : false,
    "status" : "active",
    "type" : "improvementProject"
}]
EOF
)

# Convert the multiline JSON to a single line for MongoDB
# SOLUTION_DOCUMENT_SINGLE_LINE=$(echo "$SOLUTION_DOCUMENT" | tr -d '\n' | sed 's/"/\\"/g')

echo "Solution data being added to $SOLUTIONS_COLLECTION collection in $PROJECT_DB_NAME database...."

# Insert SOLUTION_ID using docker exec
SOLUTION_ID=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $SOLUTION_DOCUMENT;
    var result = db.getSiblingDB('$PROJECT_DB_NAME').$SOLUTIONS_COLLECTION.insertMany(doc);
    if (result.insertedIds && Object.keys(result.insertedIds).length > 0) {
        print(result.insertedIds);
    } else {
        throw new Error('Insert failed');
    }
")

# Convert the string into an array
IFS=',' read -r -a SOLUTION_ID_ARRAY <<< "$SOLUTION_ID"

echo $SOLUTION_ID

SOLUTION_ID_1=$(echo "$SOLUTION_ID" | grep -oP "ObjectId\('\K[0-9a-f]{24}" | head -n 1)
SOLUTION_ID_2=$(echo "$SOLUTION_ID" | grep -oP "ObjectId\('\K[0-9a-f]{24}" | sed -n '2p')
SOLUTION_ID_3=$(echo "$SOLUTION_ID" | grep -oP "ObjectId\('\K[0-9a-f]{24}" | sed -n '3p')
SOLUTION_ID_4=$(echo "$SOLUTION_ID" | grep -oP "ObjectId\('\K[0-9a-f]{24}" | sed -n '4p')


mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var updateResult = db.getSiblingDB('$PROJECT_DB_NAME').$PROJECT_TEMPLATES_COLLECTION.updateOne(
        {_id: ObjectId('$PROJECT_TEMPLATE_ID_1')},
        { 
            \$set: { 
                'solutionId': ObjectId('$SOLUTION_ID_1')
            },
            \$push: {
                'tasks': ObjectId('$PROJECT_TEMPLATE_TASK_ID_1')
            }
        }
    );
    if (updateResult.matchedCount > 0) {
        print('Document updated successfully for ID: $PROJECT_TEMPLATE_ID_1');  // Output the specific ID
    } else {
        throw new Error('Update failed for ID: $PROJECT_TEMPLATE_ID_1');
    }"


mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var updateResult = db.getSiblingDB('$PROJECT_DB_NAME').$PROJECT_TEMPLATES_COLLECTION.updateOne(
        {_id: ObjectId('$PROJECT_TEMPLATE_ID_2')},
        { 
            \$set: { 
                'solutionId': ObjectId('$SOLUTION_ID_2')
            },
            \$push: {
                'tasks': ObjectId('$PROJECT_TEMPLATE_TASK_ID_2')
            }
        }
    );
    if (updateResult.matchedCount > 0) {
        print('Document updated successfully for ID: $PROJECT_TEMPLATE_ID_2');  // Output the specific ID
    } else {
        throw new Error('Update failed for ID: $PROJECT_TEMPLATE_ID_2');
    }"


mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var updateResult = db.getSiblingDB('$PROJECT_DB_NAME').$PROJECT_TEMPLATES_COLLECTION.updateOne(
        {_id: ObjectId('$PROJECT_TEMPLATE_ID_3')},
        { 
            \$set: { 
                'solutionId': ObjectId('$SOLUTION_ID_3')
            },
            \$push: {
                'tasks': ObjectId('$PROJECT_TEMPLATE_TASK_ID_3')
            }
        }
    );
    if (updateResult.matchedCount > 0) {
        print('Document updated successfully for ID: $PROJECT_TEMPLATE_ID_3');  // Output the specific ID
    } else {
        throw new Error('Update failed for ID: $PROJECT_TEMPLATE_ID_3');
    }"

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
            "entityTypeId" : "$ENTITY_TYPE_ID"
            
        }
    ],
    "updatedAt" : "2024-09-09T09:31:47.135Z",
    "createdAt" : "2024-09-09T09:31:47.135Z",
    "__v" : 0
}
EOF
)

echo "user data being added to userRoleExtension collection in $ENTITY_SERVICE_DB_NAME database...."
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

# Insert CONFIGURATION_ID using docker exec
CONFIGURATION_ID=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet --eval "
    var doc = $CONFIGURATIONS_DOCUMENT;
    var result = db.getSiblingDB('$PROJECT_DB_NAME').$CONFIGURATIONS_COLLECTION.insertOne(doc);
    if (result.insertedId) {
        print(result.insertedId);
    } else {
        throw new Error('Insert failed');
    }
")


CONFIGURATION_ID=$(clean_object_id "$CONFIGURATION_ID")
echo "Configurations ID: $CONFIGURATION_ID"
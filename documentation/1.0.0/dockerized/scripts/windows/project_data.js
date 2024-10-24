const { ObjectId } = require("mongodb");
const {getEndDate,getStartDate} = require("./time")
// const {getStartDate} = require("./time")

let programData = [{
   "_id" : new ObjectId("66fbcc3a7cbf47f6fba26a13"),
   "resourceType" : [
       "program"
   ],
   "language" : [
       "English"
   ],
   "keywords" : [
   ],
   "concepts" : [
   ],
   "components" : [
   ],
   "isAPrivateProgram" : false,
   "isDeleted" : false,
   "requestForPIIConsent" : true,
   "rootOrganisations" : [
   ],
   "createdFor" : [
   ],
   "deleted" : false,
   "status" : "active",
   "owner" : "1",
   "createdBy" : "1",
   "updatedBy" : "1",
   "externalId" : "PG01",
   "name" : "School Hygiene Improvement Initiative",
   "description" : "The School Hygiene Improvement Initiative is dedicated to ensuring clean, safe, and healthy environments in schools. This program focuses on promoting hygiene best practices among students, staff, and administrators to prevent the spread of illnesses, enhance student well-being, and foster an atmosphere conducive to learning. Through regular cleanliness audits, sanitation drives, and hygiene awareness campaigns, the program aims to improve the condition of school facilities, particularly washrooms, classrooms, and common areas. Special emphasis is placed on educating students about personal hygiene, proper handwashing techniques, and maintaining a clean environment to create a culture of responsibility and care within the school community.",
   "startDate" : getStartDate("2024-08-15 18:50:00"),
   "endDate" : getEndDate("2029-08-15 18:50:00"),
   "scope" : {
       "state" : [
           "66fbcc38da3622a5b9a26b13"
       ],
       "roles" : [
           "district_education_officer","state_education_officer"
       ],
       "entityType" : "state"
   }
}];



let solutionData = [
    {
    "_id" : new ObjectId("66fbcc3b2be2b9057aa26a13"),
    "resourceType" : [
        "Improvement Project Solution"
    ],
    "language" : [
        "English"
    ],
    "keywords" : [
        "Improvement Project"
    ],
    "entities" : [
        "66fbcc38da3622a5b9a26a13"
    ],
    "programId" : new ObjectId("66fbcc3a7cbf47f6fba26a13"),
    "name" : "Washroom Hygiene",
    "description" : "The School Hygiene Improvement Initiative is dedicated to ensuring clean, safe, and healthy environments in schools...",
    "programExternalId" : "PG01",
    "scope" : {
       "state" : [
           "66fbcc38da3622a5b9a26b13"
       ],
       "roles" : [
           "district_education_officer","state_education_officer"
       ],
       "entityType" : "state"
   },
    "externalId": "PGM",
    "projectTemplateId" : new ObjectId("66fbcc3aa4c3a568b1a26a13"),
      "startDate": getStartDate("2024-08-15 18:50:00"),
    "endDate": getEndDate("2029-09-15 18:50:00"),
    "isDeleted" : false,
    "isAPrivateProgram" : false,
    "isReusable" : false,
    "status" : "active",
    "type" : "improvementProject",
    "updatedAt": "2024-08-15 18:50:00",
    "createdAt": "2024-08-15 18:50:00"
 },

{
    "_id" : new ObjectId("66fbcc3b2be2b9057aa26a14"),
    "resourceType" : [
        "Improvement Project Solution"
    ],
    "language" : [
        "English"
    ],
    "keywords" : [
        "Improvement Project"
    ],
    "entities" : [
        "66fbcc38da3622a5b9a26a13"
    ],
    "programId" : new ObjectId("66fbcc3a7cbf47f6fba26a13"),
    "name" : "Updating a school library",
    "description" : "Updating a school library with books for all class levels can greatly enhance the educational experience of students...",
    "programExternalId" : "PG01",
    "scope" : {
       "state" : [
           "66fbcc38da3622a5b9a26b13"
       ],
       "roles" : [
           "district_education_officer","state_education_officer"
       ],
       "entityType" : "state"
   },
    "externalId": "PGML",
    "projectTemplateId" : new ObjectId("66fbcc3aa4c3a568b1a26b14"),
      "startDate": getStartDate("2024-08-15 18:50:00"),
    "endDate": getEndDate("2029-09-15 18:50:00"),
    "isDeleted" : false,
    "isAPrivateProgram" : false,
    "isReusable" : false,
    "status" : "active",
    "type" : "improvementProject",
    "updatedAt": "2024-08-15 18:50:00",
    "createdAt": "2024-08-15 18:50:00"
},
   {
    "_id" : new ObjectId("66fbcc3b2be2b9057aa26a15"),
    "resourceType" : [
        "Improvement Project Solution"
    ],
    "language" : [
        "English"
    ],
    "keywords" : [
        "Improvement Project"
    ],
    "entities" : [
        "66fbcc38da3622a5b9a26a13"
    ],
    "programId" : new ObjectId("66fbcc3a7cbf47f6fba26a13"),
    "name" : "StressFree School",
    "description" : "Creating a stress-free school environment is essential for promoting the overall well-being and academic success of students...",
    "programExternalId" : "PG01",
    "scope" : {
       "state" : [
           "66fbcc38da3622a5b9a26b13"
       ],
       "roles" : [
           "district_education_officer","state_education_officer"
       ],
       "entityType" : "state"
   },
    "externalId": "PGMLS",
    "projectTemplateId" : new ObjectId("66fbcc3aa4c3a568b1a26b15"),
      "startDate": getStartDate("2024-08-15 18:50:00"),
    "endDate": getEndDate("2029-09-15 18:50:00"),
    "isDeleted" : false,
    "isAPrivateProgram" : false,
    "isReusable" : false,
    "status" : "active",
    "type" : "improvementProject",
    "updatedAt": "2024-08-15 18:50:00",
    "createdAt": "2024-08-15 18:50:00"
 }
];
 

// let projectsData = [{


// }];


// let programUsersData = [{}];


let formsData = [{
   "_id" : new ObjectId("66fbcc3cf312590398a26a13"),
   "version" : Number(13),
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
   "updatedAt" : "2024-08-15 18:50:00",
   "createdAt" : "2024-08-15 18:50:00",
   "__v" : 0
},
{
   "_id" : new ObjectId("66fbcc3cf312590398a26a14"),
   "version" : Number(28),
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
           "options" : [
           ],
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
           "options" : [
           ],
           "dependsOn" : "state",
           "multiple" : true,
           "disable" : "false"
       }
   ],
   "organizationId" : Number(1),
   "updatedAt" : "2024-08-15 18:50:00",
   "createdAt" : "2024-08-15 18:50:00",
   "__v" : Number(0)
},
{
   "_id" : new ObjectId("66fbcc3cf312590398a26a15"),
   "version" : Number(0),
   "deleted" : false,
   "type" : "KR001",
   "subType" : "KR001",
   "data" : [
       {
           "name" : "district",
           "label" : "Select your district",
           "placeHolder" : "Select your district",
           "value" : "",
           "type" : "select",
           "errorMessage" : {
               "required" : "Please select your district"
           },
           "validators" : {
               "required" : true
           },
           "options" : [
           ],
           "dependsOn" : "state",
           "disable" : "false"
       }
   ],
   "organizationId" : Number(1),
   "updatedAt" : "2024-08-15 18:50:00",
   "createdAt" : "2024-08-15 18:50:00",
   "__v" : Number(0)
}];
let configurationsData = [{
   "_id" : new ObjectId("66fbcc3ddcfdfb11b7a26a13"),
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
}];

let projectCategoriesData = [{
    "_id" : new ObjectId("66fbcc39a64322692fa26a13"),
    "externalId" : "educationLeader",
    "name" : "Education Leader",
    "status" : "active"
 }];
 
// let certificateTemplatesData = [{}];



let projectTemplatesData = [
{
    "_id" : new ObjectId("66fbcc3aa4c3a568b1a26a13"),
    "description" : "The School Hygiene Improvement Initiative is dedicated to ensuring clean, safe, and healthy environments in schools...",
    "concepts" : [
        ""
    ],
    "keywords" : [
        ""
    ],
    "isDeleted" : false,
    "recommendedFor" : [
    ],
    "tasks" : [
    ],
    "learningResources" : [
        {
            "link" : "https://youtu.be/libKVRa01L8?feature=shared",
            "app" : "projectService",
            "id" : "libKVRa01L8?feature=shared"
        }
    ],
    "isReusable" : false,
    "title" : "Washroom Hygiene",
    "externalId" : "WASH-HYGIENE",
    "categories" : [
        {
            "_id" : "66fbcc39a64322692fa26a13",
            "externalId" : "educationLeader",
            "name" : "Education Leader"
        }
    ],
    "status" : "published",
    "programId" : new ObjectId("66fbcc3a7cbf47f6fba26a13"),
    "solutionId" : new ObjectId("66fbcc3b2be2b9057aa26a13")
 },
 {
    "_id" : new ObjectId("66fbcc3aa4c3a568b1a26b14"),
    "description" : "Updating a school library with books for all class levels can greatly enhance the educational experience of students...",
    "concepts" : [
        ""
    ],
    "keywords" : [
        ""
    ],
    "isDeleted" : false,
    "recommendedFor" : [
    ],
    "tasks" : [
    ],
    "learningResources" : [
        {
            "link" : "https://www.youtube.com/watch?v=2yt1mlCePzs",
            "app" : "projectService",
            "id" : "2yt1mlCePzs?feature=shared"
        }
    ],
    "isReusable" : false,
    "title" : "Updating a school library",
    "externalId" : "SCHOOL-LIBRARY",
    "categories" : [
        {
            "_id" : "66fbcc39a64322692fa26a13",
            "externalId" : "educationLeader",
            "name" : "Education Leader"
        }
    ],
    "status" : "published",
    "programId" : new ObjectId("66fbcc3a7cbf47f6fba26a13"),
    "solutionId" : new ObjectId("66fbcc3b2be2b9057aa26a14")
 },
 {
    "_id" : new ObjectId("66fbcc3aa4c3a568b1a26b15"),
    "description" : "Creating a stress-free school environment is essential for promoting the overall well-being and academic success of students...",
    "concepts" : [
        ""
    ],
    "keywords" : [
        ""
    ],
    "isDeleted" : false,
    "recommendedFor" : [
    ],
    "tasks" : [
    ],
    "learningResources" : [
        {
            "link" : "https://www.youtube.com/watch?v=3Nf2Pzcketg",
            "app" : "projectService",
            "id" : "3Nf2Pzcketg?feature=shared"
        }
    ],
    "isReusable" : false,
    "title" : "Updating a school library",
    "externalId" : "LEARN-STUDENT",
    "categories" : [
        {
            "_id" : "66fbcc39a64322692fa26a13",
            "externalId" : "educationLeader",
            "name" : "Education Leader"
        }
    ],
    "status" : "published",
    "programId" : new ObjectId("66fbcc3a7cbf47f6fba26a13"),
    "solutionId" : new ObjectId("66fbcc3b2be2b9057aa26a15")
 }
];

module.exports = {
 programData,
 solutionData,
 projectTemplatesData,
//  projectTemplateTasksData,
 projectCategoriesData,
//  projectsData,
//  programUsersData,
 formsData,
 configurationsData,
//  certificateTemplatesData,
};
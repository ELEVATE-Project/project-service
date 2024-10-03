const { ObjectId } = require("mongodb");




let entitiesData = [{
   "_id" : new ObjectId("66fbcc38da3622a5b9a26a13"),
   "name" : "Karnataka",
   "entityType" : "state",
   "entityTypeId" : "66fbcc374017f43d2ca26a13",
   "userId" : "1",
   "metaInformation" : {
       "externalId" : "KR001",
       "name" : "Karnataka"
   },
   "childHierarchyPath" : [
   ],
   "groups" : {
       "district" : [
          new ObjectId("66fbcc38f0891af41ca26a13")
       ]
   }
},
{
   "_id" : new ObjectId("66fbcc38f0891af41ca26a13"),
   "name" : "Bangalore",
   "entityType" : "district",
   "entityTypeId" : "66fbcc3780123e9f0fa26a13",
   "userId" : "1",
   "metaInformation" : {
       "externalId" : "BN001",
       "name" : "Bangalore"
   },
   "childHierarchyPath" : [
   ],
   "groups" : {
   }
}];




let entityTypesData = [
   {
       "_id" : new ObjectId("66fbcc374017f43d2ca26a13"),
       "name" : "state",
       "toBeMappedToParentEntities" : true,
       "immediateChildrenEntityType" : [
           "district"
       ],
       "isDeleted" : false
    },
    {
       "_id" : new ObjectId("66fbcc3780123e9f0fa26a13"),
       "name" : "district",
       "toBeMappedToParentEntities" : true,
       "immediateChildrenEntityType" : [
           "block"
       ],
       "isDeleted" : false
   
   
}];




let userRoleExtensionData = [{
   "_id" : new ObjectId("66fbcc3dd64f10357ea26a13"),
   "status" : "ACTIVE",
   "createdBy" : "SYSTEM",
   "updatedBy" : "SYSTEM",
   "deleted" : false,
   "userRoleId" : "8",
   "title" : "State Education Officer",
   "entityTypes" : [
       {
           "entityType" : "state",
           "entityTypeId" : "66fbcc374017f43d2ca26a13"
       }
   ],
   "updatedAt" : new Date("2024-09-09T09:31:47.135Z"),
   "createdAt" : new Date("2024-09-09T09:31:47.135Z"),
   "__v" : Number(0)
}];




module.exports = {
   entitiesData,
   entityTypesData,
   userRoleExtensionData
 };

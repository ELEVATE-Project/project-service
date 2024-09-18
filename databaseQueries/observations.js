/**
 * name : observations.js
 * author : prajwal
 * created-date : 18-Apr-2024
 * Description : observations helper for DB interactions.
 */

// Dependencies 

/**
    * Observations
    * @class
*/



module.exports= class Observations{
      /**
     * Get Observation document based on filtered data provided.
     * @method
     * @name observationDocuments
     * @param {Object} [findQuery = "all"] -filter data.
     * @param {Array} [fields = "all"] - Projected fields.
     * @returns {Array} - List of observations.
     */
    
     static observationsDocument(
        findQuery = "all", 
        fields = "all"
    ) {
        return new Promise(async (resolve, reject) => {
            try {
                let queryObject = {};

                if (findQuery != "all") {
                    queryObject = _.merge(queryObject, findQuery)
                }

                let projectionObject = {};

                if (fields != "all") {
                    fields.forEach(element => {
                        projectionObject[element] = 1;
                    });
                }

                let observationsDocument = await database.models.observations
                    .find(queryObject, projectionObject)
                    .lean();

                return resolve(observationsDocument);
            } catch (error) {
                return reject(error);
            }
        });
    }


    /**
   * aggregate observation
   * @method
   * @name getAggregate
   * @param {Array} query - aggregation query.
   * @returns {Array} List of documents. 
   */
  
  static getAggregate(
    query = []
  ) {
    return new Promise(async (resolve, reject) => {
        try {
    
            let observationDocuments = await database.models.observations.aggregate(
              query
            );
            
            return resolve(observationDocuments);
            
        } catch (error) {
            return reject(error);
        }
    });
  }

}
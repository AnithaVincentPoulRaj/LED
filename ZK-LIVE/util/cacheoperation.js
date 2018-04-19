/*
 Function Name : insertCache
 Description   : This function used to insert data in the cache.
 Params        : key, data, cacheTTL
 Created on    : 27-Mar-2018
 Updated on    : 28-Mar-2018
 Created by    : iExemplar Software India Pvt Ltd.
*/

exports.insertCache = function(key, data, cacheTTL) {
	inboundCache.set(key, data, cacheTTL, function( err, success ) {
		if ( !err && success ) {
			
		}
	});
};

/*
 Function Name : getCacheData
 Description   : This function used to get data from the cache.
 Params        : key
 Created on    : 27-Mar-2018
 Updated on    : 28-Mar-2018
 Created by    : iExemplar Software India Pvt Ltd.
*/

exports.getCacheData = function(key) {

  inboundCache.get(key, function( err, value ) {
    if (!err) {
      if (value == undefined){
        // key not found
      } else {
        return value;
      }
    }
  });
};	
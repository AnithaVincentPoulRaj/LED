var Promise = require('bluebird');

var zknodecontroller = require('./zkcontroller');

exports.getTypeCollection = function(req, res) {
	commonLoggerSetup('API CALLED \n',LOGINFO);
	zknodecontroller.getDataForSpecifiNode('/epms/typecollection', zkclient).then(function (result){ 
        if (result.length > 0) {
        	commonLoggerSetup('API CALLED SUCC \n'+result,LOGINFO);
        	res.status(200);
        	res.send(result);
        	return;
        }
        res.status(201);
    }).error(function (error){
      commonLoggerSetup('API CALLED ERROR \n'+error,LOGERROR);
      res.status(500);        
  }).catch(function (error) {
      commonLoggerSetup('API CALLED ERROR \n'+error,LOGERROR);
      res.status(500);
  });
};
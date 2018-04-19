var logger = null;
var bunyan = require('bunyan');
/*
 Function Name : getLogger
 Description : This function used to configure logs.
 Params : appName
 Created on :22-12-2016
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/

exports.getLogger = function (appName) {  

  if (!logger || null === logger) {
    var logger = bunyan.createLogger({
      name    : appName,
      streams : [{
        type   : 'rotating-file',
        //path   : '/home/ec2-user/epmstcp/logs/' + appName + '.log',
        //Working log path
        path: 'logs/' + appName + '.log',
        period : '1d', // daily rotation
        count  : 10 // keep 3 back copies
      }]
    });
  }
  return logger;
  
};

/*
 Function Name : getProcessingTime
 Description : This function used to calculate processing time.
 Params : start
 Created on :23-12-2016
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/

exports.getProcessingTime = function clock(start) {

  if (!start) return process.hrtime();
  var end = process.hrtime(start);
  return Math.round((end[0] * 1000) + (end[1] / 1000000));

};
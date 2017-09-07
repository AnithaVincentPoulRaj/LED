exports.getSuccessResponse = function success(statusCode, message, dataList) {
    console.log(dataList);
    var responseStr = {
      "code"    : statusCode,
      "message" : message,
      "data":{"userId"   : dataList[0].userId,
      "mobileNumber"  : dataList[0].mobileNumber,
      "userName"   : dataList[0].userName}
    };
    return responseStr; 
};

exports.getFailureResponse = function success(statusCode, message) {
    var responseStr = {
      "code"    : statusCode,
      "message" : message
    };
  return responseStr;

};

exports.setControllerResponse = function status(statusCode) {
    var responseStr = {
      "code" : statusCode
    };
    return responseStr;
};


exports.pushAutoFillResponse = function success(id, level, status) {
  var dataStr = {
      "binID" : id,
      "binLevel" : level,
      "binStatus" : status
    }
    var responseStr = {
      "data" : dataStr,
      "message" : "Bin filled"
    };
  return responseStr;
};


// exports.setMessageBodyForFCMPush = function setFCMPush(deviceToken,title,binID,body)


var modelUser = require('./userregisteration');
var commonTopic = require('../route/protocol');
var constantCode = require('../config/constant');
var commonMessage = require('../config/messages');
var responseMessage = require('../utils/response');
var payload = require("../lib/payloadconversion");
var sendDatas = "";
var sendEncodeData = "";

exports.fetchUserDetails = function(req, client, userId, userType,dTopic) {
  console.log('enter fetch user details')
  var mqttTopic = "";
  if (userType == 'register') {
    mqttTopic = dTopic;
  } else {
    mqttTopic = dTopic;
  }
  var sqlConn = {sql:modelUser.GET_USER_DETAILS_SQL, timeout : 5000};
  //Get state list by country id
  console.log('user id ' + userId);
  console.log('sql '+ sqlConn);
  connection.query(sqlConn, userId, function (err, userData) {
    if (!err) {
      if (userData.length > 0) {
        if (userType == 'register') {
           sendDatas = responseMessage.getSuccessResponse(constantCode.SUCCESS_CODE,commonMessage.USER_REG_SUCCESSFUL,userData);  
        } else {
           sendDatas = responseMessage.getSuccessResponse(constantCode.SUCCESS_CODE,commonMessage.USER_SIGNIN_SUCCESSFUL,userData);  
        }
        sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
        exports.publishClientCommon(mqttTopic, sendEncodeData,client);  
      } else {
          sendDatas = responseMessage.getFailureResponse(constantCode.ERROR_CODE,commonMessage.USER_DETAIL_ERROR);  
          sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
          exports.publishClientCommon(mqttTopic, sendEncodeData,client); 
      }  
    } else {
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
          sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,commonMessage.TIMEOUT_DB_ERROR);
          sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
          exports.publishClient(mqttTopic, sendEncodeData,client); 
        } else {
          sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,err.toString());
          sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
          exports.publishClient(mqttTopic, sendEncodeData,client); 
        } 
    }
  });
};

exports.publishClientCommon = function(topic, succMsg, client) {
    client.publish(topic, succMsg);
};
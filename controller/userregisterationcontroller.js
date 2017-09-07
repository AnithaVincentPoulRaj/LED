var Promise = require('bluebird');
var payload = require("../lib/payloadconversion");
var reqValidator = require('validator');
var constantCode = require('../config/constant');
var commonMessage = require('../config/messages');
var responseMessage = require('../utils/response');
var commonTopic = require('../route/protocol');
var modelUser = require('../model/userregisteration');
var modelLoginStatus = require('../model/loginstatusmodel');
var modelCommon = require('../model/common');

var dTopic = "";
var sendDatas = "";
var sendEncodeData="";
var userType = "register";

exports.parseUserAccount = function (message, client) {
	try {
 		var payloadData = payload.decodePayloadData(message,"register","UserRegister");
  		console.log(payloadData);
  		 dTopic = commonTopic.USER_CREATION_STATUS+payloadData.macAddress;
  		 console.log('Response Topice is '+dTopic);
  		if (!reqValidator.isNumeric(payloadData.mobileNumber) || !reqValidator.isLength(payloadData.mobileNumber, {min : 10, max : 12})){
            console.log('Invalid MobileNumber');
            sendDatas = responseMessage.getFailureResponse(constantCode.VAL_ERROR_CODE,commonMessage.MOBILENUMBER_ERROR); 
            sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
            exports.publishClient(dTopic, sendEncodeData,client);
            return false;
        } else if (!reqValidator.isMD5(payloadData.password)) {
            console.log('Invalid Password');
            sendDatas = responseMessage.getFailureResponse(constantCode.VAL_ERROR_CODE,commonMessage.PASSWORD_ERROR);
            sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
            exports.publishClient(dTopic, sendEncodeData,client);      
            return false;
        } else if (payloadData.deviceType == '' || payloadData.deviceType <= 0 || payloadData.deviceType > 3){
            console.log('Invalid Device Type');
            sendDatas = responseMessage.getFailureResponse(constantCode.VAL_ERROR_CODE,commonMessage.DEVICETYPE_ERROR);        
            sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
            exports.publishClient(dTopic, sendEncodeData,client);     
            return false;
        } else if (payloadData.macAddress == '' || !reqValidator.isAlphanumeric(payloadData.macAddress)){
            console.log('Invalid Mac Address');
            sendDatas = responseMessage.getFailureResponse(constantCode.VAL_ERROR_CODE,commonMessage.MACADDRESS_ERROR);        
            sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
            exports.publishClient(dTopic, sendEncodeData,client);     
            return false; 
        } 
        console.log('All Basic Validation are success');
        exports.checkUserRegMobileNum(payloadData, client, dTopic).then(function (userCountData){
            if (userCountData.userRegCnt > 0) {
                console.log('already reg');
                sendDatas = responseMessage.getFailureResponse(constantCode.ERROR_CODE,commonMessage.MOB_USER_ALRDY_REG);        
                sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
        		exports.publishClient(dTopic, sendEncodeData,client);
            } else {
                console.log('we can register');
                exports.createUserAccount(payloadData,client,dTopic);
            }
            }).error(function (error) {
                console.log('createUserRegistration : ' + error);
                sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,error.toString());        
                sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
       			exports.publishClient(dTopic, sendEncodeData,client);
            }).catch(function (error) {
                console.log('createUserRegistration : ' + error);
                sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,error.toString());        
                sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
        		exports.publishClient(dTopic, sendEncodeData,client);
            });
	} catch (exception) {
		console.log('PayLoad wrong');
		console.log(exception);
        sendDatas = responseMessage.getFailureResponse(constantCode.ERROR_CODE,commonMessage.PAYLOAD_CONTENT_ERROR);        
        sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
        exports.publishClient(dTopic, sendEncodeData,client);
        return false;
	}
	
};

exports.checkUserRegMobileNum = function (req,client,dTopic) {
return new Promise(function (resolve, reject){
    var usrMobileSql = {sql:modelUser.GET_MOBILE_LIST_SQL, timeout : 5000};
    connection.query(usrMobileSql, [req.mobileNumber], function (err, resCount) {
        if (!err) {
           // var usrcnt = resCount[0];
            var userCount = resCount[0].recCount;
            console.log('Db result is '+userCount);
            var respFlag = { "userRegCnt" : userCount};
            return resolve(respFlag);
          } else {
             console.log('erroe');
             // need to check timeout condition
             if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
                sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,commonMessage.TIMEOUT_DB_ERROR);
                sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
       			exports.publishClient(dTopic, sendEncodeData,client); 
             } else {
                sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,err.toString());
                sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
        		exports.publishClient(dTopic, sendEncodeData,client);
             } 
                      
          }
    });
});
};

exports.createUserAccount = function (req,client,dTopic) {
    var userInsertedData = {
            USER_NAME : req.userName,
            USER_MOBILE_NUMBER : req.mobileNumber,
            USER_PASSWORD : req.password,
            USER_DEVICE_TYPE : req.deviceType,
            USER_MAC_ADDRESS : req.macAddress
    }; 
    console.log('instered data'+userInsertedData);
    var sqlConn = {sql:modelUser.SET_USER_DETAILS_SQL, timeout : 5000};
    connection.query(sqlConn, userInsertedData, function (err, resultUserAcc) {
     if (!err) {
          console.log('inserted success status');
          console.log(resultUserAcc);
          var userAccID = resultUserAcc.insertId;
          console.log('user id is'+ userAccID);
          exports.userLoginStatus(req,client,userAccID,dTopic);
     } else {
          if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
              sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,commonMessage.TIMEOUT_DB_ERROR);
              sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
        	  exports.publishClient(dTopic, sendEncodeData,client); 
          } else {
              sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,err.toString());
              sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
        	  exports.publishClient(dTopic, sendEncodeData,client);
          }  
     }
  });
};

exports.userLoginStatus = function(req,client,userID,dTopic) {
    var userLoginData = {
        USER_ID : userID,
        USER_DEVICE_TYPE : req.deviceType,
        USER_MAC_ADDRESS : req.macAddress 
    };
    var sqlConn = {sql:modelLoginStatus.SET_USER_LOGINSTATUS_SQL, timeout : 5000};
    connection.query(sqlConn, userLoginData, function (err, resultLoginStatus) {
    if (!err) {
        console.log('inserted login status success');
        console.log(resultLoginStatus);
        var userDetails = modelCommon.fetchUserDetails(req, client, userID, userType,dTopic);
    } else {
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
              sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,commonMessage.TIMEOUT_DB_ERROR);
              sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
        	  exports.publishClient(dTopic, sendEncodeData,client);
        } else {
              sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,err.toString());
              sendEncodeData=payload.dataEncode(sendDatas,"response","Response","hex");
        	  exports.publishClient(dTopic, sendEncodeData,client); 
        } 
    }
  }); 
};
exports.publishClient = function(topic, succMsg, client) {
    client.publish(topic, succMsg);
};

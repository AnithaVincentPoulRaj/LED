var json = require('JSON');
var Promise = require('bluebird');
var reqValidator = require('validator');
var payloadValidator = require('payload-validator');

var commonTopic = require('../route/protocol');
var constantCode = require('../config/constant');
var commonMessage = require('../config/messages');
var responseMessage = require('../utils/response');
var modelLogin = require('../model/loginstatusmodel'); // not need
var modelController = require('../model/controllermodel');

var sendDatas = "";
var dynTopic = "";

// Date : 22/05/2017
// Contoller throw data to Broker client
exports.parseControllerUpdatedDetails = function(message, client) {
	console.log('Going to insert bin latest datas');
	try {
		var req = json.parse(message);
		console.log(req);
    dynTopic = commonTopic.CONTROLLER_CREATION_STATUS;
	} catch (exception) {
		console.log('error'); // convey error back to Broker client to Controller
		sendDatas = responseMessage.setControllerResponse(constantCode.BADREQUEST_CODE); 
		exports.publishClientBinUpdated(dynTopic, json.stringify(sendDatas),client);       
    return false; 
	}
	var chkPayLoadCount  = Object.keys(req).length;
    console.log(chkPayLoadCount);
    var payLoadChkStatus = "";
    if (typeof req.mA == 'undefined') {
        console.log('Invalid Payload'); // convey error back to Broker client to Controller
        sendDatas = responseMessage.setControllerResponse(constantCode.ERROR_CODE);       
        exports.publishClientBinUpdated(dynTopic, json.stringify(sendDatas),client);
        return false; 
    }
    console.log('Basic validation are success');
    exports.updateControllerDetialsIntoServer(req,client,dynTopic);
};

// Date : 22/05/2017
exports.updateControllerDetialsIntoServer = function(req,client,dynTopic) {
    console.log('inserted controller function');
    pData = {
        "productType" : req.pT,
        "status" :req.status,
        "macAddress" :req.mA
      }
    pData = json.stringify(pData);
    var pTypeID = req.mA+req.ptID;
    console.log('pro Typeid' + pTypeID);
    console.log(pData);
    var sqlConn = {sql:modelController.UPDATE_USER_CONTROLLER_DETAILS, timeout : 5000};
    connection.query(sqlConn, [pData,req.mA,pTypeID], function (err, resultUpdateStatus) {
    if (!err) {
        console.log('update details success');
        console.log(resultUpdateStatus);
        console.log(resultUpdateStatus.insertId);
        console.log(resultUpdateStatus.affectedRows);
        //Check if the type is auto then send filled status to user
        var sqlConn = {sql:modelController.GET_PRODUCT_OWNER_ID, timeout : 5000};
             connection.query(sqlConn, [req.mA,pTypeID], function (err, resultUpdateStatus) {
            if (!err) {
                console.log('Get User ID');
                console.log(resultUpdateStatus.length);
               // console.log(resultUpdateStatus[0].userID);
                if (resultUpdateStatus.length > 0) {
                  var dTOP = "";    // Publish latest data to App users
                  dTOP = commonTopic.APP_CONTROLLER_RECENT_STATUS+resultUpdateStatus[0].userID;
                  sendDatas = responseMessage.getSuccessResponse(constantCode.SUCCESS_CODE,commonMessage.APP_DATA_STATUS,pData);
                  exports.publishClientBinUpdated(dTOP,json.stringify(sendDatas),client);
                } else {
                  console.log("no owner");
                }
                
            } else {
              console.log(err);
             if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') { // convey error back to Broker client to Controller
               sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
               exports.publishClientBinUpdated(dynTopic, json.stringify(sendDatas),client);
             } else {
               sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
               exports.publishClientBinUpdated(dynTopic, json.stringify(sendDatas),client);
             }   
            }
          }); 

    } else {
        console.log(err);
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') { // convey error back to Broker client to Controller
              sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
              exports.publishClientBinUpdated(dynTopic, json.stringify(sendDatas),client);
        } else {
              sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
              exports.publishClientBinUpdated(dynTopic, json.stringify(sendDatas),client);
        } 
    }
  }); 
};

// 2017 JUNE 01
exports.parseValveStatusUpdatedDetails = function(message, client) {
  console.log('Going to Update Solenoid Valve Status');
  try {
    var req = json.parse(message);
    console.log(req);
    if (req.type == 0) {
      dynTopic = commonTopic.SOLVALVE_STATUS+req.userID;
    } else {
      dynTopic = commonTopic.CONTROLLER_CREATION_STATUS;
    }
    
  } catch (exception) {
    console.log('error in JSON req'); // convey error back to Broker client to Controller     
    return false; 
  }
   //  0 - Mobile App & 1 - Controller
    if (req.type == '0') {
      var vStatus = "";
      if (req.valveStatus == 'CLOSED') {
         sendDatas = responseMessage.setControllerResponse(constantCode.SOL_OFF_CODE); 
      } else {
        sendDatas = responseMessage.setControllerResponse(constantCode.SOL_ON_CODE);
      }
      exports.publishClientBinUpdated(commonTopic.CONTROLLER_CREATION_STATUS,json.stringify(sendDatas),client);
    } else {
      exports.updateSolenoidStatusFromContToApp(req,client,dynTopic);
    }
};


exports.updateSolenoidStatusFromContToApp = function(req,client,dynTopic) {
  console.log('update solinoid status from cont to app');
    var vStatus = "";
    if (req.valveStatus == 'CLOSED') {
      vStatus = '0';
    } else {
      vStatus = '1';
    }
    var pTypeID = req.mA+req.ptID;
    console.log('pro Typeid' + pTypeID);
    var sqlConn = {sql:modelController.UPDATE_SOLENOID_CONTROLLER_DETAILS, timeout : 5000};
    connection.query(sqlConn, [vStatus,req.mA,pTypeID], function (err, resultUpdateStatus) {
    if (!err) {
        console.log('update sol details success');
        console.log(resultUpdateStatus);
        console.log(resultUpdateStatus.insertId);
        console.log(resultUpdateStatus.affectedRows);
        //Check if the type is auto then send filled status to user
        var sqlConn = {sql:modelController.GET_PRODUCT_OWNER_ID, timeout : 5000};
             connection.query(sqlConn, [req.mA,pTypeID], function (err, resultUpdateStatus) {
            if (!err) {
                console.log('Get User ID');
                console.log(resultUpdateStatus.length);
                if (resultUpdateStatus.length > 0) {
                  var dTOP = "";    // Publish latest data to App users
                  dTOP = commonTopic.SOLVALVE_STATUS+resultUpdateStatus[0].userID;
                  if (vStatus == 0 ) {
                    sendDatas = responseMessage.setControllerResponse(constantCode.SWITCH_OFF_CODE);
                  } else {
                    sendDatas = responseMessage.setControllerResponse(constantCode.SWITH_ON_CODE);
                  }
                  exports.publishClientBinUpdated(dTOP,json.stringify(sendDatas),client);
                } else {
                  console.log("no owner");
                }
                
            } else {
              console.log(err);
             if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') { // convey error back to Broker client to Controller
               sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
               exports.publishClientBinUpdated(dynTopic, json.stringify(sendDatas),client);
             } else {
               sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
               exports.publishClientBinUpdated(dynTopic, json.stringify(sendDatas),client);
             }   
            }
          }); 

    } else {
        console.log(err);
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') { // convey error back to Broker client to Controller
              sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
              exports.publishClientBinUpdated(dynTopic, json.stringify(sendDatas),client);
        } else {
              sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
              exports.publishClientBinUpdated(dynTopic, json.stringify(sendDatas),client);
        } 
    }
  });
};


exports.publishClientBinUpdated = function(topic, succMsg, client) {
    client.publish(topic, succMsg);
};
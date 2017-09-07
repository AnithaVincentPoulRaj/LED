var Promise = require('bluebird');
var reqValidator = require('validator');
var Long    = require('long');
var payload = require("../lib/payloadconversion");

var modelCommon = require('../model/common');
var commonTopic = require('../route/protocol');
var constantCode = require('../config/constant');
var commonMessage = require('../config/messages');
var responseMessage = require('../utils/response');
var modelController = require('../model/controllermodel');


var sendDatas = "";
var dynTopic = "";
var sendEncodeData="";
//USE 18/07/17
exports.createController = function (message, client) {
	try {
		var payloadData = payload.decodePayloadData(message,"register","ControllerRegister");
  		console.log(payloadData);
 		dTopic = commonTopic.CONTROLLER_CREATION_STATUS+payloadData.mA;
  		console.log('Response Topice is '+dTopic);
  		if (payloadData.mA == ''){
            console.log('Invalid Mac Address');
            sendDatas = responseMessage.setControllerResponse(constantCode.VAL_ERROR_CODE);        
            sendEncodeData=payload.dataEncode(sendDatas,"response","ControllerResponse","hexString");
            exports.publishClientController(dTopic, sendEncodeData,client);     
            return false; 
        } 
        console.log('Basic validation are success');
         var userId = new Long(payloadData.uID.low, payloadData.uID.high, payloadData.uID.unsigned);
    	 console.log(userId.toString());
    	 if (payloadData.pT == 1) {
    	 	 exports.setController(payloadData,client,dTopic,userId);
    	 } else {
    	 	sendDatas = responseMessage.setControllerResponse(constantCode.VAL_ERROR_CODE);        
            sendEncodeData=payload.dataEncode(sendDatas,"response","ControllerResponse","hexString");
            exports.publishClientController(dTopic, sendEncodeData,client);     
            return false; 
    	 }

	} catch (exception) {
		console.log('PayLoad wrong');
		console.log(exception);
        sendDatas = responseMessage.setControllerResponse(constantCode.ERROR_CODE);        
        sendEncodeData=payload.dataEncode(sendDatas,"response","ControllerResponse","hexString");
        exports.publishClientController(dTopic, sendEncodeData,client);
        return false;
	}
};
//USE 18/07/17
exports.setController = function(req,client,dynTopic,userId) {
    console.log('inserted Main controller function');
    var controllerData = {
        USER_ID : userId,
        PRODUCT_TYPE : req.pT,
        PRODUCT_MAC : req.mA,
        CREATE_USER : userId,
        PRODUCT_NAME : req.deviceName,
        STATUS : "STOPPED"
    };
    var sqlConn = {sql:modelController.SET_CONTROLLER_SQL, timeout : 5000};
    connection.query(sqlConn, controllerData, function (err, resultLoginStatus) {
    if (!err) {
        console.log('inserted controller success');
        console.log('Inseterd Id is '+ resultLoginStatus.insertId);
        sendDatas = responseMessage.setControllerResponse(constantCode.SUCCESS_CODE);
        sendEncodeData=payload.dataEncode(sendDatas,"response","ControllerResponse","hexString");
        exports.publishClientController(dTopic, sendEncodeData,client);
        var sendData = {"userId":userId,
                        "status":"STOPPED",
                        "type":"LED"
                       };
        var sendEnData = payload.dataEncode(sendData, "response", "DeivceResponse", "hex");
        console.log('Data is '+sendEnData);
        var cTopic = commonTopic.USER_CONTROLLER_CURRENT_STATUS+userId;
        console.log('Topic is '+cTopic);
        exports.publishClientController(cTopic, sendEnData, client);
        
    } else {
        console.log('error');
        console.log(err.code);
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
           sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);        
       	   sendEncodeData=payload.dataEncode(sendDatas,"response","ControllerResponse","hexString");
           exports.publishClientController(dTopic, sendEncodeData,client);
        } else {
           sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);        
       	   sendEncodeData=payload.dataEncode(sendDatas,"response","ControllerResponse","hexString");
           exports.publishClientController(dTopic, sendEncodeData,client);
        } 
    }
  }); 
};
// USE 18/07/17
exports.controllerStatus = function (message, client) {
	try {
		console.log('Controller Live Status');

        var payloadData = payload.decodePayloadData(message,"controller","LEDStatusCon");
        console.log(payloadData);
        dTopic = "";
        var sqlConn = {sql:modelController.GET_MAIN_CONTROLLER_ID, timeout : 5000};
        connection.query(sqlConn, payloadData.mA, function (err, resultProductDetails) {
            if (!err) {
                if(resultProductDetails.length > 0) {
                	console.log(resultProductDetails);
                    dTopic = commonTopic.CONTROLLER_CREATION_STATUS+payloadData.mA;
                    var productId = resultProductDetails[0].productId;
                    var userId = resultProductDetails[0].userId;
                    console.log('productId '+productId);
                    console.log('userid '+userId);
                    var sqlConn = {sql:modelController.UPDATE_USER_CONTROLLER_DETAILS, timeout : 5000};
                    connection.query(sqlConn, [payloadData.ledOnOffStatus,payloadData.mA], function (err, deviceStatus) {
                        if (!err) {
                            console.log("device updatede query result");
                            var sendData = {"userId":userId,
                                            "status":payloadData.ledOnOffStatus,
                                            "type":"LED"
                                           };
                            var sendEnData = payload.dataEncode(sendData, "response", "DeivceResponse", "hex");
                            var cTopic = commonTopic.USER_CONTROLLER_CURRENT_STATUS+userId;
                            exports.publishClientController(cTopic, sendEnData, client);
                        } else {
                           // console.log(err)
                           console.log(err.code);
                            sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
                            sendEncodeData=payload.dataEncode(sendDatas,"response","ControllerResponse","hexString");
                            exports.publishClientController(dTopic, sendEncodeData,client);
                            return false;
                        }     
                    });

                } else {
                    console.log('No Data Found');
                    //Need to publish common error via common topic
                }
            } else {
                console.log(err);
                //Need to publish common error via common topic
            }
        });

    } catch (exception) {
		console.log('PayLoad wrong');
		console.log(exception);
        return false;
	}
};

exports.controllerCurrentStatus = function (message, client) {
    try {
        console.log('Controller Current Status');
        var payloadData = payload.decodePayloadData(message,"controller","LEDStatus");
        console.log(payloadData);
        dTopic = "";
        var userId = new Long(payloadData.uID.low, payloadData.uID.high, payloadData.uID.unsigned);
        console.log(userId);
        var sqlConn = {sql:modelController.GET_MAIN_CONTROLLER_LEAK_STATUS, timeout : 5000};
        connection.query(sqlConn, userId.toString(), function (err, resultProductDetails) {
            if (!err) {
                if(resultProductDetails.length > 0) {
                    console.log(resultProductDetails);
                    var productId = resultProductDetails[0].productId;
                    var status = resultProductDetails[0].status;
                    console.log('productId '+productId);
                    console.log('status '+status);
                    console.log('TYPE IS '+payloadData.type);
                    if (payloadData.type == 'LED') {
                        var sendData = {"userId":userId.toString(),
                                        "status":status,
                                        "type":"LED"
                                       };
                        var sendEnData = payload.dataEncode(sendData, "response", "DeivceResponse", "hex");
                        var cTopic = commonTopic.USER_CONTROLLER_CURRENT_STATUS+userId;
                        exports.publishClientController(cTopic, sendEnData, client);
                    } else if (payloadData.type == 'SINGLEONE' || payloadData.type == 'SINGLETWO' || payloadData.type == 'BLINK' || payloadData.type == 'BOTH' || payloadData.type == 'NONE') {
                       var sendData = {"mA":resultProductDetails[0].macAddress,
                                       "ledOnOffStatus":payloadData.type
                                      };
                       console.log(sendData);               
                       var sendEnData = payload.dataEncode(sendData, "controller", "LEDStatusCon", "hexString");
                       console.log(sendEnData);
                       var cTopic = commonTopic.CONTROLLER_UPDATE_STATUS+resultProductDetails[0].macAddress;
                       exports.publishClientController(cTopic, sendEnData, client);
                    }
                    

                } else {
                    console.log('No Data Found');
                    //Need to publish common error via common topic
                }
            } else {
                console.log(err);
                //Need to publish common error via common topic
            }
        });

    } catch (exception) {
        console.log('PayLoad wrong');
        console.log(exception);
        return false;
    }
};
exports.publishClientController = function(topic, succMsg, client) {
    client.publish(topic, succMsg);
};
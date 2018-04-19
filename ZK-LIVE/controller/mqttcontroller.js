var Promise = require('bluebird');
var Long    = require('long');
var reqValidator = require('validator');
var commonTopic = require('../route/topic');
var configLogPrcTime = require('../util/configlogprtime');
var logger = configLogPrcTime.getLogger('epms');
var payload = require("../lib/protoconversion");
var constantCode = require('../config/constant');


var dynTopic = "";
var sendDatas = "";
var sendEncodeData="";

/*
 Function Name : controllerDataProcess
 Description   : Validate controller processed data and convert it into protobuf format and publish to the clients.
 Params        : macAddress, processedData
 Created on    : 26-03-2018
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
 exports.controllerDataProcess = function (organizationId, identifier, origin, pData) {
    return new Promise(function (resolve, reject){    
        try {
            var pdata = {
                "identifier":identifier,
                "origin":origin,
                "data" : pData
            };
            var sendEnData = payload.dataEncode(pdata, "mqttmessage", "ControllerData", "hex");
            var cTopic = commonTopic.CONTROLLER_DATA_APP+organizationId;
            exports.publishClientController(cTopic, sendEnData);
        if (identifier == constantCode.MINUTES) {
            exports.publishClientController(commonTopic.CONTROLLER_DATA_MTIER, sendEnData);
        }
        return resolve('success')
    } catch (exception) {
        commonLoggerSetup('PROTO CONVERTED PAYLOAD : \n' + exception,LOGERROR);
        return resolve(exception)
    }
});    
};

/*
 Function Name : hourDataProcessMqtt
 Description   : 
 Params        : identifier, origin, pData
 Created on    : 
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
exports.hourDataProcessMqtt = function (identifier, origin, pData) {
    try {
        var pdata = {
            "identifier":identifier,
            "origin":origin,
            "data" : pData
        };
        var sendEnData = payload.dataEncode(pdata, "mqttmessage", "ControllerData", "hex");
        exports.publishClientController(commonTopic.CONTROLLER_DATA_MTIER, sendEnData);
    } catch (exception) {
        commonLoggerSetup('PROCESSED PROTOBUF HOUR DATA EXCEPTION: \n' + exception,LOGINFO);
    }
};
exports.publishClientController = function(topic, succMsg) {
    mqttclient.publish(topic, succMsg);
};

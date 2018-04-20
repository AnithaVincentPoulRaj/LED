/*
 Class Name    : mqttclient with zookeeper instance
 Description   : This class is used to setup and start the mqtt client.
 Params        : 
 Created on    : 22-03-2018
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
*/
require('dotenv').load();
var Promise = require('bluebird');
var mqtt = require('mqtt');
var commonTopic = require('./route/topic');
var configLogPrcTime = require('./util/configlogprtime');
var controllerMqtt = require('./controller/mqttcontroller');
var logger = configLogPrcTime.getLogger('epms');

var PORT = process.env.MQTT_BROKER_PORT;
var HOST = process.env.MQTT_BROKER_HOST;
var options = {
    port: PORT,
    host: HOST,
    protocolId: 'MQIsdp',
    secureProtocol: 'TLv1_method',
    clientId: '1ZK_MBTEAM_TEST_SIRAJUU',
    protocolVersion: 3,
    protocol: 'mqtt',
    rejectUnauthorized : true,
    checkServerIdentity: function (host, cert) {
      return undefined;
  }
};

global.mqttclient = mqtt.connect(options);
mqttclient.on('connect', function(){
    commonLoggerSetup('MQTT CONNECTED : \n',LOGINFO);
});

mqttclient.on('error', function(err){
  commonLoggerSetup('MQTT CONNECTION ERROR : \n'+err,LOGERROR);
});

mqttclient.on('reconnect', function(err){
  commonLoggerSetup('MQTT RE-CONNECTED : \n',LOGINFO);
});

mqttclient.subscribe(commonTopic.CONTROLLER_CREATION, function() {
    commonLoggerSetup('SUB : \n'+commonTopic.CONTROLLER_CREATION,LOGINFO);
});

mqttclient.on('message', function(topic, message, packet) { 
     commonLoggerSetup("Received message '" + message + "' on '" + topic + "'",LOGINFO);
});



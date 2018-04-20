var CronJob = require('cron').CronJob;
const zookeeper = require('node-zookeeper-client-async');

global.nodePrefix = '/epms';
var constant = require("./config/constant");
var zkcontroller  = require('./controller/zkcontroller');
//global.zkclient = zookeeper.createAsyncClient(constant.ZK_SERVER_ROOT);
global.zkclient = zookeeper.createAsyncClient("192.168.2.95:2181");
process.setMaxListeners(0);

zkclient.once('connected', function (err) {
    if (err) {
        commonLoggerSetup('FAILED TO CONNECT ZOOKEEPER SERVER : \n'+error,LOGERROR);
    } else {
        commonLoggerSetup('SUCCESS TO CONNECT ZOOKEEPER SERVER : \n',LOGINFO);
        exports.initRootNode(nodePrefix);
    }
});

zkclient.once('state', function (state) {
    commonLoggerSetup('ZOOKEEPER STATE : \n'+state,LOGINFO);
});
zkclient.on("connectedReadOnly", function () {
    commonLoggerSetup('ZOOKEEPER CONN READ ONLY : \n',LOGINFO);
});

zkclient.on("expired", function () {
    commonLoggerSetup('ZOOKEEPER SESSION EXPIRED: \n',LOGINFO);
});

zkclient.on("disconnected", function (){
    commonLoggerSetup('ZOOKEEPER DISCONNECTED: \n',LOGINFO);
});

/*
 Function Name    : initRootNode
 Description   : 
 Created on    :
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
*/
exports.initRootNode = function (root) {
    zkclient.create(root, function (error) {
        if (error) {
         if(error.getCode() == zookeeper.Exception.NODE_EXISTS) {
           commonLoggerSetup('ZOOKEEPER ROOT NODE ALREADY EXISTS: \n',LOGINFO);
          }
          commonLoggerSetup('FAILED TO CREATE ZOOKEEPER ROOT NODE: \n'+error,LOGERROR);
        } else {
          commonLoggerSetup('CREATE ZOOKEEPER ROOT NODE: \n',LOGINFO);
        } 
 });
};

zkclient.connectAsync();


//* * * * *
//*/2 * * * * 
var job = new CronJob({
  cronTime: '* * * * *',
  onTick: function() {
     commonLoggerSetup('CRON CALLED EVERY MINUTE: \n',LOGINFO);
     exports.cronRawDataToMinutes();
  },
  start: false,
  timeZone: 'UTC'
});
job.start();

//*/5 * * * *
//0 * * * *,
var job1 = new CronJob({
  cronTime: '0 * * * *',
  onTick: function() {
     commonLoggerSetup('CRON CALLED EVERY HOUR: \n',LOGINFO);
     exports.cronMinuteDataToHour();
  },
  start: false,
  timeZone: 'UTC'
});
job1.start();

/*
 Function Name    : cronRawDataToMinutes
 Description   : 
 Created on    :
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
*/
exports.cronRawDataToMinutes = function () {
    zkcontroller.getAllRaw(zkclient, nodePrefix, 'raw', '/minute','MINUTE_PROD_SENS');
};

/*
 Function Name    : cronMinuteDataToHour
 Description   : 
 Created on    :
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
*/
exports.cronMinuteDataToHour = function () {
    zkcontroller.getAllRaw(zkclient, nodePrefix, 'minute', '/hour','HOUR_PROD_SENS');
};


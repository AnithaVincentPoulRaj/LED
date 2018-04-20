var trim = require('trim');
var Promise = require('bluebird');
var dateFormat = require('dateformat');
var zkcommon = require('../lib/zkcommon');
var asyncLoop = require('node-async-loop');
var controllerMqtt = require('./mqttcontroller');
var constant	   = require('../config/constant');
var dataConversion = require('../util/dataconversion');
const zookeeper = require('node-zookeeper-client-async');
var zknodecontrollerprocess = require('./zknodedataprocess');

var type = '';
var systemId = '';
var departmentId = '';
var controllerId = '';
var macAddress   = '';
var payloadType  = '';
var noBytes      = '';         
var shiftNumber  = '';
var startDate    = '';
var startTime    = '';
var endDate      = '';
var endTime      = '';
var payloadError = '';
var organizationId  = '';
var mqttResponseStr = [];
var payloadDecimalValue = '';	

/*
 Function Name : setCreateBulkNode
 Description   : 
 Created on    : 
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
exports.setCreateBulkNode = function (data) {
   commonLoggerSetup('BULK NODE CREATION : \n',LOGINFO);
   zknodecontrollerprocess.createControllerNode(zkclient, data);
};

/*
 Function Name : checkTypeCollectionNode
 Description   : 
 Created on    : 
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
exports.checkTypeCollectionNode = function (path, data) {
	zkclient.exists(path, function (error, stat) {
		if (error) {
			commonLoggerSetup('TYPE COLLECTION NODE EXISTS ERROR : \n'+error.stack,LOGERROR);
			return;
		}
		if (stat) {
			commonLoggerSetup('TYPE COLLECTION NODE EXISTS : \n',LOGINFO);
			zknodecontrollerprocess.createTypeCollectionNode(path,data,'YES');
		} else {
			commonLoggerSetup('TYPE COLLECTION NODE DOES NOT EXISTS : \n',LOGINFO);
			zknodecontrollerprocess.createTypeCollectionNode(path,data,'NO');
		}
	});
};

/*
 Function Name : setCreateTypeCollectionNode
 Description   : 
 Created on    : 
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
exports.setCreateTypeCollectionNode = function (path,data,type) {
	var nodeclient = zkclient.transaction();
	if (type == 'YES') {
		nodeclient.remove(path, -1);
	}
	nodeclient.create(path, new Buffer(data));
	nodeclient.commit(function (error, results) {
		if (error) {
			commonLoggerSetup('FAILED TO EXCUTE TYPE COLLECTION NODE TRANSACTION : \n'+error.stack,LOGERROR);
			return;
		}
		commonLoggerSetup('TYPE COLLECTION NODE TRANSACTION COMPLETED : \n',LOGINFO);
		nodeclient = '';
	});
};

/*
 Function Name : controllerDataProcessing
 Description   : 
 Created on    : 
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
exports.controllerDataProcessing = function (obj) {
	macAddress = dataConversion.convertHexToDecimal(obj.MA);
	payloadType  = obj.PT.toString();
	noBytes      = dataConversion.convertHexToDecimal(obj.NB);         
	shiftNumber  = dataConversion.convertHexToDecimal(obj.SN);
	startDate    = dataConversion.getControllerDateValue(obj.SD);
	startTime    = dataConversion.getControllerTimeValue(obj.ST);
	endDate      = dataConversion.getControllerDateValue(obj.ED);
	endTime      = dataConversion.getControllerTimeValue(obj.ET);
	payloadError = dataConversion.getPayloadErrorValue(obj.ER);
	payloadDecimalValue = dataConversion.getPayloadValue(payloadType, obj.PV, payloadError);	 

	if (payloadType == constant.PAYLOAD_TYPE_PROD) {
		type = constant.MINUTE_PROD_SENS;
	} else if (payloadType == constant.PAYLOAD_TYPE_ELEC) {
		type = constant.MINUTE_ELEC;
	} else if (payloadType == constant.PAYLOAD_TYPE_HARM) {
		type = constant.MINUTE_HARM;
	}
	macAddress = trim(macAddress);
	exports.getFullNodePath(macAddress,nodePrefix);
};

/*
 Function Name : getFullNodePath
 Description   : 
 Created on    : 
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
exports.getFullNodePath = function (endpoints, path) {
	zkclient.getChildren(path, function (error, children, stats) {
		if (error) {
			if(error.getCode() == zookeeper.Exception.NO_NODE) {
				commonLoggerSetup('LIVE DATA NODE NOT AVL : \n',LOGERROR); 
				return error;
			}               
			return error;
		}
		var tmpChildren = [];
		tmpChildren = String(children).split(",");
		asyncLoop(tmpChildren, function (item, next) {
			var child = item;
			var newPath = path+'/'+child;
			if(child== endpoints){ 
				commonLoggerSetup('LIVE DATA NODE PATH : \n'+newPath,LOGINFO); 
				exports.parsecontrollerdata(newPath, '/');
			}   
			var stringLength = newPath.length;
			var lastChar = newPath.charAt(stringLength - 1);
			if(lastChar != '/'){    
				exports.getFullNodePath(endpoints,newPath); 
			} 
			next();
		} );
	});
};

/*
 Function Name : parsecontrollerdata
 Description   : 
 Created on    : 
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
exports.parsecontrollerdata = function(path, separator) {
	var arrData = zkcommon.splitString(path, separator);
	if (arrData.length > 0 && arrData.length == 7) {
		organizationId = arrData[2];
		departmentId = arrData[3];
		systemId = arrData[4];
		controllerId = arrData[5];
		mqttResponseStr.push({
			"organizationId" : organizationId, "departmentId" : departmentId,
			"systemId"       : systemId, "controllerId" : controllerId,
			"mA" : macAddress, "pT"  : payloadType, "nB" : noBytes,
			"sN" : shiftNumber, "startTime" : startDate +" "+startTime, "endTime"  : endDate+" "+endTime,
			"keyValues" : payloadDecimalValue, "state" : constant.AVAILABLE,"type" : type
		});
		exports.getProcessedDataFromZK(organizationId, constant.MINUTES, constant.CONTROLLER , JSON.stringify(mqttResponseStr)); 
		var setDataPath = nodePrefix+'/'+organizationId+'/'+departmentId+'/'+systemId+'/'+controllerId+'/'+macAddress+'/raw';
		exports.setRawDataInZK(setDataPath, mqttResponseStr);
	}
};

/*
 Function Name : getProcessedDataFromZK
 Description   : 
 Created on    : 
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
exports.getProcessedDataFromZK = function (organizationId, identifier, origin, processedData) {
  controllerMqtt.controllerDataProcess(organizationId, identifier, origin, processedData).then(function (resultData){
  	commonLoggerSetup('CONTROLLER DATA PUB STATUS : \n'+resultData,LOGINFO); 
  }).error(function (error){
      commonLoggerSetup('CONTROLLER DATA PUB STATUS ERROR : \n'+resultData,LOGERROR); 
  }).catch(function (error) {
      commonLoggerSetup('CONTROLLER DATA PUB STATUS ERROR : \n'+resultData,LOGERROR);    
  });
};

/*
 Function Name : setRawDataInZK
 Description   : 
 Created on    : 
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
exports.setRawDataInZK = function (datapath, processedData) {
	zknodecontrollerprocess.addRawData(zkclient, datapath, processedData[0]);
};

/*
 Function Name : getAllRaw
 Description   : 
 Created on    : 
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
exports.getAllRaw = function (client, path, inpath, outpath,type) {
	client.getChildren(path, function (error, children, stats) {
		if (error) {
			if(error.getCode() == zookeeper.Exception.NO_NODE) {
				commonLoggerSetup('ALL NODE PATH ERROR : \n'+error.getCode(),LOGERROR); 
				return;
			}               
			return;
		}
		var tmpChildren = [];
		tmpChildren = String(children).split(",");
		asyncLoop(tmpChildren, function (item, next) {
			var child = item;
			var newPath = path+'/'+child;
			if(child== inpath){                
				commonLoggerSetup('ALL NODE PATH : \n'+newPath,LOGINFO); 
				client.getData(newPath, function (event) {
					commonLoggerSetup('ALL NODE PATH GOT EVENT \n',LOGINFO); 
				}, function (error, data, stat) {
					if (error) {
						console.log(error.stack);
					}
					if(data != undefined) {
						client.transaction().
						remove(newPath, -1).
						create(newPath).
						commit(function (error, results) {
							if (error) {
								commonLoggerSetup('ALL NODE PATH FAILURE TRANSACTION \n',LOGERROR);
							}
							commonLoggerSetup('ALL NODE PATH SUCCESS TRANSACTION \n',LOGINFO);
						}); 
						var response = JSON.parse(data.toString('utf8'));
						var avgData = response[0];
						var prodution = 0.0, produtionSize = 0;
						var efficiency = 0.0, efficiencySize = 0;
						var energy = 0.0, energySize= 0;
						var ukg = 0.0, ukgSize = 0;
						asyncLoop(response, function (item, next) {						
							if (item.pT == constant.PAYLOAD_TYPE_PROD) {
								var keyValues = item.keyValues;
								asyncLoop(keyValues, function (keyItem, next) {
									if (keyItem.key == constant.PROD_14) {
										prodution = prodution + parseFloat(keyItem.values[0]);
										produtionSize++;
									} else if (keyItem.key == constant.PROD_17) {
										efficiency = efficiency + parseFloat(keyItem.values[0]);								
										efficiencySize++;
									} else if (keyItem.key == constant.PROD_18) {
										energy = energy + parseFloat(keyItem.values[0]);
										energySize++
									} else if (keyItem.key == constant.PROD_19) {
										ukg = ukg + parseFloat(keyItem.values[0]);
										ukgSize++;
									}
									next();
								});
							}
							next();
						}); 
						var keyValues = []; 
						prodution = prodution/produtionSize; 
						efficiency = efficiency/efficiencySize; 
						energy = energy/energySize; 
						ukg = ukg/ukgSize; 
						keyValues.push({ "key": constant.PROD_14, "values": [prodution] },
							{ "key": constant.PROD_17, "values": [efficiency]},
							{ "key": constant.PROD_18, "values": [energy] },
							{ "key": constant.PROD_19, "values": [ukg] }); 
						var now = new Date();
						var currentTime = dateFormat(now, "UTC:HH:MM"); 
						var currentDate = dateFormat(now, "UTC:yyyy-mm-dd"); 
						var endTime = currentDate +' '+ currentTime+ ':00'; 
						if (type==constant.MINUTE_PROD_SENS){
							now -= (1 * 60 * 1000);
						} else if (type==constant.HOUR_PROD_SENS){ 							 
							now -= (1 * 60 * 60 * 1000); 
						}
						currentTime = dateFormat(now, "UTC:HH:MM"); 
						currentDate = dateFormat(now, "UTC:yyyy-mm-dd"); 
						var startTime = currentDate +' '+ currentTime+ ':00'; 
						avgData.startTime = startTime;
						avgData.endTime = endTime; 
						avgData.type = type;
						avgData.keyValues = keyValues;
						var mPath = path+outpath;
						commonLoggerSetup('ALL NODE PATH AVERAGE \n'+JSON.stringify([avgData]),LOGINFO);
						if (type==constant.HOUR_PROD_SENS){ 
							exports.setProcessedHourlyDataToMqttClient([avgData]);
						}
						zknodecontrollerprocess.addRawData(zkclient, mPath, avgData);
					}
				});
			}   
			var stringLength = newPath.length;
			var lastChar = newPath.charAt(stringLength - 1);
			if(lastChar != '/'){    
				exports.getAllRaw(client, newPath, inpath, outpath,type); 
			} 
			next();
		});
	});
};

/*
 Function Name : setProcessedHourlyDataToMqttClient
 Description   : 
 Created on    : 
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
exports.setProcessedHourlyDataToMqttClient = function (avgData) {
	commonLoggerSetup('PUB HOUR DATA \n',LOGINFO);
	controllerMqtt.hourDataProcessMqtt(constant.HOUR, constant.TCP, JSON.stringify(avgData));
}

/*
 Function Name : getDataForSpecifiNode
 Description   : 
 Created on    : 
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
exports.getDataForSpecifiNode = function (path, client) {
	console.log(path);
    return new Promise(function (resolve, reject) {
        zkclient.getData(path, function (event) {
           console.log('Got event: %s.', event); 
       }, function (error, data, stat) {
        if (error) {
            console.log(error.stack);
            return resolve(error);
        }
        console.log('Got data: %s', data.toString('utf8'));
        return resolve(data.toString('utf8'));
    });
    });
};
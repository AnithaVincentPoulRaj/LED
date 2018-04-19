var asyncLoop        = require('node-async-loop');
var dataConversion   = require('./util/dataconversion');
//var mqttClient       = require('./mqttclient');
var configLogPrcTime = require('./util/configlogprtime');
var cacheOperation   = require('./util/cacheoperation');
var zkcontroller = require('./controller/zkcontroller');
var constant				 = require('./config/constant');
var logger  = configLogPrcTime.getLogger('epms');
var request = require('request');

/*
 Function Name : dataProcessSendMqtt
 Description   : This function used to process data and send to mqtt client.
 Params        : obj
 Created on    : 22-03-2018
 Updated on    :
 Created by    : iExemplar Software India Pvt Ltd.
 */

 exports.dataProcessSendMqtt = function(obj) {

 	var start = configLogPrcTime.getProcessingTime();
 	var organizationId  = "";
 	var type = "";
 	var mqttResponseStr = [];
 	var macAddress   = dataConversion.convertHexToDecimal(obj.MA);
 	var payloadType  = obj.PT.toString();
 	var noBytes      = dataConversion.convertHexToDecimal(obj.NB);         
 	var shiftNumber  = dataConversion.convertHexToDecimal(obj.SN);
 	var startDate    = dataConversion.getControllerDateValue(obj.SD);
 	var startTime    = dataConversion.getControllerTimeValue(obj.ST);
 	var endDate      = dataConversion.getControllerDateValue(obj.ED);
 	var endTime      = dataConversion.getControllerTimeValue(obj.ET);
 	var payloadError = dataConversion.getPayloadErrorValue(obj.ER);
 	var payloadDecimalValue = dataConversion.getPayloadValue(payloadType, obj.PV, payloadError);	 

 	if (payloadType == constant.PAYLOAD_TYPE_PROD) {
 		type = constant.MINUTE_PROD_SENS;
 	} else if (payloadType == constant.PAYLOAD_TYPE_ELEC) {
 		type = constant.MINUTE_ELEC;
 	} else if (payloadType == constant.PAYLOAD_TYPE_HARM) {
 		type = constant.MINUTE_HARM;
 	}
 	
 	inboundCache.get(constant.UNIQUE_CODE+macAddress, function(err, ctrlDetails) {
 		if (!err) {
 			if (ctrlDetails == undefined) {
 				logger.error(constant.KEY_NOT_FOUND);
 				console.log("key not found - controller details");
 			} else {	
 				organizationId = ctrlDetails.organizationId;   
 				mqttResponseStr.push({
 					"organizationId" : organizationId, "departmentId" : ctrlDetails.departmentId,
 					"systemId"       : ctrlDetails.systemId, "controllerId" : ctrlDetails.id,
 					"mA" : macAddress, "pT"  : payloadType, "nB" : noBytes,
 					"sN" : shiftNumber, "startTime" : startDate +" "+startTime, "endTime"  : endDate+" "+endTime,
 					"keyValues" : payloadDecimalValue, "state" : constant.AVAILABLE,"type" : type
 				});

 				//var mqttStatus = mqttClient.getDataFromInboundServer(organizationId, constant.MINUTES, constant.CONTROLLER , JSON.stringify(mqttResponseStr)); 
 				if (payloadType == constant.PAYLOAD_TYPE_PROD ) {
 					aggregate_type  = constant.AGGREGATE_TYPE_HOUR;
 					exports.getCumulativeDataProcess(macAddress, constant.DEPT_TYPE, aggregate_type, mqttResponseStr, ctrlDetails, shiftNumber, startDate);
 					exports.getCumulativeDataProcess(macAddress, constant.UNIT_TYPE, aggregate_type ,mqttResponseStr, ctrlDetails, shiftNumber, startDate);
 					aggregate_type  = constant.AGGREGATE_TYPE_SHIFT;
 					exports.getCumulativeDataProcess(macAddress, constant.DEPT_TYPE, aggregate_type, mqttResponseStr, ctrlDetails, shiftNumber, startDate);
 					exports.getCumulativeDataProcess(macAddress, constant.UNIT_TYPE, aggregate_type ,mqttResponseStr, ctrlDetails, shiftNumber, startDate);
 				}
 			}
 		}
 	});	  
 	logger.info('TO MQTT: ' + mqttResponseStr);
 	var end = configLogPrcTime.getProcessingTime(start);
 	logger.info('dataProcessSendMqtt Process Time : ' + end + ' ms');  
 };

/*
 Function Name : getControllerDetails
 Description   : This function used to get active controller list.
 Params        : 
 Created on    : 22-03-2018
 Updated on    :
 Created by    : iExemplar Software India Pvt Ltd.
 */

 exports.getControllerDetails = function () {

 	var options = {
 		url: constant.SERVER_API_ROOT+constant.API_CTRL_LIST,
 		headers: {
 			"Authorization" : constant.SERVER_AUTH
 		}
 	};
 	console.log(options);
 	function callback(error, response, body) {
 		if (!error && response.statusCode == 200) {
 			var info = JSON.parse(body);
 			//console.log(info);
 			console.log(info.results.length);
 			if (info.results.length > 0) {
 				zkcontroller.setCreateBulkNode(info.results);
 				asyncLoop(info.results, function (item, next) {
 					var key = constant.UNIQUE_CODE + item.uniqueCode;
 					var ctrlList = {};
 					ctrlList["id"] =  item.id;
 					ctrlList["organizationId"] = item.organizationId;
 					ctrlList["departmentId"]   = item.departmentId;
 					ctrlList["systemId"]       = item.systemId;
 					cacheOperation.insertCache(key, ctrlList);
 					next();
 				});
 			}


 		} 
 	}
 	request(options, callback);
 };

 exports.getTypeCollectionDetails = function () {

 	var options = {
 		url: constant.SERVER_API_ROOT+constant.API_TYPE_COLLECTION,
 		headers: {
 			"Authorization" : constant.SERVER_AUTH
 		}
 	};
 	function callback(error, response, body) {
 		if (!error && response.statusCode == 200) {
 			var info = JSON.parse(body);
 			//console.log(info);
 			if (info.results.length > 0) {
 				zkcontroller.checkTypeCollectionNode('/epms/typecollection', info.results);
 			}

 		} 
 	}
 	request(options, callback);
 };


/*
 Function Name : getCumulativeDataProcess
 Description   : This function used to calculate the cumulative values.
 Params        : macAddress, type, aggregate_type , mqttResponseStr, ctrlDetails, shiftNumber, startDate
 Created on    : 27-Mar-2018
 Updated on    : 28-Mar-2018
 Created by    : iExemplar Software India Pvt Ltd.
 */

 exports.getCumulativeDataProcess = function (macAddress, type, aggregate_type , mqttResponseStr, ctrlDetails, shiftNumber, startDate) {

 	var mqttDeptResponseStr = {};
 	var mqttResultStr 			= [];
 	var id         	= "";
 	var idString   	= "";
 	var identiifer 	= "" 
 	var key 				= "";
 	var departmentId 		= "";
 	var organizationId 	= "";
 	var keyValues = "";	
 	var resetFlag = 0;
 	var cacheTTL 		= constant.CACHE_TTL;
 	var shiftNumber = shiftNumber.toString(); 

 	if (mqttResponseStr.length > 0 ) {
 		departmentId   = mqttResponseStr[0].departmentId;
 		organizationId = mqttResponseStr[0].organizationId;
 		keyValues      = mqttResponseStr[0].keyValues;	
 	} 

 	if (aggregate_type == constant.AGGREGATE_TYPE_HOUR) {

 		var date = new Date();
 		var currentDay   = date.getDate().toString();
 		var currentMonth = (date.getMonth()+1).toString();
 		var currentYear  = date.getFullYear().toString();
 		if(currentMonth<9) {
 			currentMonth = "0" + currentMonth;
 		}
 		var date = currentYear + "-" + currentMonth+"-" + currentDay;
 		var startDate   = Date.parse(startDate);
 		var currentDate = Date.parse(date);
 		if (startDate != currentDate && shiftNumber == "1") {
 			resetFlag = 1;
 		} 

 		if (type == constant.DEPT_TYPE) {
 			idString  = constant.DEPT_STRING;
 			id        = departmentId;
 			identifer = constant.AGGREGATE_DEPT;
 		} else if (type == constant.UNIT_TYPE) {
 			idString 	= constant.UNIT_STRING;
 			id 				= organizationId;
 			identifer = constant.AGGREGATE_UNIT;
 		}

 		if (constant.LIVE.length > 0 && idString.length > 0 && id.length > 0) {
 			key = constant.LIVE+idString+id;
 		}

 	} else if (aggregate_type == constant.AGGREGATE_TYPE_SHIFT) {

 		if (type == constant.DEPT_TYPE) {
 			idString  = constant.DEPT_STRING;
 			id        = departmentId;
 			identifer = constant.AGGREGATE_DEPT_SHIFT;
 		} else if (type ==  constant.UNIT_TYPE) {
 			idString  = constant.UNIT_STRING;
 			id        = organizationId;
 			identifer = constant.AGGREGATE_UNIT_SHIFT;
 		}
 		if (constant.LIVE.length > 0 && idString.length > 0 
 			&& id.length > 0 && shiftNumber.length > 0) {
 			key = constant.LIVE+idString+id+shiftNumber;
 	}
 	cacheTTL = constant.CURRENT_SHIFT_CACHE_TTL;
 }

 inboundCache.get(key, function( err, datavalue ) {
 	if (!err) {
 		if (datavalue == undefined || resetFlag == 1) {
 			asyncLoop(keyValues, function (item, next) {
 				if (item.key == constant.PROD_14) {
 					mqttDeptResponseStr[constant.PRODUCTION] = item.values[0];
 				} else if (item.key == constant.PROD_17) {
 					mqttDeptResponseStr[constant.EFFICIENCY] = item.values[0];
 				} else if (item.key == constant.PROD_18) {
 					mqttDeptResponseStr[constant.ENERGY] = item.values[0];
 				} else if (item.key == constant.PROD_19) {
 					mqttDeptResponseStr[constant.UKG] = item.values[0];
 				}
 				next();
 			});
 			if(key.length > 0) {
 				cacheOperation.insertCache(key, mqttDeptResponseStr, cacheTTL);
 			} else {
 				logger.error(constant.KEY_NOT_FOUND);
 			}

 		} else {
 			asyncLoop(keyValues, function (item, next) {
 				if (item.key == constant.PROD_14) {
 					mqttDeptResponseStr[constant.PRODUCTION] = parseInt(datavalue.production) + parseInt(item.values[0]);
 				} else if (item.key == constant.PROD_17) {
 					mqttDeptResponseStr[constant.EFFICIENCY] = parseInt(datavalue.efficiency) + parseInt(item.values[0]);
 				} else if (item.key == constant.PROD_18) {
 					mqttDeptResponseStr[constant.ENERGY] = parseInt(datavalue.energy) + parseInt(item.values[0]);
 				} else if (item.key == constant.PROD_19) {
 					mqttDeptResponseStr[constant.UKG] = parseInt(datavalue.ukg) + parseInt(item.values[0]);
 				}
 				next();
 			});
 			if(key.length > 0) {
 				cacheOperation.insertCache(key, mqttDeptResponseStr, cacheTTL);	
 			} else {
 				logger.error(constant.KEY_NOT_FOUND);
 			}
 		}	
 	} else {
 		logger.error(err);
 	}	
 });	
 mqttResultStr.push({
 	"organizationId" : ctrlDetails.organizationId, "departmentId" : ctrlDetails.departmentId,
 	"systemId"       : ctrlDetails.systemId, "controllerId"       : ctrlDetails.id,
 	"mA" : macAddress, "keyValues" : mqttDeptResponseStr
 });
 //var mqttStatus = mqttClient.getDataFromInboundServer(ctrlDetails.organizationId, identifer, constant.TCP , JSON.stringify(mqttResultStr)); 
};
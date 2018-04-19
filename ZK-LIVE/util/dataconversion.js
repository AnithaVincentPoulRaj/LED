var controllerParam = require('./controllerparameter');
var asyncLoop = require('node-async-loop');
var rn = require('random-number');
var dataStr = [];
/*
 Function Name : convertHexToDecimal
 Description   : This function used convert hexdecimal to decimal.
 Params        : hexValue
 Created on    : 21-03-2018
 Updated on    :
 Created by    : iExemplar Software India Pvt Ltd.
*/

exports.convertHexToDecimal = function (hexValue) {    
		var hexValueTemp = hexValue.split(' ').join('');
		return parseInt(hexValueTemp,16).toString();        
}

exports.convertHexToString = function (hexValue) {
	var hex = hexValue.toString();//force conversion
	var str = '';
	for (var i = 0; i < hex.length; i += 2)
		str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	//console.log(str);
	return str;
};

/*
 Function Name : getControllerDateValue
 Description   : This function used convert hexdecimal to decimal for date.
 Params        : dateHexValue
 Created on    : 21-03-2018
 Updated on    :
 Created by    : iExemplar Software India Pvt Ltd.
*/

exports.getControllerDateValue = function (dateHexValue) {    

		dataStr = [];
		dateHexValue.split(" ").map(function (dateValue) { 
		   dataStr.push(parseInt(dateValue,16));	
		});	
		var monthVal = dataStr[1].toString();	
		var dateVal  = dataStr[0].toString();	
		if(monthVal.length == 1) {
			monthVal = "0" + monthVal;
		} 
		if(dateVal.length == 1) {
			dateVal = "0" + dateVal;
		} 
		return dataStr[2] +"" + dataStr[3] + "-" + monthVal + "-" + dateVal;      
}

/*
 Function Name : getControllerTimeValue
 Description   : This function used convert hexdecimal to decimal for time.
 Params        : TimeHexValue
 Created on    : 21-03-2018
 Updated on    :
 Created by    : iExemplar Software India Pvt Ltd.
*/

exports.getControllerTimeValue = function (TimeHexValue) {    
		
		dataStr = [];
		TimeHexValue.split(" ").map(function (TimeValue) { 
		   dataStr.push(parseInt(TimeValue,16));	
		});	

		var hour    = dataStr[0].toString();
		var minutes = dataStr[1].toString();
		var seconds = dataStr[2].toString();
		
		if (hour.length == 1) {
			hour = "0" + hour;
		}

		if (minutes.length == 1) {
			minutes = "0" + minutes;
		}

		if(seconds == "60") {
			seconds = "00";
		} 

		if (seconds.length == 1) {
			seconds = "0" + seconds;
		}

		return hour + ":" + minutes  + ":" + seconds;   
}

/*
 Function Name : getPayloadValue
 Description   : This function used convert hexdecimal to decimal for payload values.
 Params        : payloadValue
 Created on    : 22-03-2018
 Updated on    :
 Created by    : iExemplar Software India Pvt Ltd.
*/

exports.getPayloadValue = function (payloadType, payloadValue, payloadErr) {
    
    var controllerField = "";
    var errorKey = "";
    if (payloadType == "01" || payloadType == "1") {
    	controllerField = controllerParam.productionField;
    	errorKey = "ERR_PROD_SENS";
    } else if(payloadType == "02" || payloadType == "2") {
    	controllerField = controllerParam.electricalField;
    	errorKey = "ERR_ELEC";
    } else if(payloadType == "03" || payloadType == "3") {
    	controllerField = controllerParam.harmonicsField;
    	errorKey = "ERR_HARM";
    }	
	var bytevalue = "";
	var payloadValueStr = payloadValue.split(' ').join('');
	var payloadDecimal  = [];
	var key = "";	
	asyncLoop(controllerField, function (item, next)
	{
			var responseStr     = [];
			bytevalue = item.value.values*2; 
	   	key =  item.value.key;
	   	var paramKey =item.key;
	    var hexValue = payloadValueStr.slice(0,bytevalue);
	    var payloadStrTemp = payloadValueStr.substring(bytevalue);
	    payloadValueStr = payloadStrTemp;
	    if(hexValue.length > 0 ) {
	    	var demicalValue = exports.convertHexToDecimal(hexValue);
	    } else {
	    	var demicalValue = 0;
	    }	    
	    responseStr[0]  = key;
	    responseStr[1] = demicalValue;	   
	    payloadDecimal.push({"key" :paramKey ,"values" :[demicalValue]});	    
	    next();
	}, function (){  });
	payloadDecimal.push({"key" : errorKey ,"values" :payloadErr});
  return payloadDecimal;
}

/*
 Function Name : getPayloadErrorValue
 Description   : This function used convert hexdecimal to decimal for error values.
 Params        : payloadErrorValue
 Created on    : 26-03-2018
 Updated on    :
 Created by    : iExemplar Software India Pvt Ltd.
*/

exports.getPayloadErrorValue = function (payloadErrorValue) {
  dataStr = [];
	payloadErrorValue.split(" ").map(function (errorValue) { 
		dataStr.push(parseInt(errorValue,16).toString());	
	});	
	return dataStr;
}

/*
 Function Name : formatPVValue
 Description   : This function used convert decimal to hexdecimal.
 Params        : bytes
 Created on    : 09-04-2018
 Updated on    :
 Created by    : iExemplar Software India Pvt Ltd.
*/
exports.formatPVValue = function(bytes) {
  var hexString;
  var hexvalue;
  var randNumber = 0;
  for(i=0;i<bytes;i++) {
	var options = {
		min: 15,
		max: 250, 
		integer: true
	} 
	randNumber =  rn(options).toString(16);
	if (i==0) {
		hexString=randNumber+ " ";
	} else {
		hexString+=randNumber+ " ";
	}
   }
	return hexString;
}; 

var net = require('net');
var controllerParam = require('../util/controllerparameter');
var dataconver = require('../util/dataconversion');

var asyncLoop = require('node-async-loop');
var port = 8090; //The same port that the server is listening on 
var host = '192.168.2.95';
//var host = '52.26.47.5';

var date = new Date();

var currentDay = date.getDate().toString(16);
var currentMonth = (date.getMonth()+1).toString(16);
var currentYear = date.getFullYear().toString();
var currentYear1 = currentYear.substring(0,2);
currentYear1 = currentYear1.toString(16);
var currentYear2 = currentYear.substring(2,4);
currentYear2 = currentYear2.toString(16);

var current_hour = date.getHours().toString(16);
var current_minute = date.getMinutes().toString(16);
var current_sec = date.getSeconds().toString(16);

var time = current_hour + " " + current_minute + " " + "00";
var cdate = currentDay + " " + currentMonth + " " + '14' + " " + '12';
var current_minute_end = (date.getMinutes()+1).toString(16);
var timeEnd = current_hour + " " + current_minute_end + " " + "00";

controllerField = controllerParam.productionField;
var responseStr="";
asyncLoop(controllerField, function (item, next)
  {
    
      bytevalue = item.value.values;  
      var hexValue = dataconver.formatPVValue(bytevalue);    
      responseStr+=hexValue;    
      next();
  }, function (){ });

var client = new net.Socket();
 
client.connect(port, host, function() {
  console.log('Client connected to: ' + host + ':' + port);
  //var payloadStr = '{"FC" : "TEST TCP SERVER"}';
  //var payloadStr ='{"MA":"1E C0 36 ED 89 55 AA","PT":"03","NB":"02 C8","PV":"00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ","SN":"01","SD":"15 02 7E2","ST":"07 00 00","ED":"15 02 7E2","ET":"0f 00 00", "ER" : "00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F"}';
  //var payloadStr ='{"MA":"1E C0 36 ED 89 55 AA","PT":"01","NB":"02 C8","PV":"'+responseStr+'","SN":"01","SD":"'+cdate+'","ST":"'+time+'","ED":"'+cdate+'","ET":"'+timeEnd+'", "ER" : "00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F"}';
    var payloadStr ='{"MA":"45504D53434F4E543030330A0A0A","PT":"01","NB":"02 C8","PV":"'+responseStr+'","SN":"01","SD":"'+cdate+'","ST":"'+time+'","ED":"'+cdate+'","ET":"'+timeEnd+'", "ER" : "00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F"}';
  // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
  client.write(payloadStr);
});
 
client.on('data', function(data) {    
  console.log('Client received: ' + data);
  if (data.toString().endsWith('exit')) {
    client.destroy();
  }
});
 
// Add a 'close' event handler for the client socket
client.on('close', function() {
  console.log('Client closed');
});
 
client.on('error', function(err) {
  console.error(err);
});


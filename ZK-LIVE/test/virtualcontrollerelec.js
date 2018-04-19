var net = require('net');
var port = 8090; //The same port that the server is listening on 
//var host = '192.168.2.101';
var host = '52.26.47.5';

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

var time = current_hour + " " + current_minute + " " + current_sec;
var date = currentDay + " " + currentMonth + " " + '14' + " " + '12';
var current_minute_end = (date.getMinutes()+1).toString(16);
var timeEnd = current_hour + " " + current_minute_end + " " + current_sec;
 
var client = new net.Socket();
 
client.connect(port, host, function() {
  console.log('Client connected to: ' + host + ':' + port);
   //var payloadStr = '{"FC" : "TEST TCP SERVER"}';
  //var payloadStr ='{"MA":"1E C0 36 ED 89 55 AA","PT":"03","NB":"02 C8","PV":"00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ","SN":"01","SD":"15 02 7E2","ST":"07 00 00","ED":"15 02 7E2","ET":"0f 00 00", "ER" : "00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F"}';
   var payloadStr ='{"MA":"1E C0 36 ED 89 55 AA","PT":"02","NB":"02 C8","PV":"1F 1F 1F 1E C0 36 ED 89 55 AA 02 55 01 D8 1E 1F 1F 1F 1F 1F 1F 1F 3F 3F 3F 3F 3F 3F 3F 3F 3F 3F 3F 3F 3F 1F 3F 3F 3F 3F 3F 3F 3F 3F 3F 3F 3F 3F 3F 80 3F 1F 3F 80 80 1F 3F 80 80 80 3F 80 80 80 1F 3F 1F 80 1F 80 1F 3F 1F 80 1F 3F 1F 1F 3D 8D 43 DB F5 DB 43 DA EE 0C 43 DC D4 BF 43 D9 2E 2D 43 7D 07 9D 43 7A F7 EB 43 7E 8A FE 43 7E 1F 80 3F 1F 1F 1F 1F 3F 1F 1F 3F 1F 1F 1F 3F 1F 35 6A 42 48 40 51 3F 15 9A D5 3F 15 3B 59 3A 40 BF 0B BC 0A 1F 1F 3F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 65 1D 3F 7F DF 34 3A 66 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 99 84 3F C4 36 EA 3F BB 08 B7 3F B3 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F B2 13 44 BB 1F 1F 1F 1F 2D 32 43 70 32 D2 42 EF 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 26 D7 3F 9D C1 02 BF 2E 8C 47 BF 0B 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F FC B2 43 DC 59 D4 41 20 A0 1A 43 8D 51 7C 41 5F CE 25 41 88 4B ED 3C F6 48 25 42 71 9C 0E 42 31 38 B4 45 89 76 C4 3C E6 23 E7 C4 5F C1 9E BC 7B 3A 88 45 89 8D FC 3E 3E BE 77 3F 7F 2E 2A 3D 94 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1F 1E FB 1F 1F 1F 1D 1F 1F E2 7C","SN":"01","SD":"'+date+'","ST":"'+time+'","ED":"'+date+'","ET":"'+timeEnd+'", "ER" : "00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F"}';
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
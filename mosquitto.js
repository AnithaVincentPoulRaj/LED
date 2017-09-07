var mosca = require('mosca')
var SECURE_KEY = __dirname + '/m2mqtt_srv.key';
var SECURE_CERT = __dirname + '/m2mqtt_srv.crt';

var settings = {
  secure : {
      port: 8883,
      keyPath: SECURE_KEY,
      certPath: SECURE_CERT,
      json: true,
      rejectUnauthorized: false
    }
}

var sendpacket = {
  topic: 'api/v1/user/register',
  payload: 'Hi welcome to mass',
  qos : 0,
  retain : false
};


var server = new mosca.Server(settings);
server.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});

server.on('clientDisconnected', function(client) {
    console.log('client disconnected', client.id);
});
// fired when a message is received

/*
server.on('published', function(packet, client) {
  console.log('Overall Packets', packet);
  console.log('Payload', packet.payload);
  console.log('Message Id',packet.messageId);
  console.log('Topic',packet.topic);
  var textChunk = packet.payload.toString('utf8');
  console.log('final converted payload'+textChunk);
  // server.subscribe(packet.topic, sendpacket);
  // server.publish(packet, client);
}); 
*/

// server.publish(sendpacket, function() {
//  console.log('Message Sent');
// });

/*
server.on('publish', function(packet, client, callback) {
  console.log('new publish called');
});
*/

/*
server.on('subscribed', function(topic, client) {
  console.log('subscribed');
  console.log(topic);
  server.publish(sendpacket, client);
});
*/
server.on('ready', setup);

var dbconnection = require('./config/dbconfig')

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running')
  var moscoClient = require('./clients.js')
}
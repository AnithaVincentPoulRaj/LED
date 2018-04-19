require('dotenv').load();
var net         = require('net');
var isJSON      = require('is-json');
var restAPI = require('./zkapp');
var configLogPrcTime = require('./util/configlogprtime');
var fieldValidation  = require('./util/fieldvalidation');
var constant         = require('./config/constant');
var message          = require('./config/message');
var dataProcess  = require('./dataprocess');
var zk = require('./zkclient');
var mqttClient  = require('./mqttclient');
var zkcontroller = require('./controller/zkcontroller');
var logger       = configLogPrcTime.getLogger('epms');
var inboundPort  = process.env.TCP_INBOUND_PORT;
const NodeCache  = require("node-cache");
global.inboundCache = new NodeCache();
dataProcess.getControllerDetails();
dataProcess.getTypeCollectionDetails();

var tcpServer = net.createServer(function(sock) {  
    
  var start  = configLogPrcTime.getProcessingTime(); 
  var buffer      = "";     
  var responseStr = "";
  
  // Add a 'data' event handler to this instance of socket
  sock.on('data', function(data) {
    try {
      sock.setTimeout(constant.TCP_TIMEOUT);
      buffer += data.toString('utf8');         
      logger.info('FROM HUB: ' + data.toString());
      if (buffer.indexOf('}') !== -1) {

        if (isJSON(buffer)) {
          var obj = JSON.parse(buffer);

          var isValidMacAddress   = fieldValidation.isHexaDecimal(obj.MA);
          var isValidPayloadValue = fieldValidation.isHexaDecimal(obj.PV);    
          var isValidnoOfBytes    = fieldValidation.isHexaDecimal(obj.NB);         
          var isValidshiftNumber  = fieldValidation.isHexaDecimal(obj.SN);
          var isValidstartDate    = fieldValidation.isHexaDecimal(obj.SD);
          var isValidstartTime    = fieldValidation.isHexaDecimal(obj.ST);
          var isValidendDate      = fieldValidation.isHexaDecimal(obj.ED);
          var isValidendTime      = fieldValidation.isHexaDecimal(obj.ET);
          var isValidpayloadError = fieldValidation.isHexaDecimal(obj.ER);
          var isValidPayloadType  = fieldValidation.isPayloadTypeValid(obj.PT.toString());
          //Payload Validation
          if (isValidMacAddress   == true && isValidPayloadValue == true &&
              isValidnoOfBytes    == true && isValidshiftNumber  == true &&
              isValidstartDate    == true && isValidstartTime    == true &&
              isValidendDate      == true && isValidendTime      == true &&
              isValidpayloadError == true && isValidPayloadType  == true ) {
              //dataProcess.dataProcessSendMqtt(obj);  // Hide MQTT Team 16/04/18
                zkcontroller.controllerDataProcessing(obj);
              responseStr = message.PAYLOAD_SUCCESS;
          } else {
              responseStr = message.PAYLOAD_INVALID;
          }            
          sock.write(responseStr);
          logger.info('TO HUB:' + responseStr);            
          sock.destroy();
        } else {
          responseStr = message.PAYLOAD_INVALID;
          sock.write(responseStr);
          logger.info('TO HUB:' + responseStr);            
          sock.destroy();
        }
      }
    } catch (err) {
      responseStr = message.PAYLOAD_UNABLE_PROCESS; 
      sock.write(responseStr);
      logger.error(err);
      sock.destroy();
    }
  });
  // Add a 'close' event handler to this instance of socket
  sock.on('close', function(data) {
    logger.info('CLOSED: RemoteAddress:' + sock.remoteAddress +' RemotePort:'+ sock.remotePort);
    data    = '';
    buffer  = '';
  });
  //Add a 'error' event handlet for client socket
  sock.on('error', function(exception) {
    logger.error(exception);
  });
  sock.on('end', function () {
    data   = '';
    buffer = '';
  });
  sock.on('timeout', () => {
    sock.write(message.SOCKET_TIMEOUT);
    logger.error(message.SOCKET_TIMEOUT);
    sock.end();
  });
  var end = configLogPrcTime.getProcessingTime(start);
  logger.info('Server Process Time : ' + end + ' ms'); 
});

tcpServer.listen(inboundPort);
logger.info('InboundServer listening on port :: ' + inboundPort);

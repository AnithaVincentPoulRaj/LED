/**************************** Mobile App to MQTT Broker API *************************************************/

// Subscribed And Publish Topic For User Registeration and their Response
// USE
exports.USER_CREATION = 'user/register';  
exports.USER_CREATION_STATUS = 'user/register/status/';

// Publish Topic For Controller Status
exports.USER_CONTROLLER_CURRENT_STATUS = 'user/controller/status/';

// Subscribed Topic For Get Current Water Flow Status
exports.CONTROLLER_CURRENT_STATUS = 'user/controller/currentstatus/';

/**************************** Controller to MQTT Broker API *************************************************/
// Subscribed And Publish Topic For Main Controller Registeration
exports.CONTROLLER_CREATION = 'controller/register'; // USE
exports.CONTROLLER_CREATION_STATUS = 'controller/register/status/';

// USE
//Subscribed Topic For Status
exports.CONTROLLER_STATUS_LEVEL = 'controller/status';

//Publish Topic For Logical Gate
exports.CONTROLLER_UPDATE_STATUS = 'controller/device/status/';

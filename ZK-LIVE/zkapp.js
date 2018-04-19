var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//Routing files
var apiRoutes = require('./route/api');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Routes
app.use(apiRoutes);

// serever creation
// Binding express app to port 9090
app.listen(process.env.REST_PORT, function(){
 commonLoggerSetup('API SERVER RUNNING',LOGINFO);
});

module.exports = app;

var express = require('express');
var router  = express.Router();
var constant = require('../config/constant');
var apicontroller = require('../controller/apicontroller');

router.use(function(req, res, next) {
  res.header('Content-Type', 'application/json');
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers","*");
  next();
});

router.get(constant.API_TYPE_COLLECTION,apicontroller.getTypeCollection);
module.exports = router;

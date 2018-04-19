var configLogPrcTime = require('../util/configlogprtime');
var logger = configLogPrcTime.getLogger('epms');

exports.splitString = function(stringToSplit, separator) {
	var arrayOfStrings = stringToSplit.split(separator);
	return arrayOfStrings;
};

global.commonLoggerSetup = function(strMessage, type) {
  if (type == 'info') {
    logger.info(strMessage);
  } else if (type == 'error') {
    logger.error(strMessage)
  }
  console.log(strMessage);
};
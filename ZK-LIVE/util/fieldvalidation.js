/*
 Function Name : isHexaDecimal
 Description   : This function used validate given string is hexdecimal or not.
 Params        : payloadValue
 Created on    : 22-03-2018
 Updated on    :
 Created by    : iExemplar Software India Pvt Ltd.
*/

exports.isHexaDecimal =function (payloadValue)
{
    var payloadValueHex = payloadValue.split(" ").join("");
	regexp = /^[0-9a-fA-F]+$/;  
	if (regexp.test(payloadValueHex)) {
	    return true;
	}
	else {
	    return false;
	}
}

/*
 Function Name : isPayloadTypeValid
 Description   : This function used validate given payloadtype value is valid or not.
 Params        : payloadTypeValue
 Created on    : 22-03-2018
 Updated on    :
 Created by    : iExemplar Software India Pvt Ltd.
*/

exports.isPayloadTypeValid =function (payloadTypeValue)
{
    
    if(payloadTypeValue == "01" || payloadTypeValue == "02" || 
       payloadTypeValue == "03" || payloadTypeValue == "1"  ||
       payloadTypeValue == "2"  || payloadTypeValue == "3") {
    		return true;
    } else {
    		return false;
    }
}


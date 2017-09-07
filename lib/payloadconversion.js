var path     = require('path')
var express = require('express')
var string  = require('string')
var Int64   = require('node-int64')
var Long    = require('long');
ProtoBuf    = require('protobufjs')
var constant = require('../config/constant');
var publicFolderName = '/../proto'

exports.dataEncode = function(data,protoFileName,buildName,conversionFormat) {

    var fileName = protoFileName+".proto";
    protoBuilder = ProtoBuf.loadProtoFile(
        path.join(__dirname,
            publicFolderName,
            fileName)
    );

   var build        = protoBuilder.build(buildName);
   var encodedData  = build.encode(data);
    if(constant.toHexString == conversionFormat ){

        var hexString=encodedData.toHex();
        finalData = this.dataToHex(hexString)+":";

    } else if(constant.TOHex == conversionFormat){

        finalData = encodedData.toHex().toString();

    } else if(constant.toDecimal == conversionFormat){

        finalData = this.dataToDecimal(encodedData.toHex());
    }
   return finalData;
}
exports.decodePayloadData = function(data,protoFileName,buildName) {
    try {
        var fileName = protoFileName + ".proto";
        protoBuilder = ProtoBuf.loadProtoFile(
            path.join(__dirname,
                publicFolderName,
                fileName)
        );
        var build = protoBuilder.build(buildName);
        var inputData =string(data.toString()).replaceAll(/'/g,"");
        var buffervalue=  new Buffer(inputData.orig, "hex")
        var decodedData = build.decode(buffervalue);
        return decodedData;
    }   catch (exception){

        console.log(exception)
    }

}
exports.dataToHex=function(data) {

    if(data.length == 2) {
        var val = data;
        return [val];
    } else if(data.length > 2) {
        return data.substr(0, 2)+":"+(this.dataToHex(data.substr(2)));
    }
}
exports.dataToDecimal=function(data) {

    if(data.length == 2) {
        var val =  new Int64(data).toString(10);
        return val;
    } else if(data.length > 2) {
        return dataToDecimal(data.substr(0, 2))+(this.dataToDecimal(data.substr(2)));
    }
}


exports.decimalToHex=function (d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

}
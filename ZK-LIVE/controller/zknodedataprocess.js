var json = require('JSON');
var Promise = require('bluebird');
var dateFormat = require('dateformat');
var PromiseAll = require('promises-all');
var asyncLoop = require('node-async-loop');
const zookeeper = require('node-zookeeper-client-async');

/*
 Function Name : createControllerNode
 Description   : 
 Created on    : 
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
exports.createControllerNode = function (client, respData) {
	asyncLoop(respData, function (item, next) {
		var zkorg = nodePrefix+'/'+item.organizationId;
		var zkdept = zkorg+'/'+item.departmentId;
		var zksys = zkdept+'/'+item.systemId;
		var zkcontroller = zksys+'/'+item.id;
		var zkconunique = zkcontroller+'/'+item.uniqueCode;
		var zkraw = zkconunique+'/'+'raw';
		var zkmin = zkconunique+'/'+'minute';
		var zkhour = zkconunique+'/'+'hour';
		var zkday = zkconunique+'/'+'day';
		PromiseAll.all([checknode(client,zkorg,'org'),checknode(client,zkdept,'dept'),
			checknode(client,zksys,'sys'),checknode(client,zkcontroller,'controller'),
			checknode(client,zkconunique,'macunique'),checknode(client,zkraw,'raw'),
			checknode(client,zkmin,'min'),checknode(client,zkhour,'hour'),
			checknode(client,zkday,'day')]).then(function(response) {
				var nodeclient = client.transaction();
				if (response.resolve.length >= 0) {
					var arrData = response.resolve;
					for (var index= 0; index < arrData.length; index++) {
						switch (arrData[index]) {
							case "org NotPresent":
							nodeclient.create(zkorg);
							break;
							case "dept NotPresent":
							nodeclient.create(zkdept);
							break;
							case "sys NotPresent":
							nodeclient.create(zksys);
							break; 
							case "controller NotPresent":
							nodeclient.create(zkcontroller);
							break; 
							case "macunique NotPresent":
							nodeclient.create(zkconunique);
							break; 
							case "raw NotPresent":
							nodeclient.create(zkraw);
							break;
							case "min NotPresent":
							nodeclient.create(zkmin);
							break; 
							case "hour NotPresent":
							nodeclient.create(zkhour);
							break;
							case "day NotPresent":
							nodeclient.create(zkday);
							break;                               
							default: 
							break;
						}
					}
               nodeclient.
               commit(function (error, results) {
               	if (error) {
               		commonLoggerSetup('FAILED TO EXCUTE BULK NODE TRANSACTION \n',LOGERROR);
               		return;
               	}
               	console.log('Transaction completed.');
               	commonLoggerSetup('SUCCESS TO EXCUTE BULK NODE TRANSACTION \n',LOGINFO);
               	nodeclient = '';
               	next();
               });
           } else {
           		commonLoggerSetup('ERROR TO EXCUTE BULK NODE TRANSACTION PROMISE \n',LOGERROR);
           }
        }, function(error) {
        	commonLoggerSetup('ERROR TO EXCUTE BULK NODE TRANSACTION PROMISE \n',LOGERROR);
        });
		});
}

/*
 Function Name : checknode
 Description   : 
 Created on    : 
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
function checknode(client,path,type) {
	return new Promise(function(resolve, reject) {
		client.exists(path, function (error, stat) {
			if (error) {
				commonLoggerSetup('CHECK NODE ERROR \n',LOGERROR);
				return reject('Org Error');
        } 
        if (stat) {
            return resolve(type+' Present');
        } else {
            return resolve(type+' NotPresent');
        }
    });
	}); 
}

/*
 Function Name : createTypeCollectionNode
 Description   : 
 Created on    : 
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
exports.createTypeCollectionNode = function (path,data,type) {
	var nodeclient = zkclient.transaction();
	if (type == 'YES') {
		nodeclient.remove(path, -1);
	}
	nodeclient.create(path, new Buffer(data));
	nodeclient.commit(function (error, results) {
		if (error) {
			commonLoggerSetup('ERROR DURING TYPECOLLETION NODE CREATE \n',LOGERROR);
			return;
		}
		commonLoggerSetup('SUCC TO CREATE TYPECOLLETION NODE \n',LOGINFO);
		nodeclient = '';
	});
};

/*
 Function Name : addRawData
 Description   : 
 Created on    : 
 Updated on    :
 Team          : MQTT Team 
 Created by    : iExemplar Software India Pvt Ltd.
 */
exports.addRawData = function (client, path, pdata) {  
    var jsonArray=[];
    client.getData(path, function (event) {}, 
       function (error, data, stat) {       
        if(data != undefined) {
           jsonArray = JSON.parse(data.toString());                   
       }
       jsonArray.push(pdata); 
       var buf = Buffer.from(JSON.stringify(jsonArray));
       client.setData(path, buf, function (error, stats) {           
        	commonLoggerSetup('DATA ADDED \n',LOGINFO);
    });

   });
};

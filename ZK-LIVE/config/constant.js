exports.TOHex    = "hex";
exports.TOBuffer = "buffer";
exports.toByte      = "byte";
exports.toHexString = "hexString";
exports.toDecimal = "decimal";
exports.LIVE      = "live";
exports.UNIQUE_CODE    = "uniqueCode";
exports.LIVE_CTRL_DATA = "liveCtrlData";
exports.DEPT_TYPE   = "department";
exports.DEPT_STRING = "DeptId";
exports.UNIT_TYPE   = "unit";
exports.UNIT_STRING = "OrgId";

/* Payload Type */
exports.PAYLOAD_TYPE_PROD = "01";
exports.PAYLOAD_TYPE_ELEC = "02";
exports.PAYLOAD_TYPE_HARM = "03";

/* TCP Timeout */
exports.TCP_TIMEOUT = 3000;
/* messages*/
exports.KEY_NOT_FOUND = "KEY NOT FOUND";

/*keys*/
exports.ORGANIZATIONID = "organizationId";
exports.PROD_14 = "PROD_14";
exports.PROD_17 = "PROD_17";
exports.PROD_18 = "PROD_18";
exports.PROD_19 = "PROD_19";
exports.UKG        = "ukg";
exports.PRODUCTION = "production";
exports.EFFICIENCY = "efficiency";
exports.ENERGY     = "energy";

/*values*/
exports.AVAILABLE = "AVAILABLE";

/*MTier */
exports.SERVER_API_ROOT  = "http://ec2-52-26-47-5.us-west-2.compute.amazonaws.com:8080";
exports.API_CTRL_LIST  = "/api/v1/metadata/controller?offset=0&limit=10000";
exports.API_TYPE_COLLECTION  = "/api/v1/typeCollection";
exports.SERVER_AUTH = "Basic aXhtdGV4YXBpdjAuMTppeG10ZXhhcGkyMDE3";

/*ZooKeeper*/
exports.ZK_SERVER_ROOT = "ec2-52-26-47-5.us-west-2.compute.amazonaws.com:2181";

/*Logger*/
global.LOGINFO = "info";
global.LOGERROR = "error";

/*Payload Types*/
exports.MINUTE_PROD_SENS = "MINUTE_PROD_SENS";
exports.MINUTE_HARM      = "MINUTE_HARM";
exports.MINUTE_ELEC      = "MINUTE_ELEC";

/* identifier */
exports.MINUTES     = "MINUTES";
exports.HOUR        = "HOUR";
exports.SHIFT       = "SHIFT";
exports.AGGREGATE_UNIT   = "AGGREGATE_UNIT";
exports.AGGREGATE_DEPT   = "AGGREGATE_DEPT";
exports.AGGREGATE_UNIT_SHIFT   = "AGGREGATE_UNIT_SHIFT";
exports.AGGREGATE_DEPT_SHIFT   = "AGGREGATE_DEPT_SHIFT";

/* origin  */
exports.CONTROLLER = "CONTROLLER";
exports.TCP        = "TCP";

/* Cache TTL */
exports.CACHE_TTL = 86400;
exports.CURRENT_SHIFT_CACHE_TTL = 32400; // 9 hours

/*Aggregate Type*/
exports.AGGREGATE_TYPE_HOUR  = "HOUR";
exports.AGGREGATE_TYPE_SHIFT = "CURRENT_SHIFT";

/*Type*/
exports.MINUTE_PROD_SENS = "MINUTE_PROD_SENS";
exports.HOUR_PROD_SENS = "HOUR_PROD_SENS";



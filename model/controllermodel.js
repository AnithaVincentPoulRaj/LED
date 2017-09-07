var createControllerSql  = "INSERT INTO product SET ? ";
exports.SET_CONTROLLER_SQL = createControllerSql; //USE

//USE  18/07/17
exports.GET_MAIN_CONTROLLER_ID = "SELECT PRODUCT_ID as productId, USER_ID as userId FROM product WHERE 	PRODUCT_MAC = ? AND ACTIVE = 1";

//USE 18/07/17
exports.UPDATE_USER_CONTROLLER_DETAILS = "UPDATE product SET STATUS = ? WHERE PRODUCT_MAC = ?";

//USE 19/07/17

exports.GET_MAIN_CONTROLLER_LEAK_STATUS = "SELECT PRODUCT_ID as productId, STATUS as status, PRODUCT_MAC as macAddress FROM product WHERE USER_ID = ? AND ACTIVE = 1";
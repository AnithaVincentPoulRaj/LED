from flask import jsonify  #! Not Need
from model import SQLConnection
class UserModel:
    def checkMobileNumberExist(reqData):
        print(reqData)
        # Need to put try and catch here
        sqlObj = SQLConnection.getConnection()
        try:
            print(sqlObj)
            getUserRec = sqlObj.execute("SELECT * FROM USER WHERE MOBILENUMBER = %s",[reqData['mobileNumber']])
            data = sqlObj.fetchone()
            print(data)
            sqlObj.close()
        except Exception as exception:
            print(str(exception))
            sqlObj.close()
            return 'nil'

        if getUserRec > 0:
            print('rec dhr')
            print(data['USERID'])
            return data
        else:
            print('No Rec')
            return getUserRec

    def insertUserDetails(reqData):
        print('Going to insert the user details')
        print(reqData)
        sqlObj = SQLConnection.getConnection()
        try:
            print('check')
            insertSQL = sqlObj.execute(
                """INSERT INTO USER(USERNAME,MOBILENUMBER,DEVICETYPE,DEVICETOKEN,MACADDRESS) VALUES (%s,%s,%s,%s,%s)""",
                (reqData['userName'], reqData['mobileNumber'], reqData['deviceType'], reqData['deviceToken'],
                 reqData['macAddress']))
        except Exception as exception:
            print(str(exception))
            sqlObj.close()
            return 'nil'
        SQLConnection.mysql.connection.commit()
        print(insertSQL)
        print('******************************')
        print(sqlObj.lastrowid)
        sqlObj.close()
        return sqlObj.lastrowid

    #Date: !9/02/18
    def updateUserDetails(reqData,userID):
        print('Update user details called')
        sqlObj = SQLConnection.getConnection()
        try:
            updateSQL = sqlObj.execute(
                """UPDATE USER SET DEVICETYPE=%s, DEVICETOKEN=%s, MACADDRESS=%s, ACTIVE=%s WHERE USERID=%s""",(reqData['deviceType'], reqData['deviceToken'], reqData['macAddress'],'1',userID))
        except Exception as exception:
            print(str(exception))
            sqlObj.close()
            return 'nil'
        SQLConnection.mysql.connection.commit()
        print(updateSQL)
        sqlObj.close()
        return updateSQL

    #Date: 20/02/18
    def checkActiveStatus(userID):
        print(userID)
        # Need to put try and catch here
        sqlObj = SQLConnection.getConnection()
        try:
            print(sqlObj)
            usrID = int(userID)
            print(usrID)
           # getUserRec = sqlObj.execute("SELECT * FROM useraccount WHERE USERID = %d",int(userID))
            # cursor.execute("""select test_id from test_logs where id = %s """, (id,))
            getUserRec = sqlObj.execute("""SELECT * from USER WHERE USERID = %s """, [usrID])
            print(getUserRec)
            data = sqlObj.fetchone()
            print(data)
            sqlObj.close()
        except Exception as exception:
            print(str(exception))
            sqlObj.close()
            return 'nil'

        if getUserRec > 0:
            print('rec dhr')
            print(data['USERID'])
            return data
        else:
            print('No Rec')
            return getUserRec

        # Date: !9/02/18

    def updateUserSession(userID):
        print('Update user session called')
        sqlObj = SQLConnection.getConnection()
        try:
            updateSQL = sqlObj.execute(
                """UPDATE USER SET ACTIVE=%s, VERIFYSTATUS=%s WHERE USERID=%s""",('0','0', userID))
        except Exception as exception:
            print(str(exception))
            sqlObj.close()
            return 'nil'
        SQLConnection.mysql.connection.commit()
        print(updateSQL)
        sqlObj.close()
        return updateSQL

    def updateUserVerifiedSession(userID):
        print('Update user verified session called')
        sqlObj = SQLConnection.getConnection()
        try:
            updateSQL = sqlObj.execute(
                """UPDATE USER SET ACTIVE=%s, VERIFYSTATUS=%s WHERE USERID=%s""",('1','1', userID))
        except Exception as exception:
            print(str(exception))
            sqlObj.close()
            return 'nil'
        SQLConnection.mysql.connection.commit()
        print(updateSQL)
        sqlObj.close()
        return updateSQL
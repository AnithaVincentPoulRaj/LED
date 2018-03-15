from model import SQLConnection
class ContactModel:
    def insertcontactDetails(mobilenum,name,userid):
        print('Going to insert the contact details')
        print(mobilenum,name,userid)
        sqlObj = SQLConnection.getConnection()
        try:
            print('check')
            insertSQL = sqlObj.execute(
                """INSERT INTO CONTACTINFO(MOBILENUMBER,USERNAME, USERID) VALUES (%s,%s,%s)""",
                (mobilenum,name,userid))
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

    #09/03/18
    def checkMobileNumberExist(reqData):
        print(reqData)
        # Need to put try and catch here
        sqlObj = SQLConnection.getConnection()
        try:
            print(sqlObj)
            #getUserRec = sqlObj.execute("""SELECT CID FROM CONTACTINFO WHERE MOBILENUMBER = %s""",[reqData])
            getUserRec = sqlObj.execute("""SELECT  info.CID as cid, info.USERID as userid from CONTACTINFO AS info WHERE info.MOBILENUMBER = %s""", [reqData])
            data = sqlObj.fetchone()
            print(data)
            sqlObj.close()
        except Exception as exception:
            print(str(exception))
            sqlObj.close()
            return 'nil'
        if getUserRec > 0:
            print('rec dhr')
            return data
        else:
            print('No Rec')
            return getUserRec


    def insertmasterdetails(userid,cid,ownerid):
        print('Going to insert the master details')
        print(userid,cid)
        sqlObj = SQLConnection.getConnection()
        try:
            print('check')
            insertSQL = sqlObj.execute("""INSERT IGNORE INTO contactmaster(USERID,CID,OWNERID) VALUES (%s,%s,%s)""",(userid, cid, ownerid))
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
    #SELECT i.CID, i.USERNAME, i.MOBILENUMBER, m.USERID, m.CID FROM contactinfo as i
    # join contactmaster as m where i.CID = m.CID AND m.USERID = '1'

    def getContactLists(userid):
        sqlObj = SQLConnection.getConnection()
        try:
            print(sqlObj)
            uid = int(userid)
            print('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
            print(uid)
            getlist = sqlObj.execute("""SELECT mas.CMID as mID, info.CID as contactID, info.USERNAME as userName, 
                        IFNULL(info.DOB, '') as birthDate, info.MOBILENUMBER as mobileNumber, 
                        IF(mas.ACTIVE = '1', IFNULL(info.ADDRESS,''), '') AS address,
                        IFNULL(info.IMAGE,'') AS image, IFNULL(info.GENDER, '') as gender, 
                        IF(mas.ACTIVE = '1', IFNULL(info.LATITUDE,''), '') AS latitude, 
                        IF(mas.ACTIVE = '1', IFNULL(info.LONGITUDE,''), '') AS longitude, 
                        mas.Active as status, mas.OWNERID as uniqueID, 
                        if(info.USERID >0, '1', '0') as appStatus FROM CONTACTINFO as info 
                        JOIN CONTACTMASTER as mas WHERE info.CID = mas.CID AND mas.USERID = %s """,[uid])
            data = sqlObj.fetchall()
            print(data)
            sqlObj.close()
        except Exception as exception:
            print(str(exception))
            sqlObj.close()
            return 'nil'
        if getlist > 0:
            print('rec dhr***********')
            return data
        else:
            print('No Rec***********')
            return getlist

        # Date: !9/02/18


    def updateInfoDetails(cid, userid):
        print('Update user id called')
        sqlObj = SQLConnection.getConnection()
        try:
            updateSQL = sqlObj.execute(
                """UPDATE CONTACTINFO SET USERID=%s WHERE CID=%s""", (userid, cid))
        except Exception as exception:
            print(str(exception))
            sqlObj.close()
            return 'nil'
        SQLConnection.mysql.connection.commit()
        print(updateSQL)
        sqlObj.close()
        return updateSQL

    def updateInfoMasterDetails(ownerid,cid):
        print('Update contact id called')
        sqlObj = SQLConnection.getConnection()
        try:
            updateSQL = sqlObj.execute(
                """UPDATE CONTACTMASTER SET OWNERID=%s WHERE CID=%s""", (ownerid, cid))
        except Exception as exception:
            print(str(exception))
            sqlObj.close()
            return 'nil'
        SQLConnection.mysql.connection.commit()
        print(updateSQL)
        sqlObj.close()
        return updateSQL

        # 09/03/18
    def checkcontactuserexist(contactid):
        print(contactid)
        cid = int(contactid)
        # Need to put try and catch here
        sqlObj = SQLConnection.getConnection()
        try:
            print(sqlObj)
            # getUserRec = sqlObj.execute("""SELECT CID FROM CONTACTINFO WHERE MOBILENUMBER = %s""",[reqData])
            getUserRec = sqlObj.execute("""SELECT info.CID as cid,info.USERID as userid,info.USERNAME as name, usr.DEVICETOKEN as token FROM CONTACTINFO as info 
                         JOIN USER as usr WHERE info.USERID = usr.USERID AND info.CID = '%s' AND usr.VERIFYSTATUS = '1'""",[cid])
            data = sqlObj.fetchone()
            print(data)
            sqlObj.close()
        except Exception as exception:
            print(str(exception))
            sqlObj.close()
            return 'nil'
        if getUserRec > 0:
            print('rec dhr')
            return data
        else:
            print('No Rec')
            return getUserRec

    #SELECT info.CID,info.USERID,info.USERNAME, usr.DEVICETOKEN FROM CONTACTINFO as info JOIN USER as usr WHERE info.USERID = usr.USERID AND usr.VERIFYSTATUS = '1' AND info.CID = '%s'
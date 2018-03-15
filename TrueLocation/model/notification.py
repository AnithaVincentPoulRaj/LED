from model import SQLConnection
class NotificationModel:
    def insertcontactDetails(userid,cid,inviteeid):
        print('Going to insert the notification details')
        print(userid,cid,inviteeid)
        sqlObj = SQLConnection.getConnection()
        try:
            print('check')
            insertSQL = sqlObj.execute(
                """INSERT INTO NOTIFICATION(USERID,CID,INVITEEUSERID) VALUES (%s,%s,%s)""",(userid,cid,inviteeid))
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

    def getnotificationlists(userid):
        sqlObj = SQLConnection.getConnection()
        try:
            print(sqlObj)
            uid = int(userid)
            print('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
            print(uid)
            getlist = sqlObj.execute("""SELECT noti.NID as notificationID, 
                      (SELECT u.USERNAME FROM USER as u WHERE u.USERID = noti.INVITEEUSERID) AS inviteeName,
                      (SELECT info.IMAGE FROM CONTACTINFO as info WHERE info.USERID = noti.INVITEEUSERID) AS inviteeImage, 
                      noti.INVITEEUSERID as inviteeID, 
                      noti.ACTIVE as status FROM NOTIFICATION as noti WHERE noti.USERID = %s""",[uid])
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

    def updatemasterprivacy(cid, userid, ownerid, status):
        print('Update user id called')
        sqlObj = SQLConnection.getConnection()
        try:
            updateSQL = sqlObj.execute(
                """UPDATE CONTACTMASTER SET ACTIVE=%s WHERE USERID=%s AND CID=%s AND OWNERID=%s""", (status, userid, cid, ownerid))
        except Exception as exception:
            print(str(exception))
            sqlObj.close()
            return 'nil'
        SQLConnection.mysql.connection.commit()
        print(updateSQL)
        sqlObj.close()
        return updateSQL

    def deletenotification(cid, ownerid):
        print('Update user id called')
        sqlObj = SQLConnection.getConnection()
        try:
            deleteSQL = sqlObj.execute(
                """DELETE FROM NOTIFICATION WHERE CID=%s AND INVITEEUSERID=%s""",(cid, ownerid))
        except Exception as exception:
            print(str(exception))
            sqlObj.close()
            return 'nil'
        SQLConnection.mysql.connection.commit()
        print(deleteSQL)
        sqlObj.close()
        return deleteSQL
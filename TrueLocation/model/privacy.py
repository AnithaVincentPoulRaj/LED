from model import SQLConnection
class PrivacytModel:
    def updateprivacydetails(datas):
        print('Going to update privacy contact details')
        print(datas)
        sqlObj = SQLConnection.getConnection()
        try:
            print('check')
            sql = """UPDATE CONTACTMASTER SET ACTIVE = %s WHERE USERID = %s AND CID = %s"""
            updatesql = sqlObj.executemany(sql, datas)
        except Exception as exception:
            print(str(exception))
            sqlObj.close()
            return 'nil'
        SQLConnection.mysql.connection.commit()
        print(updatesql)

        print('******************************')
        print(updatesql)
        sqlObj.close()
        return updatesql

    def modifyfullprivacysettings(userid,status):
        print('Update full privacy on/off called')
        print(userid,status)
        uid = int(userid)
        sqlObj = SQLConnection.getConnection()
        try:
            updateSQL = sqlObj.execute("""UPDATE CONTACTMASTER SET ACTIVE=%s WHERE OWNERID=%s""",(status,uid))
        except Exception as exception:
            print(str(exception))
            sqlObj.close()
            return 'nil'
        SQLConnection.mysql.connection.commit()
        print(updateSQL)
        sqlObj.close()
        return updateSQL
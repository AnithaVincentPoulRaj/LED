from model import SQLConnection
class ProfileModel:
    def updateprofileinfodetails(datas):
        print('Going to update profile info details')
        print(datas)
        sqlObj = SQLConnection.getConnection()
        try:
            updateSQL = sqlObj.execute("""UPDATE CONTACTINFO SET USERNAME=%s, DOB=%s, ADDRESS=%s, IMAGE=%s, LATITUDE=%s, 
                        LONGITUDE=%s, GENDER=%s WHERE USERID=%s AND CID=%s""", (datas['userName'], datas['dateOfBirth'],
                        datas['address'], datas['image'], datas['latitude'], datas['longitude'], datas['gender'],
                        datas['userID'], datas['userContactID']))
        except Exception as exception:
            print(str(exception))
            sqlObj.close()
            return 'nil'
        SQLConnection.mysql.connection.commit()
        print(updateSQL)
        sqlObj.close()
        return updateSQL

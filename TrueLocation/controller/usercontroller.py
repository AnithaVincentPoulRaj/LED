from flask import Flask, jsonify, request, abort
from flask_restful import Resource
from utils import common, constant, messages
from model import user, contact

code = constant.ConstantCodes
message = messages.CommonMessage
resp = common.APIResponse
userModel = user.UserModel
contactmodel = contact.ContactModel

app = Flask(__name__)
#Date 15/02/18
#! Method to throw invalid JSON abort error
@app.errorhandler(code.errorCode)
def abortError(error):
    response = resp.errorResponse(error.description)
    return response

def updateInfo(data,userid):
    respmobilnumcheck = contactmodel.checkMobileNumberExist(data['mobileNumber'])
    print(respmobilnumcheck)
    if respmobilnumcheck == 'nil':
        return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
    elif respmobilnumcheck == 0:
        print('Insert as new record')
        respcont = contactmodel.insertcontactDetails(data['mobileNumber'],data['userName'],userid)
        if respcont == 'nil':
            return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
        print(respcont)
        #respJSON = {'userID': userid}
        respJSON = {'userID': userid, 'userContactID': respcont}
        return resp.succResponse(code.succCode,message.kusersuccess,respJSON)
        #setContactDetails(depth, userID)
    else:
        #setMasterMapping(userID, respChkMobileNumber)
        print('update user id')
        print(respmobilnumcheck['cid'])
        repscont = contactmodel.updateInfoDetails(respmobilnumcheck['cid'],userid)
        print('return json response')
        #respJSON = {'userID' : userid}
        if repscont == 'nil':
            return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
        respmasterdetails = contactmodel.updateInfoMasterDetails(userid,respmobilnumcheck['cid'])
        if respmasterdetails == 'nil':
            return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
        respJSON = {'userID': userid, 'userContactID': respmobilnumcheck['cid']}
        return resp.succResponse(code.succCode,message.kusersuccess,respJSON)

#Date 15/02/18
class UserController(Resource):
    def get(self):
       # sqlObj = SQLConnection.getConnection()
        #print(sqlObj)
        return jsonify({'message' : 'success'})
    def delete(self,userID):
        print(userID)
        if not userID.isdigit() or int(userID) == 0:
            return resp.errorResponseKeyValue(code.errorCode,message.kuseriderror)
        respData = userModel.checkActiveStatus(userID)
        if respData == 'nil':
            return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
        if respData != 0:
            print('Record Exists')
            print(respData['USERNAME'],respData['ACTIVE'])
            if respData['ACTIVE'] == '0':
                return resp.errorResponseKeyValue(code.errorCode, message.kalreadylogout)
            else:
                respUpdate = userModel.updateUserSession(int(userID))
                if respUpdate != 'nil':
                    return resp.succResponse(code.succCode, message.kusersucclogout,'')
                return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
        else:
            print('Not exists user')
            return resp.errorResponseKeyValue(code.errorCode, message.knorecordfound)

    def post(self):
        try:
            data = request.get_json(force=True)
        except Exception as exception:
            print (exception)
            abort(code.errorCode, message.kinvalidjson)
        if not request.json:
            abort(code.errorCode, message.kemptyjson)
        print(request.json)
        deviceType = ['1','2','3']
        if not 'userName' in request.json or not 'mobileNumber' in request.json or not 'deviceType' in request.json \
                or not 'deviceToken' in request.json or not 'macAddress' in request.json:
            return resp.errorResponseKeyValue(code.errorCode,message.kinvalidpayload)
        #data = request.get_json()
        if type(request.json['userName']) is not str or len(data['userName']) < 3 or len(data['userName']) > 30 \
                or not all(x.isalpha() or x.isspace() for x in data['userName']) or not data['userName'].strip():
            return resp.errorResponseKeyValue(code.errorCode,message.kusernamevalerror)
        if type(request.json['mobileNumber']) is not str or len(data['mobileNumber']) < 12 \
                or len(data['mobileNumber']) > 15 or not data['mobileNumber'].isdigit():
            return resp.errorResponseKeyValue(code.errorCode,message.kmobilenumvalerror)
        if type (request.json['deviceType']) is not str or not len(data['deviceType']) == 1 \
                or not data['deviceType'].isdigit() or not any(x in data['deviceType'] for x in deviceType):
            return resp.errorResponseKeyValue(code.errorCode,message.kdevicetypevalerror)
        if type (request.json['deviceToken']) is not str or not data['deviceToken'].strip():
            return resp.errorResponseKeyValue(code.errorCode,message.kdevicetokenvalerror)
        if type (request.json['macAddress']) is not str or not data['macAddress'].strip():
            return resp.errorResponseKeyValue(code.errorCode,message.kmacaddressvalerror)
        respData = userModel.checkMobileNumberExist(data)
        if respData == 'nil':
            return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
        if respData != 0:
           print('Already Exists')
           return resp.errorResponseKeyValue(code.errorCode,message.kmobrecordalreadyexists)
        else:
          respInsertUserDetails = userModel.insertUserDetails(data)
          print(respInsertUserDetails)
          if respInsertUserDetails != 'nil':
              return updateInfo(data,str(respInsertUserDetails))
              #respJSON = {'userID' : str(respInsertUserDetails)}
              #return resp.succResponse(code.succCode,message.kusersuccess,respJSON)
          else:
              return resp.errorResponseKeyValue(code.internalCode,message.kinternalerror)
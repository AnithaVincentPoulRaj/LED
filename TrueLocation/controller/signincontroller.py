from flask import Flask, jsonify, request, abort
from flask_restful import Resource
from utils import constant, common, messages
from model import user, contact

code = constant.ConstantCodes
message = messages.CommonMessage
resp = common.APIResponse
userModel = user.UserModel
contactmodel = contact.ContactModel

app = Flask(__name__)
#Date 19/02/18
#! Method to throw invalid JSON abort error
@app.errorhandler(code.errorCode)
def abortError(error):
    response = resp.errorResponse(error.description)
    return response
#Date 19/02/18
def getInfo(data,userid):
    respmobilnumcheck = contactmodel.checkMobileNumberExist(data['mobileNumber'])
    print('response for chk')
    print(respmobilnumcheck)
    if respmobilnumcheck == 'nil' or respmobilnumcheck == 0:
        return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
        #setMasterMapping(userID, respChkMobileNumber)
    print('return json response')
    respJSON = {'userID' : userid,'userContactID' :respmobilnumcheck['cid']}
    return resp.succResponse(code.succCode,message.kuserSigninSucc,respJSON)
class SigninController(Resource):
    def get(self):
        # sqlObj = SQLConnection.getConnection()
        # print(sqlObj)
        return jsonify({'message': 'success'})

    def post(self):
        try:
            data = request.get_json(force=True)
        except Exception as exception:
            print (exception)
            abort(code.errorCode, message.kinvalidjson)
        if not request.json:
            abort(code.errorCode, message.kemptyjson)
        print(request.json)
        deviceType = ['1', '2', '3']
        if not 'mobileNumber' in request.json or not 'deviceType' in request.json \
                or not 'deviceToken' in request.json or not 'macAddress' in request.json:
            return resp.errorResponseKeyValue(code.errorCode, message.kinvalidpayload)
        #data = request.get_json()
        if type(request.json['mobileNumber']) is not str or len(data['mobileNumber']) < 12 \
                or len(data['mobileNumber']) > 15 or not data['mobileNumber'].isdigit():
            return resp.errorResponseKeyValue(code.errorCode, message.kmobilenumvalerror)
        if type(request.json['deviceType']) is not str or not len(data['deviceType']) == 1 \
                or not data['deviceType'].isdigit() or not any(x in data['deviceType'] for x in deviceType):
            return resp.errorResponseKeyValue(code.errorCode, message.kdevicetypevalerror)
        if type(request.json['deviceToken']) is not str or not data['deviceToken'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.kdevicetokenvalerror)
        if type(request.json['macAddress']) is not str or not data['macAddress'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.kmacaddressvalerror)
        respData = userModel.checkMobileNumberExist(data)
        print(respData)
        if respData != 0:
            print('check the user is active or not')
            if respData['ACTIVE'] == '1' and respData['VERIFYSTATUS'] == '1':
                return resp.errorResponseKeyValue(code.errorCode, message.kuserduplicateerror)
            else:
                print(respData['USERID'])
                print('User is inactive. so can update the details')
                respUpdateUserDetails = userModel.updateUserDetails(data,respData['USERID'])
                print(respUpdateUserDetails)
                if respUpdateUserDetails != 'nil':
                    #respJSON = {'userID': str(respData['USERID'])}
                    return getInfo(data,str(respData['USERID']))
                    #return resp.succResponse(code.succCode, message.kuserSigninSucc, respJSON)
                else:
                    return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
        else:
            print('Not exists user')
            return resp.errorResponseKeyValue(code.errorCode, message.kmobnumbernotexists)
from flask import Flask, jsonify, request, abort
from flask_restful import Resource
from utils import common, constant, messages
from model import user
from controller import nexmocontroller

code = constant.ConstantCodes
message = messages.CommonMessage
resp = common.APIResponse
userModel = user.UserModel
nexmoCon = nexmocontroller.NexmoVerfication

app = Flask(__name__)

@app.errorhandler(code.errorCode)
def abortError(error):
    response = resp.errorResponse(error.description)
    return response
class OTPController(Resource):
    def post(self):
        try:
            data = request.get_json(force=True)
        except Exception as exception:
            print (exception)
            abort(code.errorCode, message.kinvalidjson)
        if not request.json:
            abort(code.errorCode, message.kemptyjson)
        print(request.json)
        if not 'userID' in request.json or not 'code' in request.json or not 'token' in request.json:
            return resp.errorResponseKeyValue(code.errorCode,message.kinvalidpayload)
        #data = request.get_json()
        print(data)
        if type(request.json['userID']) is not str or not data['userID'].isdigit() or int(data['userID']) == 0 or not data['userID'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.kuseriderror)
        if type(request.json['code']) is not str or not data['code'].isdigit() or int(data['code']) == 0 or not data['code'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.kotpcodeerror)
        if type(request.json['token']) is not str or not data['token'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.ktokenerror)
        respData = userModel.checkActiveStatus(request.json['userID'])
        if respData == 'nil':
            return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
        if respData != 0:
            print('Record Exists')
            print(respData['USERNAME'], respData['ACTIVE'])
            if respData['VERIFYSTATUS'] == '0':
                respOTP = nexmoCon.checkVerificationCode(data)
                if respOTP['status'] == '0':
                    respUpdate = userModel.updateUserVerifiedSession(int(data['userID']))
                    if respUpdate != 'nil':
                        return resp.succResponse(code.succCode, message.kotpsuccess, '')
                    return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
                else:
                    return resp.errorResponseKeyValue(code.errorCode, respOTP['error_text'])
            else:
                return resp.errorResponseKeyValue(code.errorCode, message.kotpalreadyverify)
        else:
            print('Not exists user')
            return resp.errorResponseKeyValue(code.errorCode, message.kmobnumbernotexists)

    def get(self,userID):
        print(userID)
        if not userID.isdigit() or int(userID) == 0:
            return resp.errorResponseKeyValue(code.errorCode, message.kuseriderror)
        respData = userModel.checkActiveStatus(userID)
        if respData == 'nil':
            return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
        if respData != 0:
            print('Record Exists')
            print(respData['USERNAME'], respData['ACTIVE'])
            if respData['ACTIVE'] == '1' and respData['VERIFYSTATUS'] == '1':
                return resp.errorResponseKeyValue(code.errorCode, message.kotpalreadyverify)
            elif respData['VERIFYSTATUS'] == '0':
                respVerify = nexmoCon.getVerificationCode(respData['USERID'],respData['MOBILENUMBER'])
                if respVerify['status'] == '0':
                    return resp.succResponse(code.succCode, message.kotpmessage, respVerify['request_id'])
                else:
                    print('Nexmo error')
                    return resp.errorResponseKeyValue(code.errorCode, respVerify['error_text'])
        else:
            print('Not exists user')
            return resp.errorResponseKeyValue(code.errorCode, message.knorecordfound)

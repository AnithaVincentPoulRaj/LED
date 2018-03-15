from flask import Flask, request, abort
from flask_restful import Resource
from utils import common, constant, messages
from model import user, profile

code = constant.ConstantCodes
message = messages.CommonMessage
resp = common.APIResponse
userModel = user.UserModel
promodel = profile.ProfileModel

app = Flask(__name__)
#Date 08/03/18
#! Method to throw invalid JSON abort error
@app.errorhandler(code.errorCode)
def abortError(error):
    response = resp.errorResponse(error.description)
    return response

#Date 12/03/18
class ProfileController(Resource):
    def put(self):
        try:
            data = request.get_json(force=True)
        except Exception as exception:
            print (exception)
            abort(code.errorCode, message.kinvalidjson)
        if not request.json:
            abort(code.errorCode, message.kemptyjson)
        print(request.json)
        if not 'dateOfBirth' in request.json or not 'image' in request.json or not 'address' in request.json \
                or not 'latitude' in request.json or not 'longitude' in request.json or not 'userID' in request.json \
                or not 'userContactID' in request.json or not 'gender' in request.json or not 'userName' in request.json:
            return resp.errorResponseKeyValue(code.errorCode,message.kinvalidpayload)

        gendertype = ['1', '2', '3']  # 1 - Male, 2 - Female, 3 - TransGender
        if type(request.json['userName']) is not str or len(data['userName']) < 3 or len(data['userName']) > 30 \
                or not all(x.isalpha() or x.isspace() for x in data['userName']) or not data['userName'].strip():
            return resp.errorResponseKeyValue(code.errorCode,message.kusernamevalerror)
        if type(request.json['userID']) is not str or not data['userID'].isdigit() or int(data['userID']) == 0 or not data['userID'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.kuseriderror)
        if type(request.json['userContactID']) is not str or not data['userContactID'].isdigit() or int(data['userContactID']) == 0 or not data['userContactID'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.kcontactiderror)
        if type (request.json['dateOfBirth']) is not str or not resp.validate(request.json['dateOfBirth']) == 'succ':
            return resp.errorResponseKeyValue(code.errorCode,message.kdoberror)
        if type(request.json['address']) is not str or len(data['address']) > 500 or not data['address'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.kaddresserror)
        if type(request.json['latitude']) is not str or not data['latitude'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.klaterror)
        if type(request.json['longitude']) is not str or not data['longitude'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.klongerror)
        if type(request.json['gender']) is not str or not len(data['gender']) == 1 \
                or not data['gender'].isdigit() or not any(x in data['gender'] for x in gendertype):
            return resp.errorResponseKeyValue(code.errorCode, message.kgendertypeerror)

        respdata = userModel.checkActiveStatus(request.json['userID'])
        if respdata == 'nil':
            return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
        if respdata != 0:
            print('Record Exists')
            print(respdata['USERNAME'], respdata['ACTIVE'])
            if respdata['VERIFYSTATUS'] == '0' and respdata['ACTIVE'] == '0':
                return resp.errorResponseKeyValue(code.errorCode, message.klogouterror)
            elif respdata['VERIFYSTATUS'] == '0' and respdata['ACTIVE'] == '1':
                return resp.errorResponseKeyValue(code.errorCode, message.kverityerror)
            print('##########################################')
            resprofileupdate = promodel.updateprofileinfodetails(data)
            if resprofileupdate == 'nil':
                return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
            elif resprofileupdate > 0:
                return resp.succResponse(code.succCode,message.kprofileupdatesucc,'')
            else:
                return resp.errorResponseKeyValue(code.errorCode, message.kprofileupdateerr)
        else:
            print('Not exists user')
            return resp.errorResponseKeyValue(code.errorCode, message.knorecordfound)

from flask import Flask, request, abort
from flask_restful import Resource
from utils import common, constant, messages
from model import user, contact, privacy


code = constant.ConstantCodes
message = messages.CommonMessage
resp = common.APIResponse
userModel = user.UserModel
contactModel = contact.ContactModel
privacymodel = privacy.PrivacytModel

app = Flask(__name__)
#Date 08/03/18
#! Method to throw invalid JSON abort error
@app.errorhandler(code.errorCode)
def abortError(error):
    response = resp.errorResponse(error.description)
    return response

#Date 15/02/18
class PrivacyController(Resource):
    def post(self):
        try:
            data = request.get_json(force=True)
        except Exception as exception:
            print (exception)
            abort(code.errorCode, message.kinvalidjson)
        if not request.json:
            abort(code.errorCode, message.kemptyjson)
        print(request.json)
        privacy = ['1', '2', '3'] # 1 - All, 2 - Selected, 3 - None
        if not 'userID' in request.json or not 'privacyType' in request.json or not 'userContactID' in request.json:
            return resp.errorResponseKeyValue(code.errorCode,message.kinvalidpayload)
        if type(request.json['userID']) is not str or not data['userID'].isdigit() or int(data['userID']) == 0 or not data['userID'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.kuseriderror)
        if type(request.json['userContactID']) is not str or not data['userContactID'].isdigit() or int(data['userContactID']) == 0 or not data['userContactID'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.kcontactiderror)
        if type(request.json['privacyType']) is not str or not len(data['privacyType']) == 1 \
                or not data['privacyType'].isdigit() or not any(x in data['privacyType'] for x in privacy):
            return resp.errorResponseKeyValue(code.errorCode, message.kprivacyypevalerror)
        if data['privacyType'] == '2':
            if not 'contact' in request.json:
                return resp.errorResponseKeyValue(code.errorCode, message.kinvalidpayload)
            print('privacy is part of selected contact')
            if len(request.json['contact']) == 0:
                return resp.errorResponseKeyValue(code.errorCode, message.kemptycontact)
        else:
            print('privacy is part of all and none')

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
            userID = data['userID']
            contactid = data['userContactID']
            if data['privacyType'] == '2':
                depth = []
                for row in request.json['contact']:
                    depth.append(('0', row['ownerID'], contactid))
                    print(depth)
                respprivacy = privacymodel.updateprivacydetails(depth)
                print('Results', respprivacy)
                if respprivacy == 'nil':
                    return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
                elif respprivacy > 0:
                    return resp.succResponse(code.succCode, message.kprivacysucc, '')
                else:
                    return resp.errorResponseKeyValue(code.errorCode, message.kprivacyfail)
            else:
                ptype = '1'
                if data['privacyType'] == '3':
                    ptype = '0'
                respfullprivacy = privacymodel.modifyfullprivacysettings(userID,ptype)
                if respfullprivacy == 'nil':
                    return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
                elif respfullprivacy > 0:
                    return resp.succResponse(code.succCode, message.kprivacysucc, '')
                else:
                    return resp.errorResponseKeyValue(code.errorCode, message.kprivacyfail)
        else:
            print('Not exists user')
            return resp.errorResponseKeyValue(code.errorCode, message.knorecordfound)


from flask import Flask, request, abort
from flask_restful import Resource
from utils import common, constant, messages
from model import user, contact, notification
from webargs import fields, validate
from webargs.flaskparser import use_args

code = constant.ConstantCodes
message = messages.CommonMessage
resp = common.APIResponse
userModel = user.UserModel
contactModel = contact.ContactModel
notmodel = notification.NotificationModel


app = Flask(__name__)
#Date 12/03/18
#! Method to throw invalid JSON abort error
@app.errorhandler(code.errorCode)
def abortError(error):
    response = resp.errorResponse(error.description)
    return response

#Date 15/02/18
class NotificationController(Resource):
    hello_args = {
        'userID': fields.Str(required=True, validate=[validate.Length(min=1, error="userID must be digits"),
                                                      validate.Regexp(r"[0-9]*$", error="userID must be digits")])
    }

    @use_args(hello_args)
    def get(self, args):
        userid = request.args.get('userID')
        if int(userid) == 0:
            return resp.errorResponseKeyValue(code.errorCode, message.kinvalidquery)
        respData = userModel.checkActiveStatus(userid)
        if respData == 'nil':
            return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
        if respData != 0:
            print('Record Exists')
            print(respData['USERNAME'], respData['ACTIVE'], respData['MOBILENUMBER'])
            if respData['VERIFYSTATUS'] == '0' and respData['ACTIVE'] == '0':
                return resp.errorResponseKeyValue(code.errorCode, message.klogouterror)
            elif respData['VERIFYSTATUS'] == '0' and respData['ACTIVE'] == '1':
                return resp.errorResponseKeyValue(code.errorCode, message.kverityerror)
            print('##########################################')
            resplist = notmodel.getnotificationlists(userid)
            if resplist == 'nil':
                return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
            elif resplist == 0:
                return resp.errorResponseKeyValue(code.errorCode, message.krecordempty)
            rows = []
            for row in resplist:
                rows.append(row)
                print(row)
            respJSON = {'notifications': rows}
            return resp.succResponse(code.succCode, message.knotificationlist, respJSON)
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
        if not 'userID' in request.json or not 'contactID' in request.json:
            return resp.errorResponseKeyValue(code.errorCode,message.kinvalidpayload)
        if type(request.json['userID']) is not str or not data['userID'].isdigit() or int(data['userID']) == 0 or not data['userID'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.kuseriderror)
        if type(request.json['contactID']) is not str or not data['contactID'].isdigit() or int(data['contactID']) == 0 or not data['contactID'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.kcontactiderror)
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
            #userID = data['userID']
            contactid = data['contactID']
            respcontact = contactModel.checkcontactuserexist(contactid)
            if respcontact == 'nil':
                return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
            elif respcontact == 0:
                return resp.errorResponseKeyValue(code.errorCode, message.kinviteerror)
            respinsertnotification = notmodel.insertcontactDetails(respcontact['userid'],contactid,data['userID'])
            if respinsertnotification == 'nil':
                return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
            elif respinsertnotification == 0:
                return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
            locaitonInvitation = respdata['USERNAME'] + ' Invites ' +'Share Your Location.'
            resp.sendEventPush(respcontact['token'],locaitonInvitation)
            return resp.succResponse(code.succCode,message.kinvitesucc,'')
        else:
            print('Not exists user')
            return resp.errorResponseKeyValue(code.errorCode, message.knorecordfound)
    def put(self):
        try:
            data = request.get_json(force=True)
        except Exception as exception:
            print (exception)
            abort(code.errorCode, message.kinvalidjson)
        if not request.json:
            abort(code.errorCode, message.kemptyjson)
        print(request.json)
        types = ['1', '2']  # 1 - Accept, 2 - Declain
        if not 'userID' in request.json or not 'contactID' in request.json or not 'inviteeID' in request.json \
                or not 'type' in request.json or not 'notificationID' in request.json:
            return resp.errorResponseKeyValue(code.errorCode,message.kinvalidpayload)
        if type(request.json['userID']) is not str or not data['userID'].isdigit() or int(data['userID']) == 0 or not data['userID'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.kuseriderror)
        if type(request.json['inviteeID']) is not str or not data['inviteeID'].isdigit() or int(data['inviteeID']) == 0 or not data['inviteeID'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.kinviteeiderror)
        if type(request.json['contactID']) is not str or not data['contactID'].isdigit() or int(data['contactID']) == 0 or not data['contactID'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.kcontactiderror)
        if type(request.json['notificationID']) is not str or not data['notificationID'].isdigit() or int(data['notificationID']) == 0 or not data['notificationID'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.knotificationiderror)
        if type(request.json['type']) is not str or not len(data['type']) == 1 \
                or not data['type'].isdigit() or not any(x in data['type'] for x in types):
            return resp.errorResponseKeyValue(code.errorCode, message.knotitypeerror)
        sts = '1'
        if data['type'] == '2':
            sts = '0'
        repsupdatemaster = notmodel.updatemasterprivacy(data['contactID'],data['inviteeID'],data['userID'],sts)
        if repsupdatemaster == 'nil':
            return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
        elif repsupdatemaster == 0:
            return resp.errorResponseKeyValue(code.errorCode, message.knotificationretryerror)
        respdelete = notmodel.deletenotification(data['contactID'],data['inviteeID'])
        if respdelete == 'nil':
            return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
        else:
            if data['type'] == '1':
                return resp.succResponse(code.succCode, message.kaccpetsucc,'')
            return resp.succResponse(code.succCode, message.kdeclainesucc, '')








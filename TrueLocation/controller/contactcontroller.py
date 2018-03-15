from flask import Flask, request, abort
from flask_restful import Resource
from utils import common, constant, messages
from model import user, contact
from webargs import fields, validate
from webargs.flaskparser import use_args

code = constant.ConstantCodes
message = messages.CommonMessage
resp = common.APIResponse
userModel = user.UserModel
contactModel = contact.ContactModel

app = Flask(__name__)
#Date 06/03/18
#! Method to throw invalid JSON abort error
@app.errorhandler(code.errorCode)
def abortError(error):
    response = resp.errorResponse(error.description)
    return response

def setContactDetails(data,userID):
        print(data['mobileNumber'],data['name'],userID)
        respCont = contactModel.insertcontactDetails(data['mobileNumber'],data['name'],'0')
        if respCont == 'nil':
            return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
        setMasterMapping(userID,respCont,'0')

def setMasterMapping(userID,cID,ownerid):
        print(userID,cID)
        respmaster = contactModel.insertmasterdetails(userID,cID,ownerid)
        if respmaster == 'nil':
            return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
#Date 15/02/18
class ContactController(Resource):
    hello_args = {
        'userID': fields.Str(required=True, validate=[validate.Length(min=1, error="userID must be digits"),
                                                       validate.Regexp(r"[0-9]*$", error="userID must be digits")])
    }
    @use_args(hello_args)
    def get(self,args):
       # sqlObj = SQLConnection.getConnection()
        #print(sqlObj)
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
           resplist = contactModel.getContactLists(userid)
           if resplist == 'nil':
               return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
           elif resplist == 0:
               return resp.errorResponseKeyValue(code.internalCode, message.krecordempty)
           rows = []
           for row in resplist:
               rows.append(row)
               print(row)
           respJSON = {'contacts': rows}
           return resp.succResponse(code.succCode, message.kcontactsucc, respJSON)
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
        if not 'userID' in request.json or not 'contact' in request.json:
            return resp.errorResponseKeyValue(code.errorCode,message.kinvalidpayload)
        if type(request.json['userID']) is not str or not data['userID'].isdigit() or int(data['userID']) == 0 or not data['userID'].strip():
            return resp.errorResponseKeyValue(code.errorCode, message.kuseriderror)
        print(request.json['contact'])
        if len(request.json['contact']) == 0:
            return resp.errorResponseKeyValue(code.errorCode, message.kemptycontact)
        #elif len(request.json['contact']) > 10:
         #   return resp.errorResponseKeyValue(code.errorCode, message.kexceedcontactlimit)
        respData = userModel.checkActiveStatus(request.json['userID'])
        if respData == 'nil':
            return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
        if respData != 0:
            print('Record Exists')
            print(respData['USERNAME'], respData['ACTIVE'])
            if respData['VERIFYSTATUS'] == '0' and respData['ACTIVE'] == '0':
                return resp.errorResponseKeyValue(code.errorCode, message.klogouterror)
            elif respData['VERIFYSTATUS'] == '0' and respData['ACTIVE'] == '1':
                return resp.errorResponseKeyValue(code.errorCode, message.kverityerror)
            print('##########################################')
            print(len(request.json['contact']))
            # if len(request.json['contact']) == 0:
            #     return resp.errorResponseKeyValue(code.errorCode, message.kemptycontact)
            # elif len(request.json['contact']) > 10:
            #     return resp.errorResponseKeyValue(code.errorCode, message.kexceedcontactlimit)
            userID = data['userID']
            for depth in request.json['contact']:
                print(depth['mobileNumber'])
                respChkMobileNumber = contactModel.checkMobileNumberExist(depth['mobileNumber'])
                print(respChkMobileNumber)
                if respChkMobileNumber == 'nil':
                    return resp.errorResponseKeyValue(code.internalCode, message.kinternalerror)
                elif respChkMobileNumber == 0:
                    print('Insert as new record')
                    setContactDetails(depth,userID)
                else:
                    print('go to add another table')
                    print(userID,respChkMobileNumber['cid'],respChkMobileNumber['userid'])
                    setMasterMapping(userID,respChkMobileNumber['cid'],respChkMobileNumber['userid'])
            return resp.succResponse(code.succCode, message.ksyncsucc, '')
        else:
            print('Not exists user')
            return resp.errorResponseKeyValue(code.errorCode, message.knorecordfound)

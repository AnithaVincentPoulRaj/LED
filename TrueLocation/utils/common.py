from flask import jsonify
from utils import messages
from pyfcm import FCMNotification
from datetime import datetime

msg = messages.CommonMessage
push_service = FCMNotification(api_key=msg.kapikey)

class APIResponse:
    def errorResponse(message):
        return jsonify({msg.kmessage: message})
    def errorResponseKeyValue(code,message):
        response = jsonify({msg.kmessage: message})
        response.status_code = code
        return response
    def succResponse(code,message,data):
        response = jsonify({msg.kmessage: message,msg.kdata: data})
        response.status_code = code
        return response
    def validate(date_text):
        try:
            datetime.strptime(date_text, "%Y-%m-%d")
            return 'succ'
        except ValueError:
            print(ValueError)
            return 'nil'

    def sendEventPush(registeration_id,messagebody):
        data_message = {
            "data": [{'key': 'TrueLocation'}]
        }
        message_title = "TrueLocation"
        message_body = messagebody
        print(messagebody)
        print('************************************************************')
        try:
            result = push_service.notify_single_device(registration_id=registeration_id, message_title=message_title,
                                                       message_body=message_body, data_message=data_message,
                                                       sound='default')
        except Exception as exc:
            print(str(exc))
            return 'Fail'
        print(result)
        return 'Succ'

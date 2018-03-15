from  flask import Flask #! Not Need
import nexmo
api_key = '0aefc60b'
api_secret = '8bf4a9dae1832194'
class NexmoVerfication:

    def getVerificationCode(userID,mobileNumber):
        print(userID,mobileNumber)
        client = nexmo.Client(key='0aefc60b', secret='8bf4a9dae1832194')
        response = client.start_verification(number=mobileNumber, brand='TrueLocation')
        print(response)
        print(response['status'])
        if response['status'] == '0':
            print('Started verification request_id=' + response['request_id'])
            return response
        else:
            print('Error:', response['error_text'])
            return response

    def checkVerificationCode(data):
        print(data)
        client = nexmo.Client(key='0aefc60b', secret='8bf4a9dae1832194')
        response = client.check_verification(data['token'], code=data['code'])
        if response['status'] == '0':
            print('Verification complete, event_id=' + response['event_id'])
            return response
        else:
            print('Error:', response['error_text'])
            return response


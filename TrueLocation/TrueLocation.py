from flask import Flask, request
from flask_restful import Api
from flask_mysqldb import MySQL
from controller import usercontroller, signincontroller, \
    otpcontroller, contactcontroller, privacycontroller, \
    profilecontroller, notificationcontroller

app = Flask('TrueLocation')
app = Flask(__name__)
app.config.from_object('dbconfig.ProductionConfig')
mysql = MySQL(app)
api = Api(app)


@app.route('/')
def hello_world():
    cur = mysql.connection.cursor()
    print(cur)
    return 'WELCOME TO TRUELOCATION!'

api.add_resource(usercontroller.UserController, '/api/v1/user','/api/v1/user/<userID>') # Route 1
api.add_resource(signincontroller.SigninController,'/api/v1/signin') # Route 2
api.add_resource(otpcontroller.OTPController,'/api/v1/otpverify','/api/v1/otpverify/<userID>') # Route 3
api.add_resource(contactcontroller.ContactController,'/api/v1/contact') # Route 4
api.add_resource(privacycontroller.PrivacyController,'/api/v1/privacy') #Route 5
api.add_resource(profilecontroller.ProfileController, '/api/v1/profile') #Route 6
api.add_resource(notificationcontroller.NotificationController,'/api/v1/notification') #Route 7


if __name__ == '__main__':
    #app.run(debug=True, host='0.0.0.0', port=1821)
    app.run(debug=True)


#https://github.com/rmotr/flask-api-example/blob/master/requirements.txt
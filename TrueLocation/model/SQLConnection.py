from flask import Flask
from flask_mysqldb import MySQL
app = Flask(__name__)
app.config.from_object('dbconfig.ProductionConfig')
mysql = MySQL(app)

def getConnection():
    cur = mysql.connection.cursor()
    return cur
from flask import Flask, Config

'''
class ProductionConfig(Config):
    MYSQL_HOST = 'localhost'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = ''
    MYSQL_DB = 'truelocation'
    MYSQL_CURSORCLASS = 'DictCursor'
'''

class ProductionConfig(Config):
    MYSQL_HOST = 'truelocation.cofsb1qvzzbf.us-west-2.rds.amazonaws.com'
    MYSQL_USER = 'ixmtruelocation'
    MYSQL_PASSWORD = 'ixmtruelocation*'
    MYSQL_DB = 'TRUELOCATION'
    MYSQL_CURSORCLASS = 'DictCursor'




from flask_migrate import Migrate
from decouple import config
from config import config_dict
from app import create_app, db
from random import random
from flask import jsonify
import redis
from walrus import *  # A subclass of the redis-py Redis client.
db1 = Walrus()
from direct_redis import DirectRedis
rd = DirectRedis(host='localhost', port=6379, db=0)
import pandas as pd


DEBUG = config('DEBUG', default=True, cast=bool)
get_config_mode = 'Debug' if DEBUG else 'Production'
try: 
    app_config = config_dict[get_config_mode.capitalize()]
except KeyError:
    exit('Error: Invalid <config_mode>. Expected values [Debug, Production] ')

r = redis.Redis(host="localhost", port="6379", db=0, charset="utf-8", decode_responses=True)
app = create_app( app_config ) 
Migrate(app, db)


if DEBUG:
    app.logger.info('DEBUG       = ' + str(DEBUG)      )
    app.logger.info('Environment = ' + get_config_mode )
    app.logger.info('DBMS        = ' + app_config.SQLALCHEMY_DATABASE_URI )




if __name__ == '__main__':
    app.run( debug = True)
    
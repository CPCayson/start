# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from importlib import import_module
import logging
from logging.handlers import SMTPHandler, RotatingFileHandler
import os
from flask import Flask, request, current_app
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_babel import Babel, lazy_gettext as _l
from flask_bootstrap import Bootstrap
from flask_migrate import Migrate
from flask_moment import Moment
from flask_mail import Mail

from redis import Redis
from config import Config
from flask_cors import CORS
db = SQLAlchemy()
login = LoginManager()
login.login_view = 'auth.login'
login.login_message = _l('Please log in to access this page.')
bootstrap = Bootstrap()
babel = Babel()
login_manager = LoginManager()
migrate = Migrate()
moment = Moment()
mail = Mail()

# Register Extension


   
def register_extensions(app):
    db.init_app(app)
    login.init_app(app)
    login.init_app(app)
    bootstrap.init_app(app)
    babel.init_app(app)
    mail.init_app(app)

def register_blueprints(app):
    for module_name in ('base', 'home', 'errors', 'hivedrive'):
        module = import_module('app.{}.routes'.format(module_name))
        app.register_blueprint(module.blueprint)

def configure_database(app):

    @app.before_first_request
    def initialize_database():
        db.create_all()
         #scheduler.start()


    @app.teardown_request
    def shutdown_session(exception=None):
        db.session.remove()

def create_app(config):
    app = Flask(__name__, static_folder='base/static')
    register_extensions(app)
    register_blueprints(app)
    configure_database(app)
    CORS(app)
    app.config.from_object(config)

    if not os.path.exists('logs'):
        os.mkdir('logs')
    file_handler = RotatingFileHandler('logs/microblog.log',
                                        maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s '
        '[in %(pathname)s:%(lineno)d]'))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('Microblog startup')
    return app
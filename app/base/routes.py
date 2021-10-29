
from requests_kerberos import HTTPKerberosAuth, OPTIONAL
import requests
from flask import jsonify, render_template, redirect, request, url_for, flash
from flask_login import (
    current_user,
    login_required,
    login_user,
    logout_user
)

from app import db, login_manager
from app.base import blueprint
from app.base.forms import LoginForm
from app.base.models import User, Post
from flask_babel import _
import redis
from direct_redis import DirectRedis
rd = DirectRedis(host='localhost', port=6379, db=0)
from werkzeug.urls import url_parse

r = redis.Redis(
      host="localhost", port="6379", db=0, charset="utf-8", decode_responses=True
)
from app.base.util import verify_pass
user="cccayson"


## Login & Registration

@blueprint.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        try:
            autht = "https://commandcenter-iad.amazon.com/"
            a = requests.get(url= autht, timeout=45, verify=False, allow_redirects=True,auth=HTTPKerberosAuth(mutual_authentication=OPTIONAL))
            return redirect(url_for('hivedrive_blueprint.clock')) 
        except:
                return render_template('getmidway.html')
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            flash(_('Invalid username or password'))
            return redirect(url_for('base_blueprint.login'))
        login_user(user, remember=form.remember_me.data)
        next_page = request.args.get('next')
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for('home_blueprint.midway')
        return redirect(next_page)
    return render_template('accounts/login.html', title=_('Sign In'), form=form)




@blueprint.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('base_blueprint.logout'))



## Errors

@login_manager.unauthorized_handler
def unauthorized_handler():
    return render_template('page-403.html'), 403

@blueprint.errorhandler(403)
def access_forbidden(error):
    return render_template('page-403.html'), 403

@blueprint.errorhandler(404)
def not_found_error(error):
    return render_template('page-404.html'), 404

@blueprint.errorhandler(500)
def internal_error(error):
    return render_template('page-500.html'), 500







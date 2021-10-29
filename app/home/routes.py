# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from app.home import blueprint
from flask import render_template, redirect, url_for, request, jsonify, g, flash, current_app

from flask_login import current_user, login_required
from flask_babel import _, get_locale
from app import db, login_manager
from werkzeug.urls import url_parse
from jinja2 import TemplateNotFound
import redis
from walrus import *  # A subclass of the redis-py Redis client.
db1 = Walrus()
from direct_redis import DirectRedis
rd = DirectRedis(host='localhost', port=6379, db=0)
import pandas as pd
r = redis.Redis(
       host="localhost", port="6379", db=0, charset="utf-8", decode_responses=True
)

@blueprint.route('/midway')
#@login_required
def midway():
    return render_template('getmidway.html', segment='index', r=r)




@blueprint.route('/engage', methods=['GET', 'POST'])
class Engage(object):
    def __init__(self, **kwargs):
        self.login = kwargs.get("login")

    def get_data(self) -> None:
        get_url = "What ever the url is after you post the login"
        post_url = "https://engage.na.people-insight.a2z.com"
        payload = {"searchType": "managers_autocomplete", "searchOptions": {"searchText": self.login, "pageSize": 25}}

        with requests_retry_session() as request:
            post = request.post(post_url, data=payload)
            response = request.get(get_url)
        if post.status_code != 200:
            print(post.raise_for_status())

        data = json.loads(response.text)

        self.parse_data(data)

    @staticmethod
    def parse_data(data: dict) -> None:
        df = pd.json_normalize(data)
        
        print(df)
        return df

@blueprint.route('/engage', methods=['GET', 'POST'])
def send_chimengagee(self, df: pd.DataFrame) -> None:
        webhook_url = f"https://hooks.chime.aws/incomingwebhooks/{self.address}?token={self.token}"
        mark_down_df = tabulate(df, tablefmt="github", headers="keys", showindex=False)
        alert = (
                f"/md ## [PPA Cumulative 00:00-{self.current_hour}:00]: \n"
                + f"{self.quote} \n \n"
                + "--- \n"
                + f"{mark_down_df}"
        )

        with requests_retry_session() as request:
            request.post(webhook_url, json={"Content": alert})
            return json

    
@blueprint.route('/sigma', methods=['GET', 'POST'])
def bff():
    
    return render_template('sigma6.html', rd = rd)


@blueprint.route('/adapt', methods=['GET', 'POST'])
def bfff():
    
    return render_template('adaptshit.html', rd = rd)

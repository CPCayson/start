from app.hivedrive import blueprint
from app.retry import requests_retry_session
from flask import render_template, request
from flask_babel import _
import redis
from walrus import *  # A subclass of the redis-py Redis client.
db = Walrus()
from direct_redis import DirectRedis
rd = DirectRedis(host='localhost', port=6379, db=0)
import pandas as pd
r = redis.Redis(host="localhost", port="6379", db=0, charset="utf-8", decode_responses=True)
jt = rd.get("rt")


@blueprint.route('/slide', methods=['GET', 'POST'])
def slide():
    return render_template('slider2.html', rd=rd)
    
    
@blueprint.route('/clock', methods=['GET', 'POST'])
def clock():
    return render_template('clock.html', rd=rd, jt = jt) 

@blueprint.route('/atlas', methods=['GET', 'POST'])
def atlas():
    return render_template('atlas.html', rd=rd) 


@blueprint.route('/docs', methods=['GET', 'POST'])
def docs():
    return render_template('docs.html', rd=rd)

@blueprint.route('/train', methods=['GET', 'POST'])
def train():
    return render_template('train.html') 


@blueprint.route('/fans', methods=['POST, GET'])
def send_fans() -> None:
    url = "https://fans-iad.amazon.com/"
    post_url = "https://fans-iad.amazon.com/api/message/new"
    data = {"to": "fwweeks", "directReports": "", "messageText": "message"}
    with requests_retry_session() as request:
        request.get(url)
        request.post(post_url,
                    data=json.dumps(data),
                    headers={"Accept": "application/json, text/plain, */*",
                            "Content-Type": "application/json;charset=UTF-8"})
    return str(data)


@blueprint.route('/eng', methods=['POST, GET'])
def send_eng():
    name = request.form.get('data', '')  
    return(name)

  
 
@blueprint.route('/last', methods=['GET', 'POST'])
def last():    
    trick = ["actualrate", "actualhour" ]
    return render_template('last.html', jt = jt, trick = trick, rd = rd) 


@blueprint.route('/command', methods=['GET', 'POST'])
def lacommandst():    
    return render_template('command.html', jt = jt, rd = rd) 

@blueprint.route('/syncchart', methods=['GET', 'POST'])
def syncer():
    tph=rd.get('tph')
    vol=rd.get('vol')
    hours=rd.get('hours')
    
    return render_template('syncchart.html', tph = tph, vol = vol, hours= hours)
    
    

@blueprint.route('/below', methods=['GET', 'POST'])
def syncer1():
    return render_template('packers.html', rd=rd)



@blueprint.route('/washbuddy', methods=['GET', 'POST'])
def washbuddy():
    return render_template('washbuddy.html', rd=rd)
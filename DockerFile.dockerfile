FROM python:slim

RUN useradd start

WORKDIR /home/start

COPY requirements.txt requirements.txt
RUN python -m venv venv
RUN venv/bin/pip install -r requirements.txt
RUN venv/bin/pip install gunicorn pymysql cryptography

COPY app app
COPY migrations migrations
COPY start.py config.py boot.sh ./
RUN chmod a+x boot.sh

ENV FLASK_APP start.py

RUN chown -R start:start ./
USER start

EXPOSE 5000
ENTRYPOINT ["./boot.sh"]
import os
import pickle

import urllib3
import requests
from requests import cookies
from urllib3.util import Retry
from requests.adapters import HTTPAdapter
from urllib3.exceptions import MaxRetryError
from requests_kerberos import OPTIONAL, HTTPKerberosAuth


def requests_retry_session(
        retries=5,
        session=None,
        backoff_factor=0.3,
        status_forcelist=(400, 500, 502, 503, 504, 520, 524),
        method_whitelist=("HEAD", "GET", "POST", "PUT", "DELETE", "OPTIONS", "TRACE")
):

    urllib3.disable_warnings()
    user_name = os.getlogin()

    path = r"C:\Users\cccayson\Desktop\Flask\black-dashboard-flask\app\midway\midway_cookie.pkl"
    with open(path, "rb") as cookie_file:
        session_token = pickle.load(cookie_file)

    midway_cookie_session = requests.cookies.create_cookie(domain="midway-auth.amazon.com",
                                                           name="session",
                                                           value=session_token)
    midway_cookie_login = requests.cookies.create_cookie(domain="midway-auth.amazon.com",
                                                         name="user_name",
                                                         value=user_name)

    auth_cookies = [midway_cookie_session, midway_cookie_login]

    try:
        session = session or requests.Session()
        session.timeout = 30
        session.stream = True
        session.verify = False
        session.allow_redirects = True
        [session.cookies.set_cookie(cookie) for cookie in auth_cookies]

        retry = Retry(read=retries,
                      total=retries,
                      connect=retries,
                      backoff_factor=backoff_factor,
                      allowed_methods=method_whitelist,
                      status_forcelist=status_forcelist)

        adapter = HTTPAdapter(max_retries=retry)
        session.mount("http://", adapter)
        session.mount("https://", adapter)

        return session

    except MaxRetryError:
        pass
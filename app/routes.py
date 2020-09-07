from app import app
from flask import render_template, request, session, redirect
import os
import xml.etree.ElementTree as ET
import xml.dom.minidom
from rauth.service import OAuth1Service, OAuth1Session

def get_shelves(goodreads_session, search):
    r = goodreads_session.get("https://www.goodreads.com/shelf/list.xml", params=search)
    root = ET.fromstring(r.content)
    shelves = root.find("shelves")
    ans = []
    for shelf in shelves:
        ans.append(shelf.find("name").text)
    return ans

@app.route('/')
@app.route('/index')
def index():
    goodreads = OAuth1Service(
        consumer_key=app.config.get("API_KEY"), # Are stored as environment variables in .env file
        consumer_secret=app.config.get("API_SECRET"),
        name='goodreads',
        request_token_url='https://www.goodreads.com/oauth/request_token',
        authorize_url='https://www.goodreads.com/oauth/authorize',
        access_token_url='https://www.goodreads.com/oauth/access_token',
        base_url='https://www.goodreads.com/'
    )

    request_token, request_token_secret = goodreads.get_request_token(header_auth=True)
    if request.args.get("oauth_token") and request.args.get("authorize") == "1":
        print(session.get("access_token"), session.get("access_token_secret"))
        goodreads_session = OAuth1Session(
            consumer_key = app.config.get("API_KEY"),
            consumer_secret = app.config.get("API_SECRET"),
            access_token = request.args.get("oauth_token"),
        )
        return render_template("index.html", authorized=True, shelves=get_shelves(goodreads_session, {"id": "64346486"}))
    else:
        authorize_url = goodreads.get_authorize_url(request_token)
        return render_template("index.html", authorized=False, authorize_url=authorize_url)
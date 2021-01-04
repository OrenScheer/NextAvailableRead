from app import app
from flask import render_template, request, session, redirect
import os
import xml.etree.ElementTree as ET
import xml.dom.minidom
from rauth.service import OAuth1Service, OAuth1Session
from app.forms import BookQueryForm
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote
from app.Book import Book

def get_shelves(goodreads_session, search):
    r = goodreads_session.get("https://www.goodreads.com/shelf/list.xml", params=search)
    root = ET.fromstring(r.content)
    shelves = root.find("shelves")
    ans = []
    for shelf in shelves:
        ans.append(shelf.find("name").text)
    return ans

def get_titles(goodreads_session, search):
   return

def available(book):
    # Important classes: 
    # cp-availability-status is the availability status of the item
    # author-link is the author (just the a tags)
    # title-content is the title
    # cp-format-indicator is the format...might have to narrow down since there are multiple tags
    URL = "https://ottawa.bibliocommons.com/v2/search?query=" + quote('"' + book.title + '"' + " " + '"' + book.author + '"').replace(' ', '+') + "&searchType=keyword"
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, 'html.parser')
    availability = soup.find_all(class_='cp-availability-status')
    if len(availability) == 0:
        return False
    formats = soup.find_all(class_='cp-format-indicator')[::3] # There are three indicators of this class for each item's format
    link = soup.find_all(class_='cp-title')[0].find("a")['href'] # Cheating, it may not be the right link
    for a, f in zip(availability, formats):
        if "available" in a.text.lower() and "ebook" in f.text.lower():
            book.opl_link = "https://ottawa.bibliocommons.com" + link
            return True
    return False

@app.route('/', methods=["GET", "POST"])
@app.route('/index', methods=["GET", "POST"])
def index():
    form = BookQueryForm()
    form.shelf.choices = get_shelves(goodreads_session, search={"id": "64346486"})
    if form.validate_on_submit():
        #print(r.content)
        search = {"id": "64346486", "shelf": form.shelf.data, "page": "1", "per_page": "200", "sort":"random"}
        titles = get_titles(goodreads_session, search)
        count = 0
        i = 0
        available_books = []
        print("got titles")
        while i < len(titles) and count < int(form.number_of_books.data):
            if available(titles[i]):
                available_books.append(titles[i])
                count += 1
                print("one available", i, count)
                i += 1
        return render_template("results.html", books=available_books)
    return render_template("index.html", authorized=True, form=form)
from app import app
from flask import render_template, request, session, redirect
import os
import xml.etree.ElementTree as ET
import xml.dom.minidom
from app.forms import BookQueryForm
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote
import re
import math
import random
from app.Book import Book

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

def get_shelves(user_id):
    # Returns list of a user's Goodreads shelves
    URL = "https://www.goodreads.com/review/list/" + str(user_id)
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, 'html.parser')
    shelves = soup.find_all(class_='userShelf')
    pattern = re.compile("(.*)(\()(\d*)")
    res = {}
    for shelf in shelves:
        text = shelf.text.strip()
        res[text[:text.find("(")].strip("\u200e").strip().lower()] = (shelf.find("a")['href'] + "&print=true", 
            int(pattern.match(text).group(3))) 
    return res

def get_titles(user_id, extra_url, number_of_books):
    URL = "https://www.goodreads.com" + extra_url + "&page=0"
    number_of_pages = math.ceil(number_of_books / 20)
    current_page = 1
    titles = []
    while current_page <= number_of_pages:
        print(current_page)
        URL = URL.replace("&page="+str(current_page-1), "&page="+str(current_page))
        page = requests.get(URL)
        soup = BeautifulSoup(page.content, 'html.parser')
        books = soup.find_all(class_="bookalike review")
        for book in books:
            title = book.find(class_="field title").find(class_="value").text.strip()
            if ((index := title.find("(")) != -1):
                title = title[:index].strip()
            author = " ".join(book.find(class_ = "field author").find("a").text.split(",")[::-1]).strip()
            page_count = page_count if (page_count := (book.find(class_="field num_pages").find(class_="value").text.replace("pp", "").replace(",", "").strip())).isdigit() else 0
            rating = float(book.find(class_="field avg_rating").find(class_="value").text.strip())
            goodreads_link = "https://goodreads.com" + book.find("a")["href"]
            image_link = book.find("img")["src"].replace("_SX50_", "").replace("_SY75_", "").replace("..", ".")
            titles.append(Book(title, author, page_count, rating, goodreads_link, image_link))
        current_page += 1
    return titles

@app.route('/', methods=["GET", "POST"])
@app.route('/index', methods=["GET", "POST"])
def index():
    form = BookQueryForm()
    shelves = get_shelves("64346486")
    form.shelf.choices = list(shelves.keys())
    if form.validate_on_submit():
       #print(r.content)
       count = 0
       i = 0
       titles = get_titles("64346486", shelves[form.shelf.data][0], shelves[form.shelf.data][1])
       random.shuffle(titles)
       available_books = []
       print("got titles")
       while i < len(titles) and count < int(form.number_of_books.data):
           if available(titles[i]):
               available_books.append(titles[i])
               count += 1
               print("one available", i, count)
           i += 1
       return render_template("results.html", books=available_books)
    return render_template("index.html", form=form)
    

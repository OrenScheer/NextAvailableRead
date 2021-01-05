#from app import app
from flask import render_template, request, session, redirect
import os
import xml.etree.ElementTree as ET
import xml.dom.minidom
#from app.forms import BookQueryForm
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote
import re
#from app.Book import Book

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
    pattern = re.compile("(\s*)(.*)\(")
    shelves = [pattern.match(shelf.text).group(2).strip() for shelf in shelves]
    return shelves

def get_titles(user_id, shelf):
    titles = []
    return titles

#@app.route('/', methods=["GET", "POST"])
#@app.route('/index', methods=["GET", "POST"])
def index():
    # = BookQueryForm()
    #form.shelf.choices = get_shelves(goodreads_session, search={"id": "64346486"})

    #if form.validate_on_submit():
    #    #print(r.content)
    #    count = 0
    #    i = 0
    #    available_books = []
    #    print("got titles")
    #    while i < len(titles) and count < int(form.number_of_books.data):
    #        if available(titles[i]):
    #            available_books.append(titles[i])
    #            count += 1
    #            print("one available", i, count)
    #        i += 1
    #    return render_template("results.html", books=available_books)
    #return render_template("index.html", authorized=True, form=form)
    user_id = input("Please enter your Goodreads id: ")
    shelves = get_shelves(user_id)
    shelves = [shelf.lower() for shelf in shelves]
    print("Please enter one of the following options:")
    for shelf in shelves:
        print(shelf)
    shelf_choice = input("Enter your selection here: ").lower()
    if shelf_choice not in shelves:
        print("This is not one of your shelves. Bye.")
        return
    titles = get_shelves(user_id, shelf_choice)
    i = 0
    find_num = 5
    count = 0
    available_books = []
    while i < len(titles) and count < find_num:
        if available(titles[i]):
            available_books.append(titles[i])
            count += 1
            print(titles[i].title)
        i += 1

index()
    

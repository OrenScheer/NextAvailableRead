from rauth.service import OAuth1Service, OAuth1Session
import dotenv
import os
import pyinputplus as pyip
import importlib

# Load .env file which has user's API keys
dotenv.load_dotenv()

def get_tokens():
    # Authorization code sourced from example at https://www.goodreads.com/api/oauth_example
    goodreads = OAuth1Service(
    consumer_key=os.getenv("API_KEY"), # Are stored as environment variables in .env file
    consumer_secret=os.getenv("API_SECRET"),
    name='goodreads',
    request_token_url='https://www.goodreads.com/oauth/request_token',
    authorize_url='https://www.goodreads.com/oauth/authorize',
    access_token_url='https://www.goodreads.com/oauth/access_token',
    base_url='https://www.goodreads.com/'
    )

    # Get user to authorize access to their account
    request_token, request_token_secret = goodreads.get_request_token(header_auth=True)
    authorize_url = goodreads.get_authorize_url(request_token)
    print("Visit this URL in your browser: " + authorize_url)

    while pyip.inputYesNo("Have you authorized me? (y/n) ") == "no":
        print("Please authorize me!")

    session = goodreads.get_auth_session(request_token, request_token_secret)

    # Open .env file to add access token/secret as environment variables
    tokens = open(".env", "a")

    # Write tokens as environment variables
    tokens.write("ACCESS_TOKEN = " + session.access_token + "\n")
    tokens.write("ACCESS_TOKEN_SECRET = " + session.access_token_secret)
    print("You now have access.")
    tokens.close()

# If access tokens are already in .env file, we don't need to go through authentication process
if os.getenv("ACCESS_TOKEN") != None and os.getenv("ACCESS_TOKEN_SECRET") != None:
    print("I already have access to your account.")
else:
    print("I will now get access to your account.")
    get_tokens()

# Reload dotenv library to reopen .env file which now has access tokens as well
importlib.reload(dotenv)
dotenv.load_dotenv()

# Open session
session = OAuth1Session(
    consumer_key = os.getenv("API_KEY"),
    consumer_secret = os.getenv("API_SECRET"),
    access_token = os.getenv("ACCESS_TOKEN"),
    access_token_secret = os.getenv("ACCESS_TOKEN_SECRET"),
)

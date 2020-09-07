# NextAvailableRead
A web app that bridges the gap between Goodreads and the Ottawa Public Library, finding books on a user's "to-read" shelf on Goodreads that are currently available in e-book format at the Ottawa Public Library.

Work in progress: Account authentication does not currently work (my account user id is hard-coded in), and the web interface will be improved.

Additionally, a user's Goodreads shelves must be public, even if they have granted authorization. This is likely an issue with the API, but will be investigated further.

### SETUP

After cloning the repository, save a text file in the same folder named ".env" (without the quotation marks) in the top-level folder.
In this file, add:
```
API_KEY = <Your API code here>
API_SECRET = <Your API secret code here>
SECRET_KEY = <A random string of characters here>
```
replacing the parts to the right of "API_KEY" and "API_SECRET" with your keys, that can be obtained from
[here](https://www.goodreads.com/api/keys). You will need a Goodreads account. The SECRET_KEY can be generated as described in the Flask quickstart guide [here](https://flask.palletsprojects.com/en/1.1.x/quickstart/#sessions).

Next, run the following `set FLASK_APP=hello.py` on Windows, replacing "set" with "export" on other operating systems. Follow this with `flask run`, and open the specified server in your browser.

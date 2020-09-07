class Book():
    def __init__(self, title, author, page_count, year, goodreads_link, image_link, opl_link=None):
        self.title = title
        self.author = author
        self.page_count = page_count
        self.year = year
        self.goodreads_link = goodreads_link
        self.image_link = image_link
        self.opl_link = opl_link
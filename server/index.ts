import express, { Application, Request, Response } from "express";
import axios from "axios";
import cheerio, { Cheerio, Element } from "cheerio";
import cors from "cors";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import statusMonitor from "express-status-monitor";

const app: Application = express();
app.use(statusMonitor());

dotenv.config();
const port = process.env.PORT || 5309;
const BASE_URL = "orenscheer.com";
const sendgridApiKey = process.env.SENDGRID_API_KEY || "";
sgMail.setApiKey(sendgridApiKey);

interface Book {
  title: string;
  author: string;
  pageCount: number;
  rating: number;
  goodreadsUrl: string;
  imageUrl: string;
  libraryUrl?: string;
}

interface Shelf {
  name: string;
  url: string;
  numberOfBooks: number;
  numberOfStoredBooks?: number;
}

app.use(cors({ origin: true }));
app.use(express.json());

function unleak(str: string): string {
  // eslint-disable-next-line prefer-template
  return (" " + str).substr(1);
}

app.get("/landing", (req: Request, res: Response) => {
  res.status(200).send("Welcome to NextAvailableRead!");
});

app.get("/users/:userID/shelves", (req: Request, res: Response) => {
  (async () => {
    const { userID } = req.params;
    const url = `https://www.goodreads.com/review/list/${userID}`;

    const page = await axios.get(url).catch((err) => {
      console.log("Failed to get list of shelves.");
      throw err;
    });

    const $ = cheerio.load(page.data);
    const shelves: Shelf[] = [];

    const parseShelf = (shelfLink: Cheerio<Element>) => {
      const text = unleak(shelfLink.text());
      const link = unleak(shelfLink.attr("href") as string);
      const newShelf: Shelf = {
        name: unleak(
          text
            .substring(0, text.indexOf("("))
            .replace("\u200e", "")
            .trim()
            .toLowerCase()
        ),
        url: unleak(`https://goodreads.com${link}&print=true`),
        numberOfBooks: parseInt(
          unleak(text.substring(text.indexOf("(") + 1, text.indexOf(")"))),
          10
        ),
      };
      return newShelf;
    };

    shelves.push(parseShelf($("#shelvesSection > a")));
    $(".userShelf > a").each((_, e) => {
      shelves.push(parseShelf($(e)));
    });
    if (shelves.length === 0) {
      throw new Error("You have no shelves!");
    }
    res.status(200).send(shelves);
  })().catch((err) => {
    console.log(err);
    res.status(404).send();
  });
});

const isAvailable = async (
  book: Book,
  biblioCommonsPrefix: string
): Promise<[boolean, string]> => {
  const url = `https://${biblioCommonsPrefix}.bibliocommons.com/v2/search?query=(${encodeURI(
    `title:(${book.title}) AND contributor:(${book.author})`
  )})&searchType=bl&f_FORMAT=EBOOK`;
  let page;
  try {
    page = await axios.get(url, { maxRedirects: 0 });
  } catch {
    return [false, ""];
  }
  const $ = cheerio.load(page.data);
  const $available = $(".cp-search-result-item-content")
    .first()
    .find(".manifestation-item-format-call-wrap.available");
  if ($available.length > 0) {
    return [
      true,
      unleak(
        `https://${biblioCommonsPrefix}.bibliocommons.com${unleak(
          $available.find("a").attr("href") as string
        )}`
      ),
    ];
  }
  return [false, ""];
};

interface BooksRequest {
  url: string;
  numberOfBooksOnShelf: number;
  numberOfBooksRequested: number;
  biblioCommonsPrefix: string;
}

app.get("/books", (req: Request, res: Response) => {
  (async () => {
    const url = (req.query.url as string).replace("https://", "https://www.");
    const numberOfBooksOnShelf = parseInt(
      req.query.numberOfBooksOnShelf as string,
      10
    );
    const numberOfBooksRequested = parseInt(
      req.query.numberOfBooksRequested as string,
      10
    );
    const biblioCommonsPrefix = req.query.biblioCommonsPrefix as string;

    console.log(
      `Request made for ${numberOfBooksRequested} books from ${biblioCommonsPrefix}.`
    );

    const headers = {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-transform",
    };
    res.writeHead(200, headers);

    const getGoodreadsBooks = async (): Promise<Book[]> => {
      const functions: (() => Promise<void>)[] = [];
      const books: Book[] = [];
      for (let i = 1; i <= Math.ceil(numberOfBooksOnShelf / 20); i += 1) {
        functions.push(async () => {
          let page;
          try {
            page = await axios.get(`${url}&page=${i}`, { maxRedirects: 0 });
          } catch {
            return;
          }

          const $ = cheerio.load(page.data);
          $(".bookalike").each((_, e) => {
            const $titleElem = $(e).find(".title").find(".value a");
            const series = unleak($titleElem.find("span").text());

            const book: Book = {
              title: unleak($titleElem.text().replace(series, "").trim()),
              author: unleak(
                $(e)
                  .find(".author")
                  .find("a")
                  .text()
                  .toString()
                  .split(",")
                  .reverse()
                  .join(" ")
                  .trim()
              ),
              pageCount: parseInt(
                unleak(
                  $(e).find(".num_pages").find(".value").text().replace(",", "")
                ),
                10
              ),
              rating: parseFloat(
                unleak($(e).find(".avg_rating").find("div").text().toString())
              ),
              goodreadsUrl: unleak(
                `https://goodreads.com${unleak(
                  $(e).find("a").attr("href") as string
                )}`
              ),
              imageUrl: unleak(
                $(e)
                  .find("img")
                  .attr("src")
                  ?.toString()
                  .replace("SX50", "")
                  .replace("SY75", "")
                  .replace("_", "")
                  .replace("..", ".")
                  .replace(".jpg", "._SX318_.jpg") as string
              ),
            };
            books.push(book);
          });
        });
      }

      let currentIndex = 0;
      const batchSize = 5;
      while (currentIndex < functions.length) {
        const batch = functions.slice(currentIndex, currentIndex + batchSize);
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(batch.map((fn) => fn()));
        currentIndex += batchSize;
      }
      return books;
    };

    const booksFromShelf = await getGoodreadsBooks();
    if (booksFromShelf.length === 0) {
      throw new Error("Goodreads books failed to load.");
    }
    console.log("Goodreads books loaded.");
    res.write("data: Goodreads found.\n\n");

    // shuffle algorithm from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    for (let i = booksFromShelf.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [booksFromShelf[i], booksFromShelf[j]] = [
        booksFromShelf[j],
        booksFromShelf[i],
      ];
    }
    const batchSize = 10;
    let currentIndex = 0;
    let remainingBooksRequired = numberOfBooksRequested;
    while (remainingBooksRequired > 0 && currentIndex < booksFromShelf.length) {
      const batch = booksFromShelf.slice(
        currentIndex,
        currentIndex + batchSize
      );
      // eslint-disable-next-line no-await-in-loop
      const results = await Promise.all(
        batch.map((book) =>
          (async () => {
            const [available, bookUrl] = await isAvailable(
              book,
              biblioCommonsPrefix
            );
            if (available) {
              // eslint-disable-next-line no-param-reassign
              book.libraryUrl = bookUrl;
              console.log(`FOUND ${book.title}`);
              res.write(`data: ${JSON.stringify(book)}\n\n`);
              return true;
            }
            return false;
          })()
        )
      );
      remainingBooksRequired -= results.filter((b) => b).length;
      currentIndex += batchSize;
    }

    res.write(`data: done here\n\n`);
    res.status(200).send();
    res.end();
  })().catch((err) => {
    console.log(err);
    res.write(`data: error\n\n`);
    res.status(404).send();
    res.end();
  });
});

interface BookAvailabilityRequest {
  title: string;
  author: string;
  biblioCommonsPrefix: string;
}

// Endpoint for testing availability function
app.get("/availability", (req: Request, res: Response) => {
  (async () => {
    const { title, author, biblioCommonsPrefix } =
      req.body as BookAvailabilityRequest;
    const book: Book = {
      title,
      author,
      pageCount: 0,
      rating: 0,
      goodreadsUrl: "",
      imageUrl: "",
    };
    const availability = await isAvailable(book, biblioCommonsPrefix);
    res.status(200).send(availability);
  })().catch((err) => {
    console.log(err);
    res.status(404).send();
  });
});

interface BugReport {
  type: "Books not loading" | "Library link leads to wrong page" | "Other";
  bookTitle?: string;
  bookAuthor?: string;
  description?: string;
}

app.post("/bugreport", (req: Request, res: Response) => {
  const { type, bookTitle, bookAuthor, description } = req.body as BugReport;
  let message = `<p>Type: ${type}<br />`;
  if (bookTitle) {
    message += `Title: ${bookTitle}<br />`;
  }
  if (bookAuthor) {
    message += `Author: ${bookAuthor}<br />`;
  }
  if (description) {
    message += `Description: ${description}<br/>`;
  }
  message += "</p>";
  const msg = {
    to: `nextavailableread-bugs@${BASE_URL}`,
    from: `nextavailableread@${BASE_URL}`,
    subject: `NextAvailableRead bug report - ${new Date().toLocaleString(
      "en-CA"
    )}`,
    html: message,
  };
  sgMail
    .send(msg)
    .then(() => {
      res.status(200).send();
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});

app.listen(port, () => console.log(`Server is listening on port ${port}!`));

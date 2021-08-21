import express, { Application, Request, Response } from "express";
import axios from "axios";
import cheerio from "cheerio";
import cors from "cors";
import dotenv from "dotenv";
import BluebirdPromise from "bluebird";

BluebirdPromise.config({
  cancellation: true,
});

const app: Application = express();
const port = 5309;
dotenv.config();

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
    $(".userShelf > a").each((_, e) => {
      const text = $(e).text();
      const link = $(e).attr("href") as string;
      const newShelf: Shelf = {
        name: text
          .substring(0, text.indexOf("("))
          .replace("\u200e", "")
          .trim()
          .toLowerCase(),
        url: `https://goodreads.com${link}&print=true`,
        numberOfBooks: parseInt(
          text.substring(text.indexOf("(") + 1, text.indexOf(")")),
          10
        ),
      };
      shelves.push(newShelf);
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
): BluebirdPromise<[boolean, string]> => {
  const url = `https://${biblioCommonsPrefix}.bibliocommons.com/v2/search?query=(${encodeURI(
    `title:(${book.title}) AND contributor:(${book.author})`
  )})&searchType=bl&f_FORMAT=EBOOK`;
  let page;
  try {
    page = await axios.get(url);
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
      `https://${biblioCommonsPrefix}.bibliocommons.com${
        $available.find("a").attr("href") as string
      }`,
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
    const url = req.query.url as string;
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

    const promises: PromiseLike<Book[]>[] = [];
    for (let i = 1; i <= Math.ceil(numberOfBooksOnShelf / 20); i += 1) {
      promises.push(
        axios
          .get(`${url}&page=${i}`)
          .then((page) => {
            const booksFromPage: Book[] = [];
            const $ = cheerio.load(page.data);
            $(".bookalike").each((_, e) => {
              const $titleElem = $(e).find(".title").find(".value a");
              const series = $titleElem.find("span").text();

              const book: Book = {
                title: $titleElem.text().replace(series, "").trim(),
                author: $(e)
                  .find(".author")
                  .find("a")
                  .text()
                  .toString()
                  .split(",")
                  .reverse()
                  .join(" ")
                  .trim(),
                pageCount: parseInt(
                  $(e).find(".num_pages").find(".value").text(),
                  10
                ),
                rating: parseFloat(
                  $(e).find(".avg_rating").find("div").text().toString()
                ),
                goodreadsUrl: `https://goodreads.com/${
                  $(e).find("a").attr("href") as string
                }`,
                imageUrl: $(e)
                  .find("img")
                  .attr("src")
                  ?.toString()
                  .replace("SX50", "")
                  .replace("SY75", "")
                  .replace("_", "")
                  .replace("..", ".")
                  .replace(".jpg", "._SX318_.jpg") as string,
              };
              booksFromPage.push(book);
            });
            return booksFromPage;
          })
          .catch((err) => {
            console.log("Couldn't retrieve shelf from Goodreads url.");
            throw err;
          })
      );
    }
    const result = await BluebirdPromise.all(promises).catch((err) => {
      throw err;
    });

    const booksFromShelf = result.flat();

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

    const bookPromises: BluebirdPromise<Book>[] = [];
    booksFromShelf.forEach((book, i, arr) => {
      bookPromises.push(
        isAvailable(book, biblioCommonsPrefix)
          .then(([isIt, link]) => {
            if (isIt) {
              console.log(link);
              // eslint-disable-next-line no-param-reassign
              arr[i].libraryUrl = link;
              res.write(`data: ${JSON.stringify(book)}\n\n`);
              return book;
            }
            throw new Error("Book is not available.");
          })
          .catch((err) => {
            throw err;
          })
      );
    });

    const availableBooks = await BluebirdPromise.some(
      bookPromises,
      numberOfBooksRequested
    ).catch((err) => {
      throw err;
    });

    console.log(availableBooks.length);

    if (availableBooks.length === 0) {
      throw new Error("You have no books!");
    }
    res.write(`data: done here\n\n`);
    res.status(200).send();
    res.end();

    bookPromises.forEach((promise) => promise.cancel());
  })().catch((err) => {
    console.log(err);
    res.status(404).send();
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

app.listen(port, () => console.log(`Server is listening on port ${port}!`));

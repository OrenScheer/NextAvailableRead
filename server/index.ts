import express, { Application, Request, Response } from "express";
import axios from "axios";
import cheerio from "cheerio";
import cors from "cors";
import dotenv from "dotenv";

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

const isAvailable = async (book: Book): Promise<[boolean, string]> => {
  const url = `https://ottawa.bibliocommons.com/v2/search?query=${encodeURI(
    `"${book.title}"+"${book.author}"`
  )}&searchType=keyword`;
  let page;
  try {
    page = await axios.get(url);
  } catch {
    return [false, ""];
  }
  // Lots to improve here: reorganize methods/order, use direct link to ebook
  const $ = cheerio.load(page.data);
  const $elems = $(".cp-availability-status");
  if ($elems.length === 0) {
    return [false, ""];
  }
  const link = `https://ottawa.bibliocommons.com${
    $(".cp-title").find("a").attr("href") as string
  }`;
  let found = false;
  $(".format-info-main-content .cp-format-indicator").each((i, e) => {
    const availability = $elems.eq(i).text();
    if (
      $(e).text().toLowerCase().includes("ebook") &&
      availability.toLowerCase().includes("available")
    ) {
      found = true;
    }
  });
  return [found, link];
};

interface BooksRequest {
  url: string;
  numberOfBooksOnShelf: number;
  numberOfBooksRequested: number;
}

app.post("/books", (req: Request, res: Response) => {
  (async () => {
    const { url, numberOfBooksOnShelf, numberOfBooksRequested } =
      req.body as BooksRequest;

    console.log(`number of books requested: ${numberOfBooksRequested}`);

    const promises: Promise<Book[]>[] = [];
    for (let i = 1; i <= Math.ceil(numberOfBooksOnShelf / 20); i += 1) {
      promises.push(
        axios
          .get(`${url}&page=${i}`)
          .then(async (page) => {
            const $ = cheerio.load(page.data);
            const bookPromises: Promise<[boolean, Book]>[] = [];
            $(".bookalike").each((_, e) => {
              const book: Book = {
                title: $(e)
                  .find(".title")
                  .find(".value a")
                  .attr("title")
                  ?.toString() as string,
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
              bookPromises.push(
                isAvailable(book)
                  .then((isBookAvailable) => {
                    const [isIt, link] = isBookAvailable;
                    let x: [boolean, Book];
                    if (isIt) {
                      console.log(link);
                      book.libraryUrl = link;
                      x = [true, book];
                    } else {
                      x = [false, book];
                    }
                    return x;
                  })
                  .catch((err) => {
                    console.log("ERROR checking availability");
                    return [false, book];
                  })
              );
            });
            const availableBooks = await Promise.all(bookPromises).catch(
              (err) => {
                throw err;
              }
            );
            return availableBooks
              .filter((pair) => pair[0])
              .map((pair) => pair[1]);
          })
          .catch((err) => {
            console.log("Couldn't retrieve shelf from Goodreads url.");
            throw err;
          })
      );
    }
    const result = await Promise.all(promises).catch((err) => {
      throw err;
    });
    const books = result.flat();
    console.log(books.length);

    // shuffle algorithm from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    for (let i = books.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [books[i], books[j]] = [books[j], books[i]];
    }

    if (result.length === 0) {
      throw new Error("You have no books!");
    }
    res.status(200).send(books.slice(0, numberOfBooksRequested));
  })().catch((err) => {
    console.log(err);
    res.status(404).send();
  });
});

app.listen(port, () => console.log(`Server is listening on port ${port}!`));

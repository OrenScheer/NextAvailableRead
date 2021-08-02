import express, { Application, Request, Response, NextFunction } from "express";
import axios from "axios";
import cheerio from "cheerio";

const app: Application = express();
const port = 5000;

type Shelf = {
  name: string;
  url: URL;
  numberOfBooks: number;
};

app.get("/users/:userID/shelves", (req: Request, res: Response) => {
  const { userID } = req.params;
  const url = `https://www.goodreads.com/review/list/${userID}`;
  axios
    .get(url)
    .then((page) => {
      const $ = cheerio.load(page.data);
      const shelves: Shelf[] = [];
      $(".userShelf > a").each((_, e) => {
        const text = $(e).text();
        const link = $(e).attr("href") as string;
        shelves.push({
          name: text
            .substring(0, text.indexOf("("))
            .replace("\u200e", "")
            .trim()
            .toLowerCase(),
          url: new URL(`https://goodreads.com${link}&print=true`),
          numberOfBooks: parseInt(
            text.substring(text.indexOf("(") + 1, text.indexOf(")")),
            10
          ),
        });
      });
      res.status(200).send({ data: shelves });
    })
    .catch((err) => console.log(err));
});

app.listen(port, () => console.log(`Server is listening on port ${port}!`));

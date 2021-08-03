import express, { Application, Request, Response } from "express";
import axios from "axios";
import cheerio from "cheerio";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

const { Schema, model, connect } = mongoose;

const app: Application = express();
const port = 5309;
dotenv.config();

const mongoString = `mongodb+srv://${process.env.DB_USERNAME as string}:${
  process.env.DB_PASSWORD as string
}@nextavailableread.nkzxh.mongodb.net/NextAvailableRead?retryWrites=true&w=majority`;

connect(mongoString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {})
  .catch(() => {});

interface Shelf {
  _id: string;
  url: string;
  numberOfBooks: number;
  numberOfStoredBooks: number;
}

interface User {
  _id: string;
  shelves: Shelf[];
}

const ShelfSchema = new Schema<Shelf>({
  _id: String,
  url: String,
  numberOfBooks: Number,
  numberOfStoredBooks: Number,
});
const UserSchema = new Schema<User>({
  _id: String,
  shelves: [ShelfSchema],
});
const UserModel = model<User>("User", UserSchema);

app.use(cors({ origin: true }));
app.use(express.json());

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
        const newShelf: Shelf = {
          _id: text
            .substring(0, text.indexOf("("))
            .replace("\u200e", "")
            .trim()
            .toLowerCase(),
          url: `https://goodreads.com${link}&print=true`,
          numberOfBooks: parseInt(
            text.substring(text.indexOf("(") + 1, text.indexOf(")")),
            10
          ),
          numberOfStoredBooks: 0,
        };
        shelves.push(newShelf);
      });
      const newUser = new UserModel({ _id: userID, shelves });
      newUser
        .save()
        .then(() => {
          console.log("Saved!");
        })
        .catch((err) => console.log(err));
      res.status(200).send(shelves);
    })
    .catch(() => {
      res.status(404).send();
    });
});

app.listen(port, () => console.log(`Server is listening on port ${port}!`));

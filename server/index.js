"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express = require("express");
var axios_1 = require("axios");
var cheerio_1 = require("cheerio");
var cors_1 = require("cors");
var bluebird_1 = require("bluebird");
bluebird_1["default"].config({
    cancellation: true
});
var app = express();
var port = process.env.PORT || 5309;
app.use((0, cors_1["default"])({ origin: true }));
app.use(express.json());
app.get("/users/:userID/shelves", function (req, res) {
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        var userID, url, page, $, shelves, parseShelf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userID = req.params.userID;
                    url = "https://www.goodreads.com/review/list/" + userID;
                    return [4 /*yield*/, axios_1["default"].get(url)["catch"](function (err) {
                            console.log("Failed to get list of shelves.");
                            throw err;
                        })];
                case 1:
                    page = _a.sent();
                    $ = cheerio_1["default"].load(page.data);
                    shelves = [];
                    parseShelf = function (shelfLink) {
                        var text = shelfLink.text();
                        var link = shelfLink.attr("href");
                        var newShelf = {
                            name: text
                                .substring(0, text.indexOf("("))
                                .replace("\u200e", "")
                                .trim()
                                .toLowerCase(),
                            url: "https://goodreads.com" + link + "&print=true",
                            numberOfBooks: parseInt(text.substring(text.indexOf("(") + 1, text.indexOf(")")), 10)
                        };
                        return newShelf;
                    };
                    shelves.push(parseShelf($("#shelvesSection > a")));
                    $(".userShelf > a").each(function (_, e) {
                        shelves.push(parseShelf($(e)));
                    });
                    if (shelves.length === 0) {
                        throw new Error("You have no shelves!");
                    }
                    res.status(200).send(shelves);
                    return [2 /*return*/];
            }
        });
    }); })()["catch"](function (err) {
        console.log(err);
        res.status(404).send();
    });
});
var isAvailable = function (book, biblioCommonsPrefix) { return __awaiter(void 0, void 0, bluebird_1["default"], function () {
    var url, page, _a, $, $available;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                url = "https://" + biblioCommonsPrefix + ".bibliocommons.com/v2/search?query=(" + encodeURI("title:(" + book.title + ") AND contributor:(" + book.author + ")") + ")&searchType=bl&f_FORMAT=EBOOK";
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, axios_1["default"].get(url)];
            case 2:
                page = _b.sent();
                return [3 /*break*/, 4];
            case 3:
                _a = _b.sent();
                return [2 /*return*/, [false, ""]];
            case 4:
                $ = cheerio_1["default"].load(page.data);
                $available = $(".cp-search-result-item-content")
                    .first()
                    .find(".manifestation-item-format-call-wrap.available");
                if ($available.length > 0) {
                    return [2 /*return*/, [
                            true,
                            "https://" + biblioCommonsPrefix + ".bibliocommons.com" + $available.find("a").attr("href"),
                        ]];
                }
                return [2 /*return*/, [false, ""]];
        }
    });
}); };
app.get("/books", function (req, res) {
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        var url, numberOfBooksOnShelf, numberOfBooksRequested, biblioCommonsPrefix, headers, promises, i, result, booksFromShelf, i, j, bookPromises;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    url = req.query.url;
                    numberOfBooksOnShelf = parseInt(req.query.numberOfBooksOnShelf, 10);
                    numberOfBooksRequested = parseInt(req.query.numberOfBooksRequested, 10);
                    biblioCommonsPrefix = req.query.biblioCommonsPrefix;
                    console.log("Request made for " + numberOfBooksRequested + " books from " + biblioCommonsPrefix + ".");
                    headers = {
                        "Content-Type": "text/event-stream",
                        Connection: "keep-alive",
                        "Cache-Control": "no-transform"
                    };
                    res.writeHead(200, headers);
                    promises = [];
                    for (i = 1; i <= Math.ceil(numberOfBooksOnShelf / 20); i += 1) {
                        promises.push(axios_1["default"]
                            .get(url + "&page=" + i)
                            .then(function (page) {
                            var booksFromPage = [];
                            var $ = cheerio_1["default"].load(page.data);
                            $(".bookalike").each(function (_, e) {
                                var _a;
                                var $titleElem = $(e).find(".title").find(".value a");
                                var series = $titleElem.find("span").text();
                                var book = {
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
                                    pageCount: parseInt($(e)
                                        .find(".num_pages")
                                        .find(".value")
                                        .text()
                                        .replace(",", ""), 10),
                                    rating: parseFloat($(e).find(".avg_rating").find("div").text().toString()),
                                    goodreadsUrl: "https://goodreads.com" + $(e).find("a").attr("href"),
                                    imageUrl: (_a = $(e)
                                        .find("img")
                                        .attr("src")) === null || _a === void 0 ? void 0 : _a.toString().replace("SX50", "").replace("SY75", "").replace("_", "").replace("..", ".").replace(".jpg", "._SX318_.jpg")
                                };
                                booksFromPage.push(book);
                            });
                            return booksFromPage;
                        })["catch"](function (err) {
                            console.log("Couldn't retrieve shelf from Goodreads url.");
                            throw err;
                        }));
                    }
                    return [4 /*yield*/, bluebird_1["default"].all(promises)["catch"](function (err) {
                            throw err;
                        })];
                case 1:
                    result = _b.sent();
                    booksFromShelf = result.flat();
                    console.log("Goodreads books loaded.");
                    res.write("data: Goodreads found.\n\n");
                    // shuffle algorithm from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
                    for (i = booksFromShelf.length - 1; i > 0; i -= 1) {
                        j = Math.floor(Math.random() * (i + 1));
                        _a = [
                            booksFromShelf[j],
                            booksFromShelf[i],
                        ], booksFromShelf[i] = _a[0], booksFromShelf[j] = _a[1];
                    }
                    bookPromises = [];
                    booksFromShelf.forEach(function (book, i, arr) {
                        bookPromises.push(isAvailable(book, biblioCommonsPrefix)
                            .then(function (_a) {
                            var isIt = _a[0], link = _a[1];
                            if (isIt) {
                                console.log(link);
                                // eslint-disable-next-line no-param-reassign
                                arr[i].libraryUrl = link;
                                res.write("data: " + JSON.stringify(book) + "\n\n");
                                return book;
                            }
                            throw new Error("Book is not available.");
                        })["catch"](function (err) {
                            throw err;
                        }));
                    });
                    return [4 /*yield*/, bluebird_1["default"].some(bookPromises, numberOfBooksRequested)["catch"](function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, Promise.allSettled(bookPromises)];
                                    case 1:
                                        _a.sent();
                                        console.log("Not enough found.");
                                        return [2 /*return*/];
                                }
                            });
                        }); })["finally"](function () {
                            res.write("data: done here\n\n");
                            res.status(200).send();
                            res.end();
                        })];
                case 2:
                    _b.sent();
                    bookPromises.forEach(function (promise) { return promise.cancel(); });
                    return [2 /*return*/];
            }
        });
    }); })()["catch"](function (err) {
        console.log(err);
        res.write("data: error\n\n");
        res.status(404).send();
        res.end();
    });
});
// Endpoint for testing availability function
app.get("/availability", function (req, res) {
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, title, author, biblioCommonsPrefix, book, availability;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, title = _a.title, author = _a.author, biblioCommonsPrefix = _a.biblioCommonsPrefix;
                    book = {
                        title: title,
                        author: author,
                        pageCount: 0,
                        rating: 0,
                        goodreadsUrl: "",
                        imageUrl: ""
                    };
                    return [4 /*yield*/, isAvailable(book, biblioCommonsPrefix)];
                case 1:
                    availability = _b.sent();
                    res.status(200).send(availability);
                    return [2 /*return*/];
            }
        });
    }); })()["catch"](function (err) {
        console.log(err);
        res.status(404).send();
    });
});
app.listen(port, function () { return console.log("Server is listening on port " + port + "!"); });

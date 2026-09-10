const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username: username, password: password });
  return res
    .status(200)
    .json({ message: "User successfully registered. Now you can login" });
});

// Helper function to return local books as a Promise
const getBooksAsync = () => {
  return new Promise((resolve) => {
    resolve(books);
  });
};

// Task 10: Get all books using Async-Await / Promises
public_users.get("/", async function (req, res) {
  try {
    const bookList = await getBooksAsync();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching books list", error: error.message });
  }
});

// Task 11: Get book details based on ISBN using Promises
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  getBooksAsync()
    .then((bookList) => {
      if (bookList[isbn]) {
        return res.status(200).json(bookList[isbn]);
      } else {
        return res.status(404).json({ message: "Book not found" });
      }
    })
    .catch((error) => {
      return res
        .status(500)
        .json({ message: "Error fetching book details", error: error.message });
    });
});

// Task 12: Get book details based on Author using Async-Await
public_users.get("/author/:author", async function (req, res) {
  try {
    const authorParam = req.params.author.toLowerCase();
    const bookList = await getBooksAsync();
    const bookKeys = Object.keys(bookList);
    const matchingBooks = [];

    bookKeys.forEach((key) => {
      if (bookList[key].author.toLowerCase() === authorParam) {
        matchingBooks.push({ isbn: key, ...bookList[key] });
      }
    });

    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res
        .status(404)
        .json({ message: "No books found for this author" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Error fetching books by author",
        error: error.message,
      });
  }
});

// Task 13: Get book details based on Title using Promises
public_users.get("/title/:title", function (req, res) {
  const titleParam = req.params.title.toLowerCase();

  getBooksAsync()
    .then((bookList) => {
      const bookKeys = Object.keys(bookList);
      const matchingBooks = [];

      bookKeys.forEach((key) => {
        if (bookList[key].title.toLowerCase() === titleParam) {
          matchingBooks.push({ isbn: key, ...bookList[key] });
        }
      });

      if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
      } else {
        return res
          .status(404)
          .json({ message: "No books found with this title" });
      }
    })
    .catch((error) => {
      return res
        .status(500)
        .json({
          message: "Error fetching books by title",
          error: error.message,
        });
    });
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;

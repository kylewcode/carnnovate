require("dotenv").config();
const { HOST, USER, DB_PASSWORD, DB } = process.env;

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const cors = require("cors");
const app = express();
const port = 3000;
const mysql = require("mysql");

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/recipes", (req, res) => {
  const connection = mysql.createConnection({
    host: HOST,
    user: USER,
    password: DB_PASSWORD,
    database: DB,
  });

  connection.connect((error) => {
    if (error) {
      console.error("Error connecting to database:", error);
      return;
    }

    console.log("Connected to the database.");
  });

  const searchText = req.query.search;

  if (searchText === "") {
    const query = `
      SELECT * FROM recipes
      `;

    connection.query(query, [searchText], function (error, results) {
      if (error) throw error;
      res.send(results);
    });
  } else {
    const query = `
        SELECT *
        FROM recipes
        WHERE MATCH(title, ingredients, description) AGAINST (?)
        `;

    connection.query(query, [searchText], function (error, results) {
      if (error) throw error;
      res.send(results);
    });
  }

  connection.end();
});

app.post("/create", upload.none(), (req, res) => {
  const { title, description, ingredients, instructions, time } = req.body;

  const connection = mysql.createConnection({
    host: HOST,
    user: USER,
    password: DB_PASSWORD,
    database: DB,
  });

  connection.connect((error) => {
    if (error) {
      console.error("Error connecting to database:", error);
      return;
    }

    console.log("Connected to the database.");
  });

  const query = `
  INSERT INTO recipes (title, ingredients, description, time)
  VALUES (?, ?, ?, ?)
  `;

  const recipeAttributes = [title, description, ingredients, time];

  connection.query(query, recipeAttributes, function (error, results) {
    if (error) throw error;
    res.send(results);
  });

  connection.end();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

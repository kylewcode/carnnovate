const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const mysql = require("mysql");

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/recipes", cors(corsOptions), (req, res) => {
  const connection = mysql.createConnection({
    host: "qao3ibsa7hhgecbv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "mn3n4ptcd2yqgjpz",
    password: "yen2q6zo3a2xh8jr",
    database: "q1lkmt6yskjwxdz1",
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

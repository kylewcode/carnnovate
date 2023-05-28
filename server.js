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

app.get("/api", cors(corsOptions), (req, res) => {
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

  connection.query("SELECT * FROM recipes", function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });

  connection.end();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

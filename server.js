const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "qao3ibsa7hhgecbv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "mn3n4ptcd2yqgjpz",
  password: "yen2q6zo3a2xh8jr",
  database: "q1lkmt6yskjwxdz1",
});

connection.connect();

connection.query("SELECT 1 + 1 AS solution", function (error, results, fields) {
  if (error) throw error;
  console.log("The solution is: ", results[0].solution);
});

connection.end();

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api", cors(corsOptions), (req, res) => {
  const data = {
    one: 1,
    two: 2,
    three: 3,
  };

  res.send(data);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

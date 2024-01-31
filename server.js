require("dotenv").config();
const { appendToFile, clearFile } = require("./utils/fs");
const { HOST, USER, DB_PASSWORD, DB, LONG_RANDOM_STRING } = process.env;

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const cors = require("cors");
const app = express();
const port = 3000;
const mysql = require("mysql");
const session = require("express-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(
  session({
    secret: LONG_RANDOM_STRING,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
    },
  })
);

app.get("/", (req, res) => {
  req.session.username = "Kyle";
  res.send(`Hello ${req.session.username}`);
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

app.get("/auth", (req, res) => {
  if (req.session.user_id) {
    res.status(200).send({ isAuthorized: true });
  } else {
    res.status(401).send({ isAuthorized: false });
  }
});

app.get("/logout", upload.none(), (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      res
        .status(500)
        .send({ message: "Session data could not be destroyed.", error: err });
    } else {
      res.status(200).send({ message: "Session cleared." });
    }
  });
});

app.get("/get-user", (req, res) => {
  const username = req.session.username;
  const userId = req.session.user_id;

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
  SELECT recipe_id, title from recipes
  WHERE user_id="${userId}";
  `;

  connection.query(query, (error, results) => {
    if (error) throw error;

    res.status(200).send({ username: username, recipes: results });
  });

  connection.end();
});

app.get("/get-recipe-details/:recipeId", (req, res) => {
  console.log("Getting recipe details...");
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

  const recipeId = req.params.recipeId;
  const query = `
  SELECT * from recipes
  WHERE recipe_id = "${recipeId}";
  `;

  connection.query(query, (error, results) => {
    if (error) throw error;

    res.status(200).send(results[0]);
  });

  connection.end();
});

app.get("/get-comments/:recipeId", (req, res) => {
  console.log("Getting comments...");
  const recipeId = req.params.recipeId;
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

  const commentQuery = `
    SELECT comments.text, users.user_name FROM comments
    INNER JOIN users ON comments.user_id=users.user_id
    WHERE recipe_id = ?;
  `;

  const commentVariables = [recipeId];

  connection.query(commentQuery, commentVariables, (error, results) => {
    if (error) throw error;

    res.status(200).send(results);

    connection.end();
  });
});

app.get("/get-favorites/:recipeId", (req, res) => {
  console.log("Getting favorites...");
  const recipeId = req.params.recipeId;
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

  const favoriteQuery = `
    SELECT favorite_id FROM favorites
    WHERE recipe_id = ?;
  `;

  const favoriteVariables = [recipeId];

  connection.query(favoriteQuery, favoriteVariables, (error, results) => {
    if (error) throw error;

    res.status(200).send(results);
  });

  connection.end();
});

app.get("/favorite-recipe/:recipeId", (req, res) => {
  console.log("Favoriting recipe...");
  const recipeId = req.params.recipeId;
  const userId = req.session.user_id;

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
  INSERT INTO favorites (recipe_id, user_id) 
  VALUES (?, ?);
  `;

  const favoriteAttributes = [recipeId, userId];

  connection.query(query, favoriteAttributes, (error, results) => {
    if (error) throw error;

    res.status(200).send("Recipe favorited.");
  });

  connection.end();
});

app.get("/unfavorite-recipe/:recipeId", (req, res) => {
  console.log("Unfavoriting recipe...");
  const recipeId = req.params.recipeId;
  const userId = req.session.user_id;

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
  DELETE FROM favorites
  WHERE recipe_id = ? AND user_id = ?
  `;

  const unfavoriteAttributes = [recipeId, userId];

  connection.query(query, unfavoriteAttributes, (error, results) => {
    if (error) throw error;

    res.status(200).send("Recipe unfavorited.");
  });

  connection.end();
});

app.post("/register", upload.none(), (req, res) => {
  console.log("registering user...");

  const {
    "user-name": userName,
    email,
    "password-1": password1,
    "password-2": password2,
  } = req.body;

  if (password1 !== password2) {
    throw new Error({ message: "passwords do not match" });
  }

  bcrypt.hash(password1, saltRounds, function (err, hash) {
    if (err) {
      console.error(err);
    } else {
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
        INSERT INTO users (user_name, email, password)
        VALUES (?, ?, ?)
      `;

      const userAttributes = [userName, email, hash];

      connection.query(query, userAttributes, function (error, results) {
        if (error) throw error;
        res.send(results);
      });

      connection.end();
    }
  });
});

app.post("/login", upload.none(), (req, res) => {
  const { username, password } = req.body;

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
    SELECT * FROM users
    WHERE user_name = "${username}"
  `;

  connection.query(query, async function (error, results) {
    if (error) throw error;

    if (results.length !== 0) {
      const hash = results[0].password;
      const userId = results[0].user_id;
      const email = results[0].email;
      const isValidPassword = await bcrypt.compare(password, hash);

      if (isValidPassword) {
        req.session.user_id = userId;
        req.session.email = email;
        req.session.username = username;

        console.log(req.session);

        res.status(200).send({ message: "User logged in", isAuthorized: true });
      } else {
        res
          .status(200)
          .send({ message: "Password invalid", isAuthorized: false });
      }
    } else {
      res
        .status(200)
        .send({ message: "User does not exist.", isAuthorized: false });
    }
  });

  connection.end();
});

app.post("/create", upload.none(), (req, res) => {
  const { title, description, ingredients, instructions, time } = req.body;
  const userId = req.session.user_id;

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
  INSERT INTO recipes (user_id, title, description, ingredients, time, instructions)
  VALUES (?, ?, ?, ?, ?, ?)
  `;

  const recipeAttributes = [
    userId,
    title,
    description,
    ingredients,
    time,
    instructions,
  ];

  connection.query(query, recipeAttributes, function (error, results) {
    if (error) throw error;

    res.status(200).send("Recipe submitted");
  });

  connection.end();
});

app.post("/request-reset", upload.none(), (req, res) => {
  const email = req.body.email;

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
    SELECT * FROM users
    WHERE email = "${email}"
  `;

  connection.query(query, function (error, results) {
    if (error) throw error;

    if (results.length !== 0) {
      const stringToHash = String(results.user_id) + Date();
      const { user_id: userId } = results[0];

      bcrypt.hash(stringToHash, saltRounds, async function (err, hash) {
        if (err) throw err;

        const encodedHash = encodeURIComponent(hash).replaceAll(".", "");

        connection.query(
          "INSERT INTO tokens (token, user_id) VALUES (?,?)",
          [encodedHash, userId],
          function (error, results) {
            if (error) throw error;

            console.log("Encoded token stored successfully!");
          }
        );

        const link = `http://localhost:5173/password-reset/${encodedHash}`;

        // If local dev, populate text file with link.
        const filename = "password-reset-email-body.txt";
        await clearFile(filename);
        await appendToFile(filename, link);

        // If production, send email.
        res.status(200).send({ message: "Email sent!" });

        connection.end();
      });
    } else {
      res.status(200).send({ message: "Email does not exist in database." });

      connection.end();
    }
  });
});

app.post("/token-validation", express.text(), (req, res) => {
  // Token arrives decoded but is stored encoded.
  const encodedToken = encodeURIComponent(req.body);

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

  const query = `SELECT * FROM tokens WHERE token = "${encodedToken}"`;

  connection.query(query, function (error, results) {
    if (error) throw error;

    if (results.length !== 0) {
      res
        .status(200)
        .send({ message: "User is authorized", isAuthorized: true });
    } else {
      res.status(401).send("User not authorized.");
    }
  });

  connection.end();
});

app.post("/reset-password", upload.none(), (req, res) => {
  const {
    password,
    "password-confirmation": passwordConfirmation,
    token,
  } = req.body;

  if (password !== passwordConfirmation) {
    throw new Error({ message: "Passwords do not match." });
  }

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

  connection.query(
    `SELECT * from tokens WHERE token="${encodeURIComponent(token)}"`,
    function (error, results) {
      if (error) throw error;

      if (results.length === 0) {
        throw new Error({ message: "Token not found" });
      }

      const userId = results[0].user_id;

      bcrypt.hash(password, saltRounds, function (error, hash) {
        const updatePasswordQuery = `
        UPDATE users
        SET password = '${hash}' 
        WHERE user_id = '${userId}';
        `;

        connection.query(updatePasswordQuery, function (error, results) {
          if (error) throw error;

          console.log(
            `Password updated for user with id ${userId}`,
            results.message
          );
        });

        const deleteTokenQuery = `
        DELETE FROM tokens
        WHERE token = "${encodeURIComponent(token)}";
        `;

        connection.query(deleteTokenQuery, function (error, results) {
          if (error) throw error;

          console.log(`Token ${encodeURIComponent(token)} deleted`);

          res.status(200).send("Password updated.");

          connection.end();
        });
      });
    }
  );
});

app.post("/update-recipe/:recipeId", upload.none(), (req, res) => {
  const { title, ingredients, description, time, instructions } = req.body;
  const { recipeId } = req.params;

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
  UPDATE recipes 
  SET title = ?, 
  ingredients = ?, 
  description = ?, 
  time = ?, 
  instructions = ? 
  WHERE (recipe_id = ?);
  `;

  const recipeDetails = [
    title,
    ingredients,
    description,
    time,
    instructions,
    recipeId,
  ];

  connection.query(query, recipeDetails, (error, results) => {
    if (error) throw error;

    res.status(200).send("Recipe updated.");
  });

  connection.end();
});

app.post("/add-comment/:recipeId", upload.none(), (req, res) => {
  console.log("Submitting comment...");

  const recipeId = req.params.recipeId;
  const userId = req.session.user_id;
  const text = req.body.comment;

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
    INSERT INTO comments (recipe_id, user_id, text)
    VALUES (?, ?, ?);
  `;
  const commentDetails = [recipeId, userId, text];

  connection.query(query, commentDetails, (error, results) => {
    if (error) throw error;

    res.status(200).send("Comment added.");
  });

  connection.end();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

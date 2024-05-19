require("dotenv").config();
const path = require("path");
const { appendToFile, clearFile } = require("./utils/fs");
const { HOST, USER, DB_PASSWORD, DB, LONG_RANDOM_STRING } = process.env;
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const mysql = require("mysql");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const isProduction = app.get("env") === "production";
console.log("Environment is production: ", isProduction);
isProduction ? app.set("trust proxy", 1) : null;
// Production preview
// const domain = "http://localhost:4173";
// Deployment and development
const domain = isProduction
  ? "https://carnnovate-4fb4882151ae.herokuapp.com"
  : "http://localhost:5173";

const poolOptions = {
  connectionLimit: 10,
  host: HOST,
  user: USER,
  password: DB_PASSWORD,
  database: DB,
};
const pool = mysql.createPool(poolOptions);

const storeOptions = {
  host: HOST,
  port: 3306,
  user: USER,
  password: DB_PASSWORD,
  database: DB,
};
const sessionStore = new MySQLStore(storeOptions, pool);

sessionStore
  .onReady()
  .then(() => console.log("MySQLStore ready"))
  .catch((error) => console.error(error));

const bcrypt = require("bcrypt");
const saltRounds = 10;

const corsOptions = {
  origin: domain,
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

app.use(
  session({
    secret: LONG_RANDOM_STRING,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction ? true : false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: isProduction ? "none" : "lax",
    },
  })
);

app.get("/api", (req, res) => {
  res.send(`Hello World`);
});

app.get("/api/get-username", (req, res) => {
  const username = req.session.username;
  res.status(200).send({ user_name: username });
});

app.get("/api/recipes", (req, res) => {
  const searchText = req.query.search;

  if (searchText === "") {
    const query = `
      SELECT * FROM recipes
      `;

    pool.query(query, [searchText], function (error, results) {
      if (error) throw error;
      res.send(results);
    });
  } else {
    const query = `
        SELECT *
        FROM recipes
        WHERE MATCH(title, ingredients, description) AGAINST (?)
        `;

    pool.query(query, [searchText], function (error, results) {
      if (error) throw error;
      res.send(results);
    });
  }
});

app.get("/api/auth", (req, res) => {
  if (req.session.user_id) {
    res.status(200).send({ isAuthorized: true });
  } else {
    res.status(401).send({ isAuthorized: false });
  }
});

app.get("/api/logout", (req, res) => {
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

app.get("/api/get-user", (req, res) => {
  const username = req.session.username;
  const userId = req.session.user_id;
  const recipeQuery = `
  SELECT recipe_id, title from recipes
  WHERE user_id = ?;
  `;
  const recipeVars = [userId];

  pool.query(recipeQuery, recipeVars, (error, results) => {
    if (error) throw error;

    const recipeResults = results;
    const favoritesQuery = `
    SELECT f.recipe_id, r.title FROM favorites AS f
    RIGHT JOIN recipes AS r ON f.recipe_id = r.recipe_id
    WHERE f.user_id = ?;
    `;
    const favoritesVars = [userId];

    pool.query(favoritesQuery, favoritesVars, (error, results) => {
      if (error) throw error;

      const favoritesResults = results;

      res.status(200).send({
        username: username,
        recipes: recipeResults,
        favorites: favoritesResults,
      });
    });
  });
});

app.get("/api/get-recipe-details/:recipeId", (req, res) => {
  const recipeId = req.params.recipeId;
  const query = `
  SELECT * from recipes
  WHERE recipe_id = "${recipeId}";
  `;

  pool.query(query, (error, results) => {
    if (error) throw error;

    res.status(200).send(results[0]);
  });
});

app.get("/api/get-comments/:recipeId", (req, res) => {
  const recipeId = req.params.recipeId;
  const commentQuery = `
    SELECT comments.text, users.user_name FROM comments
    INNER JOIN users ON comments.user_id=users.user_id
    WHERE recipe_id = ?;
  `;
  const commentVariables = [recipeId];

  pool.query(commentQuery, commentVariables, (error, results) => {
    if (error) throw error;

    res.status(200).send(results);
  });
});

app.get("/api/get-favorites/:recipeId", (req, res) => {
  const recipeId = req.params.recipeId;
  const favoriteQuery = `
  SELECT COUNT(*) AS count FROM favorites
  WHERE recipe_id = ?;
  `;
  const favoriteVariables = [recipeId];

  pool.query(favoriteQuery, favoriteVariables, (error, results) => {
    if (error) throw error;

    const favorites = results;

    if (req.session.user_id) {
      const userId = req.session.user_id;
      const checkUserQuery = `
      SELECT favorite_id FROM favorites
      WHERE user_id = ? AND recipe_id = ?
      `;
      const checkUserVariables = [userId, recipeId];
      let userHasFavorited = false;

      pool.query(checkUserQuery, checkUserVariables, (error, results) => {
        if (error) throw error;

        if (results.length !== 0) {
          userHasFavorited = true;
        }
        res.status(200).send({
          favoriteCount: favorites[0].count,
          favorited: userHasFavorited,
        });
      });
    } else {
      res
        .status(200)
        .send({ favoriteCount: favorites[0].count, favorited: null });
    }
  });
});

app.get("/api/favorite-recipe/:recipeId", (req, res) => {
  const recipeId = req.params.recipeId;
  const userId = req.session.user_id;
  const query = `
  INSERT INTO favorites (recipe_id, user_id) 
  VALUES (?, ?);
  `;
  const favoriteAttributes = [recipeId, userId];

  pool.query(query, favoriteAttributes, (error, results) => {
    if (error) throw error;

    res.status(200).send("Recipe favorited.");
  });
});

app.get("/api/unfavorite-recipe/:recipeId", (req, res) => {
  const recipeId = req.params.recipeId;
  const userId = req.session.user_id;
  const query = `
  DELETE FROM favorites
  WHERE recipe_id = ? AND user_id = ?
  `;
  const unfavoriteAttributes = [recipeId, userId];

  pool.query(query, unfavoriteAttributes, (error, results) => {
    if (error) throw error;

    res.status(200).send("Recipe unfavorited.");
  });
});

app.get("/api/get-votes/:recipeId", (req, res) => {
  const recipeId = req.params.recipeId;
  const voteQuery = `
  SELECT COUNT(*) AS count FROM votes
  WHERE recipe_id=?
  `;
  const voteVariables = [recipeId];

  pool.query(voteQuery, voteVariables, (error, results) => {
    if (error) throw error;

    const votes = results;

    if (req.session.user_id) {
      const userId = req.session.user_id;
      const checkUserQuery = `
      SELECT vote_id FROM votes
      WHERE user_id = ? AND recipe_id = ?
      `;
      const checkUserVariables = [userId, recipeId];
      let userHasVoted = false;

      pool.query(checkUserQuery, checkUserVariables, (error, results) => {
        if (error) throw error;

        if (results.length !== 0) {
          userHasVoted = true;
        }

        res.status(200).send({
          voteCount: votes[0].count,
          voted: userHasVoted,
        });
      });
    } else {
      res.status(200).send({
        voteCount: votes[0].count,
        voted: null,
      });
    }
  });
});

app.get("/api/vote/:recipeId", (req, res) => {
  const recipeId = req.params.recipeId;
  const userId = req.session.user_id;
  const query = `
  INSERT INTO votes (recipe_id, user_id)
  VALUES (?, ?)
  `;
  const variables = [recipeId, userId];

  pool.query(query, variables, (error, results) => {
    if (error) throw error;

    res.status(200).send("Recipe voted on");
  });
});

app.get("/api/unvote/:recipeId", (req, res) => {
  const recipeId = req.params.recipeId;
  const userId = req.session.user_id;
  const query = `
  DELETE FROM votes
  WHERE recipe_id = ? AND user_id = ?
  `;
  const variables = [recipeId, userId];

  pool.query(query, variables, (error, results) => {
    if (error) throw error;

    res.status(200).send("Vote removed");
  });
});

app.post("/api/register", upload.none(), (req, res) => {
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
      const query = `
        INSERT INTO users (user_name, email, password)
        VALUES (?, ?, ?)
      `;
      const userAttributes = [userName, email, hash];

      pool.query(query, userAttributes, function (error, results) {
        if (error) throw error;
        res.send(results);
      });
    }
  });
});

app.post("/api/login", upload.none(), (req, res) => {
  const { username, password } = req.body;
  const query = `
    SELECT * FROM users
    WHERE user_name = "${username}"
  `;

  pool.query(query, async function (error, results) {
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

        console.log("Session created: ", req.session);

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
});

app.post("/api/create", upload.none(), (req, res) => {
  const { title, description, ingredients, instructions, time } = req.body;
  const userId = req.session.user_id;
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

  pool.query(query, recipeAttributes, function (error, results) {
    if (error) throw error;

    res.status(200).send("Recipe submitted");
  });
});

app.post("/api/request-reset", upload.none(), (req, res) => {
  const email = req.body.email;
  const query = `
    SELECT * FROM users
    WHERE email = "${email}"
  `;

  pool.query(query, (error, results) => {
    if (error) throw error;

    if (results.length !== 0) {
      const stringToHash = String(results.user_id) + Date();
      const { user_id: userId } = results[0];

      bcrypt.hash(stringToHash, saltRounds, (err, hash) => {
        if (err) throw err;

        pool.query(
          "DELETE from tokens WHERE user_id = ?",
          [userId],
          (error, results) => {
            if (error) throw error;

            console.log("Deleted token for user.");
            const encodedHash = encodeURIComponent(hash).replaceAll(".", "");

            pool.query(
              "INSERT INTO tokens (token, user_id) VALUES (?,?)",
              [encodedHash, userId],
              async (error, results) => {
                if (error) throw error;

                console.log("Encoded token stored successfully!");
                const link = `${domain}/password-reset/${encodedHash}`;

                // If local dev, populate text file with link.
                const filename = "password-reset-email-body.txt";
                await clearFile(filename);
                await appendToFile(filename, link);
                // If production, send email.
                res.status(200).send({ message: "Email sent!" });
              }
            );
          }
        );
      });
    } else {
      res.status(200).send({ message: "Email does not exist in database." });
    }
  });
});

app.post("/api/token-validation", express.text(), (req, res) => {
  const encodedToken = encodeURIComponent(req.body);
  const query = `SELECT * FROM tokens WHERE token = "${encodedToken}"`;

  pool.query(query, function (error, results) {
    if (error) throw error;

    if (results.length !== 0) {
      res
        .status(200)
        .send({ message: "User is authorized", isAuthorized: true });
    } else {
      res.status(401).send("User not authorized.");
    }
  });
});

app.post("/api/reset-password", upload.none(), (req, res) => {
  const {
    password,
    "password-confirmation": passwordConfirmation,
    token,
  } = req.body;

  if (password !== passwordConfirmation) {
    throw new Error({ message: "Passwords do not match." });
  }

  pool.query(
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

        pool.query(updatePasswordQuery, function (error, results) {
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

        pool.query(deleteTokenQuery, function (error, results) {
          if (error) throw error;

          console.log(`Token ${encodeURIComponent(token)} deleted`);

          res.status(200).send("Password updated.");
        });
      });
    }
  );
});

app.post("/api/update-recipe/:recipeId", upload.none(), (req, res) => {
  const { title, ingredients, description, time, instructions } = req.body;
  const { recipeId } = req.params;
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

  pool.query(query, recipeDetails, (error, results) => {
    if (error) throw error;

    res.status(200).send("Recipe updated.");
  });
});

app.post("/api/add-comment/:recipeId", upload.none(), (req, res) => {
  const recipeId = req.params.recipeId;
  const userId = req.session.user_id;
  const text = req.body.comment;
  const query = `
    INSERT INTO comments (recipe_id, user_id, text)
    VALUES (?, ?, ?);
  `;
  const commentDetails = [recipeId, userId, text];

  pool.query(query, commentDetails, (error, results) => {
    if (error) throw error;

    res.status(200).send("Comment added.");
  });
});

if (isProduction) {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..client/dist/index.html"));
  });
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

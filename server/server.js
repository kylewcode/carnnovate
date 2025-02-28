import "dotenv/config";
import path from "path";
import { appendToFile, clearFile, openFileHandle } from "./utils/fs.js";
import crypto from "crypto";
const createUUID = crypto.randomUUID;
const { HOST, APP_USER, DB_PASSWORD, DB, LONG_RANDOM_STRING, BUCKET_NAME } =
  process.env;
import express from "express";
import session from "express-session";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
const app = express();
const port = process.env.PORT || 3001;

import mysql from "mysql2/promise";
const poolOptions = {
  connectionLimit: 10,
  host: HOST,
  user: APP_USER,
  password: DB_PASSWORD,
  database: DB,
};
const pool = mysql.createPool(poolOptions);

import expressMysqlSession from "express-mysql-session";
const MySQLStore = expressMysqlSession(session);
const storeOptions = {
  host: HOST,
  port: 3306,
  user: APP_USER,
  password: DB_PASSWORD,
  database: DB,
};
const sessionStore = new MySQLStore(storeOptions, pool);

sessionStore
  .onReady()
  .then(() => console.log("Session store ready."))
  .catch((error) => console.error(error));

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
const s3Client = new S3Client({});
import { Upload } from "@aws-sdk/lib-storage";

const isProduction = app.get("env") === "production";

console.log("Environment is production: ", isProduction);

isProduction ? app.set("trust proxy", 1) : null;
// Production preview
// const domain = "http://localhost:4173";
// Deployment and development
const domain = isProduction
  ? "https://carnnovate-4fb4882151ae.herokuapp.com"
  : "http://localhost:5173";

const imageCDNurl = "https://d3db7jqhdyx8x1.cloudfront.net/";

import bcrypt from "bcrypt";
const saltRounds = 10;

import cors from "cors";
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
  try {
    const username = req.session.username;

    res.status(200).send({ user_name: username });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/recipes", async (req, res) => {
  const searchText = req.query.search;

  if (searchText === "") {
    try {
      const searchQuery = `
        SELECT * FROM recipes
        `;
      const [searchQueryResults] = await pool.execute(searchQuery);

      res.send(searchQueryResults);
    } catch (error) {
      console.error(error);

      res.status(500).json({ error: "Internal server error." });
    }
  } else {
    try {
      const searchQuery = `
        SELECT *
        FROM recipes
        WHERE MATCH(title, ingredients, description) AGAINST (?)
        `;
      const [searchQueryResults] = await pool.execute(searchQuery, [
        searchText,
      ]);

      res.send(searchQueryResults);
    } catch (error) {
      console.error(error);

      res.status(500).json({ error: "Internal server error." });
    }
  }
});

app.get("/api/auth", (req, res) => {
  try {
    if (req.session.user_id) {
      res.status(200).send({ isAuthorized: true });
    } else {
      res.status(401).send({ isAuthorized: false });
    }
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/logout", (req, res) => {
  try {
    req.session.destroy(function (error) {
      if (error) throw error;

      res.status(200).send({ message: "Session cleared." });
    });
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Session data could not be destroyed.",
      error: error,
    });
  }
});

app.get("/api/get-user", async (req, res) => {
  try {
    const username = req.session.username;
    const userId = req.session.user_id;
    const recipeQuery = `
      SELECT recipe_id, title from recipes
      WHERE user_id = ?;
      `;
    const recipeVars = [userId];
    const favoritesQuery = `
      SELECT f.recipe_id, r.title FROM favorites AS f
      RIGHT JOIN recipes AS r ON f.recipe_id = r.recipe_id
      WHERE f.user_id = ?;
      `;
    const favoritesVars = [userId];
    const [recipeQueryResults] = await pool.execute(recipeQuery, recipeVars);
    const [favoritesQueryResults] = await pool.execute(
      favoritesQuery,
      favoritesVars
    );

    res.status(200).send({
      username: username,
      recipes: recipeQueryResults,
      favorites: favoritesQueryResults,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/get-recipe-details/:recipeId", async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const recipeQuery = `
      SELECT * from recipes
      WHERE recipe_id = ?;
      `;

    const [recipeQueryResults] = await pool.execute(recipeQuery, [recipeId]);

    res.status(200).send({
      details: recipeQueryResults[0],
      isFound: recipeQueryResults.length > 0,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/get-comments/:recipeId", async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const commentQuery = `
      SELECT comments.text, users.user_name FROM comments
      INNER JOIN users ON comments.user_id=users.user_id
      WHERE recipe_id = ?;
      `;
    const commentVars = [recipeId];
    const [commentQueryResults] = await pool.execute(commentQuery, commentVars);

    res.status(200).send(commentQueryResults);
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/get-favorites/:recipeId", async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const favoriteQuery = `
      SELECT COUNT(*) AS count FROM favorites
      WHERE recipe_id = ?;
      `;
    const favoriteVars = [recipeId];
    const [favoriteQueryResults] = await pool.execute(
      favoriteQuery,
      favoriteVars
    );

    if (req.session.user_id) {
      const userId = req.session.user_id;
      const checkUserQuery = `
        SELECT favorite_id FROM favorites
        WHERE user_id = ? AND recipe_id = ?
        `;
      const checkUserVars = [userId, recipeId];
      const [checkUserQueryResults] = await pool.execute(
        checkUserQuery,
        checkUserVars
      );

      res.status(200).send({
        favoriteCount: favoriteQueryResults[0].count,
        favorited: checkUserQueryResults.length > 0,
      });
    } else {
      res.status(200).send({
        favoriteCount: favoriteQueryResults[0].count,
        favorited: null,
      });
    }
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/favorite-recipe/:recipeId", async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const userId = req.session.user_id;
    const favoriteQuery = `
      INSERT INTO favorites (recipe_id, user_id) 
      VALUES (?, ?);
      `;
    const favoriteVars = [recipeId, userId];

    await pool.execute(favoriteQuery, favoriteVars);

    res.status(200).send("Recipe favorited.");
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/unfavorite-recipe/:recipeId", async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const userId = req.session.user_id;
    const unfavoriteQuery = `
      DELETE FROM favorites
      WHERE recipe_id = ? AND user_id = ?
      `;
    const unfavoriteVars = [recipeId, userId];

    await pool.execute(unfavoriteQuery, unfavoriteVars);

    res.status(200).send("Recipe unfavorited.");
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/get-votes/:recipeId", async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const voteQuery = `
      SELECT COUNT(*) AS count FROM votes
      WHERE recipe_id=?
      `;
    const voteVars = [recipeId];
    const [voteResults] = await pool.execute(voteQuery, voteVars);

    if (req.session.user_id) {
      const userId = req.session.user_id;
      const checkUserQuery = `
        SELECT vote_id FROM votes
        WHERE user_id = ? AND recipe_id = ?
        `;
      const checkUserVars = [userId, recipeId];
      const [checkUserQueryResults] = await pool.execute(
        checkUserQuery,
        checkUserVars
      );

      res.status(200).send({
        voteCount: voteResults[0].count,
        voted: checkUserQueryResults.length > 0,
      });
    } else {
      res.status(200).send({
        voteCount: voteResults[0].count,
        voted: null,
      });
    }
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/vote/:recipeId", async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const userId = req.session.user_id;
    const voteQuery = `
      INSERT INTO votes (recipe_id, user_id)
      VALUES (?, ?)
      `;
    const voteVars = [recipeId, userId];
    await pool.execute(voteQuery, voteVars);

    res.status(200).send("Recipe voted on");
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/unvote/:recipeId", async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const userId = req.session.user_id;
    const unvoteQuery = `
      DELETE FROM votes
      WHERE recipe_id = ? AND user_id = ?
      `;
    const unvoteVars = [recipeId, userId];
    await pool.execute(unvoteQuery, unvoteVars);

    res.status(200).send("Vote removed");
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/register", upload.none(), (req, res) => {
  try {
    const {
      "user-name": userName,
      email,
      "password-1": password1,
      "password-2": password2,
    } = req.body;

    if (password1 !== password2) {
      throw new Error({ message: "passwords do not match" });
    }

    bcrypt.hash(password1, saltRounds, async function (error, hash) {
      if (error) throw error;

      const registerQuery = `
        INSERT INTO users (user_name, email, password)
        VALUES (?, ?, ?)
        `;
      const registerVars = [userName, email, hash];
      const [registerQueryResults] = await pool.execute(
        registerQuery,
        registerVars
      );

      res.send(registerQueryResults);
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/login", upload.none(), async (req, res) => {
  try {
    const { username, password } = req.body;
    const loginQuery = `
      SELECT * FROM users
      WHERE user_name = ?
      `;
    const loginVars = [username];
    const [loginQueryResults] = await pool.execute(loginQuery, loginVars);

    if (loginQueryResults.length > 0) {
      const hash = loginQueryResults[0].password;
      const userId = loginQueryResults[0].user_id;
      const email = loginQueryResults[0].email;
      const isValidPassword = await bcrypt.compare(password, hash);

      if (isValidPassword) {
        req.session.user_id = userId;
        req.session.email = email;
        req.session.username = username;

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
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/create", upload.none(), async (req, res) => {
  try {
    const {
      title,
      description,
      ingredients,
      instructions,
      time,
      image: locationId,
    } = req.body;
    const { user_id: userId } = req.session;

    // If user has uploaded an image
    if (locationId !== undefined) {
      const tempImageQuery = `
        SELECT s3_object_key, original_filename FROM temp_images
        WHERE unique_id = ?;
        `;
      const tempImageVars = [locationId];
      const [tempImageQueryResults] = await pool.execute(
        tempImageQuery,
        tempImageVars
      );
      const { s3_object_key: tempImgKey, original_filename: originalFileName } =
        tempImageQueryResults[0];
      const finalImgKey = `user_${userId}_final-image_${originalFileName}_${Date.now()}`;
      const tempImgRes = await s3Client.send(
        new GetObjectCommand({ Bucket: BUCKET_NAME, Key: tempImgKey })
      );
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: BUCKET_NAME,
          Key: finalImgKey,
          Body: tempImgRes.Body,
        },
      });

      await upload.done();

      console.log("File uploaded to S3: ", finalImgKey);

      const deleteTempImgQuery = `
        DELETE from temp_images 
        WHERE unique_id = ?;
        `;
      const deleteTempImgVars = [locationId];

      await pool.execute(deleteTempImgQuery, deleteTempImgVars);

      await s3Client.send(
        new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: tempImgKey })
      );

      const createQuery = `
        INSERT INTO recipes (user_id, title, description, ingredients, time, instructions, image)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
      const image = imageCDNurl + finalImgKey;
      const createVars = [
        userId,
        title,
        description,
        ingredients,
        time,
        instructions,
        image,
      ];

      await pool.execute(createQuery, createVars);

      res.status(200).send("Recipe submitted");
    } else {
      const createQuery = `
        INSERT INTO recipes (user_id, title, description, ingredients, time, instructions)
        VALUES (?, ?, ?, ?, ?, ?)
        `;
      const createVars = [
        userId,
        title,
        description,
        ingredients,
        time,
        instructions,
      ];

      await pool.execute(createQuery, createVars);

      res.status(200).send("Recipe submitted");
    }
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/request-reset", upload.none(), async (req, res) => {
  try {
    const email = req.body.email;
    const passwordResetQuery = `
    SELECT * FROM users
    WHERE email = ?
    `;
    const passwordResetVars = [email];
    const [passwordResetQueryResults] = await pool.execute(
      passwordResetQuery,
      passwordResetVars
    );

    if (passwordResetQueryResults.length > 0) {
      const stringToHash = String(passwordResetQueryResults.user_id) + Date();
      const { user_id: userId } = passwordResetQueryResults[0];

      bcrypt.hash(stringToHash, saltRounds, async (error, hash) => {
        if (error) throw error;

        const deleteTokenQuery = `
        DELETE from tokens 
        WHERE user_id = ?
        `;
        const deleteTokenVars = [userId];

        await pool.execute(deleteTokenQuery, [deleteTokenVars]);

        console.log("Deleted token for user id: ", userId);

        const encodedHash = encodeURIComponent(hash).replaceAll(".", "");
        const insertTokenQuery = `
        INSERT INTO tokens (token, user_id) 
        VALUES (?,?)
        `;
        const insertTokenVars = [encodedHash, userId];

        await pool.execute(insertTokenQuery, insertTokenVars);

        console.log("Encoded token stored successfully for user id: ", userId);

        const link = `${domain}/password-reset/${encodedHash}`;

        // TODO: If local dev, populate text file with link.
        const filename = "password-reset-email-body.txt";
        await clearFile(filename);
        await appendToFile(filename, link);
        // TODO: If production, send email.
        res.status(200).send({ message: "Email sent!" });
      });
    } else {
      res.status(200).send({ message: "Email does not exist in database." });
    }
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/token-validation", express.text(), async (req, res) => {
  try {
    const encodedToken = encodeURIComponent(req.body);
    const tokenValidationQuery = `
      SELECT * FROM tokens 
      WHERE token = ?
      `;
    const tokenValidationVars = [encodedToken];
    const [tokenValidationResults] = await pool.execute(
      tokenValidationQuery,
      tokenValidationVars
    );

    if (tokenValidationResults.length > 0) {
      res
        .status(200)
        .send({ message: "User is authorized", isAuthorized: true });
    } else {
      res.status(401).send("User not authorized.");
    }
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error." });
  }
});
// Continue here
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
  const {
    title,
    ingredients,
    description,
    time,
    instructions,
    image: locationId,
    old_image_url: oldImageURL,
  } = req.body;
  const { recipeId } = req.params;

  if (locationId !== undefined) {
    const tempImageQuery = `SELECT s3_object_key, original_filename FROM temp_images
                        WHERE unique_id = ?;`;
    const tempImageVars = [locationId];

    pool.query(
      tempImageQuery,
      tempImageVars,
      async (tempImageError, tempImageResults) => {
        if (tempImageError) throw tempImageError;

        try {
          const {
            s3_object_key: tempImgKey,
            original_filename: originalFileName,
          } = tempImageResults[0];

          const { user_id: userId } = req.session;
          const bucketName = BUCKET_NAME;
          const finalImgKey = `user_${userId}_final-image_${originalFileName}_${Date.now()}`;
          const tempImgRes = await s3Client.send(
            new GetObjectCommand({ Bucket: bucketName, Key: tempImgKey })
          );

          const upload = new Upload({
            client: s3Client,
            params: {
              Bucket: bucketName,
              Key: finalImgKey,
              Body: tempImgRes.Body,
            },
          });

          await upload.done();

          const deleteTempImgQuery = `DELETE from temp_images WHERE unique_id = ?;`;
          const deleteTempImgVars = [locationId];

          pool.query(
            deleteTempImgQuery,
            deleteTempImgVars,
            async (deleteTempImgError, deleteTempImgResults) => {
              if (deleteTempImgError) throw deleteTempImgError;

              await s3Client.send(
                new DeleteObjectCommand({ Bucket: bucketName, Key: tempImgKey })
              );

              const index = oldImageURL.search(".net/") + 5;
              const oldImageKey = oldImageURL.slice(index);

              await s3Client.send(
                new DeleteObjectCommand({
                  Bucket: bucketName,
                  Key: oldImageKey,
                })
              );

              const updateQuery = `
              UPDATE recipes
              SET title = ?,
              ingredients = ?,
              description = ?,
              time = ?,
              instructions = ?,
              image = ?
              WHERE (recipe_id = ?);
            `;
              const image = imageCDNurl + finalImgKey;
              const updateVars = [
                title,
                ingredients,
                description,
                time,
                instructions,
                image,
                recipeId,
              ];

              pool.query(
                updateQuery,
                updateVars,
                (updateError, updateResults) => {
                  if (updateError) throw updateError;

                  res.status(200).send("Recipe updated.");
                }
              );
            }
          );
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: "Internal server error" });
        }
      }
    );
  } else {
    const updateQuery = `
        UPDATE recipes
        SET title = ?,
        ingredients = ?,
        description = ?,
        time = ?,
        instructions = ?
        WHERE (recipe_id = ?);
        `;
    const updateVars = [
      title,
      ingredients,
      description,
      time,
      instructions,
      recipeId,
    ];

    pool.query(updateQuery, updateVars, (updateError, updateResults) => {
      if (updateError) throw updateError;

      res.status(200).send("Recipe updated.");
    });
  }
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

app.post("/api/upload-images", upload.single("image"), async (req, res) => {
  try {
    const { path, originalname: originalName } = req.file;
    const { user_id: userId } = req.session;
    const bucketName = BUCKET_NAME;
    const key = `user_${userId}_temp-image_${originalName}_${Date.now()}`;
    const fileHandle = await openFileHandle(path, "r");
    const readStream = fileHandle.createReadStream();

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: readStream,
      })
    );

    console.log("File uploaded to S3: ", key);

    await fileHandle.close();

    const uniqueID = createUUID();
    const query = `INSERT INTO temp_images (unique_id, s3_object_key, original_filename)
                     VALUES (?, ?, ?);`;
    const queryVars = [uniqueID, key, originalName];

    pool.query(query, queryVars, (error, results) => {
      if (error) throw error;

      res.set("Content-Type", "text/plain");
      res.status(200).send(uniqueID);
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

app.delete("/api/delete-recipe/:recipeId", (req, res) => {
  const recipeId = req.params.recipeId;
  const bucketName = BUCKET_NAME;
  const imageURLquery = `SELECT image FROM recipes WHERE recipe_id = ?`;
  const imageURLvars = [recipeId];

  pool.query(imageURLquery, imageURLvars, async (error, results) => {
    if (error) throw error;

    const { image } = results[0];

    if (image !== null) {
      const index = image.search(".net/") + 5;
      const oldKey = image.slice(index);

      await s3Client.send(
        new DeleteObjectCommand({ Bucket: bucketName, Key: oldKey })
      );

      const query = `DELETE FROM recipes WHERE recipe_id = ?`;

      pool.query(query, recipeId, (error, results) => {
        if (error) throw error;

        res.status(200).send({ message: `Recipe of id ${recipeId} deleted.` });
      });
    } else {
      const query = `DELETE FROM recipes WHERE recipe_id = ?`;

      pool.query(query, recipeId, (error, results) => {
        if (error) throw error;

        res.status(200).send({ message: `Recipe of id ${recipeId} deleted.` });
      });
    }
  });
});

if (isProduction) {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

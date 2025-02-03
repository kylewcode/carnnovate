require("dotenv").config();
const path = require("path");
const {
  appendToFile,
  clearFile,
  openFileHandle,
  deleteTempFile,
  checkFileDeletion,
  createReadStream,
} = require("./utils/fs");
const crypto = require("crypto");
const createUUID = crypto.randomUUID;
const { HOST, APP_USER, DB_PASSWORD, DB, LONG_RANDOM_STRING, BUCKET_NAME } =
  process.env;
const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const mysql = require("mysql");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const s3Client = new S3Client({});
const { Upload } = require("@aws-sdk/lib-storage");

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

const poolOptions = {
  connectionLimit: 10,
  host: HOST,
  user: APP_USER,
  password: DB_PASSWORD,
  database: DB,
};
const pool = mysql.createPool(poolOptions);

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
  .then(() => console.log("MySQLStore ready"))
  .catch((error) => console.error(error));

const bcrypt = require("bcrypt");
const { type } = require("os");
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
      res.status(500).send({
        message: "Session data could not be destroyed.",
        error: err,
      });
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

    res.status(200).send({ details: results[0], isFound: results.length > 0 });
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
  const {
    title,
    description,
    ingredients,
    instructions,
    time,
    image: locationId,
  } = req.body;
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
          s3_object_key: originalKey,
          original_filename: originalFileName,
        } = tempImageResults[0];

        const bucketName = BUCKET_NAME;
        const objectResponse = await s3Client.send(
          new GetObjectCommand({ Bucket: bucketName, Key: originalKey })
        );
        const { user_id: userId } = req.session;
        const key = `user_${userId}_final-image_${originalFileName}_${Date.now()}`;

        const upload = new Upload({
          client: s3Client,
          params: { Bucket: bucketName, Key: key, Body: objectResponse.Body },
        });

        await upload.done();

        console.log("File uploaded to S3: ", key);

        const deleteTempImgQuery = `DELETE from temp_images WHERE unique_id = ?;`;
        const deleteTempImgVars = [locationId];

        pool.query(
          deleteTempImgQuery,
          deleteTempImgVars,
          async (deleteTempImgError, deleteTempImgResults) => {
            if (deleteTempImgError) throw deleteTempImgError;

            // (originalKey will match the object_key of the original file in bucket 50%)()
            console.log(originalKey);
            // (bucketName will match correct bucket on AWS 50%)();
            console.log(bucketName);
            await s3Client.send(
              new DeleteObjectCommand({ Bucket: bucketName, Key: originalKey })
            );

            const createQuery = `
          INSERT INTO recipes (user_id, title, description, ingredients, time, instructions, image)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
            const image = imageCDNurl + key;
            const createVars = [
              userId,
              title,
              description,
              ingredients,
              time,
              instructions,
              image,
            ];

            pool.query(
              createQuery,
              createVars,
              function (createError, createResults) {
                if (createError) throw createError;

                res.status(200).send("Recipe submitted");
              }
            );
          }
        );
      } catch (error) {
        console.log(error);
      }
    }
  );
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
  const {
    title,
    ingredients,
    description,
    time,
    instructions,
    image: locationID,
    old_image_url: oldImageURL,
  } = req.body;
  const { recipeId } = req.params;
  const tempImageQuery = `SELECT file_path, current_filename, original_filename FROM temp_images
                        WHERE unique_id = ?;`;
  const tempImageVars = [locationID];

  pool.query(
    tempImageQuery,
    tempImageVars,
    async (tempImageError, tempImageResults) => {
      if (tempImageError) throw tempImageError;

      const { file_path: filePath, current_filename: currentFileName } =
        tempImageResults[0];

      const { user_id: userId } = req.session;
      const bucketName = BUCKET_NAME;
      const key = `user_${userId}_${currentFileName}_${Date.now()}`;
      const fileHandle = await openFileHandle(filePath, "r");
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

      await deleteTempFile(filePath);
      const { status, message } = await checkFileDeletion(filePath);
      if (status === "failed" || status === "error") {
        throw new Error(
          `There was an issue verifying that the temporary file was deleted at path: ${path} | ${status}: ${message}`
        );
      }

      const index = oldImageURL.search(".net/") + 5;
      const oldKey = oldImageURL.slice(index);

      await s3Client.send(
        new DeleteObjectCommand({ Bucket: bucketName, Key: oldKey })
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
      const image = imageCDNurl + key;
      const updateVars = [
        title,
        ingredients,
        description,
        time,
        instructions,
        image,
        recipeId,
      ];

      pool.query(updateQuery, updateVars, (updateError, updateResults) => {
        if (updateError) throw updateError;

        res.status(200).send("Recipe updated.");
      });
    }
  );
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

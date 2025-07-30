import "dotenv/config";
import mysql from "mysql2/promise";

const { HOST, APP_USER, DB_PASSWORD, DB, BUCKET_NAME } = process.env;
const poolOptions = {
  connectionLimit: 10,
  host: HOST,
  user: APP_USER,
  password: DB_PASSWORD,
  database: DB,
};
const pool = mysql.createPool(poolOptions);

import {
  S3Client,
  DeleteObjectsCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";
const s3Client = new S3Client({});

const cleanupThresholdInterval = 24;

async function deleteOrphanedData() {
  await cleanOrphanedImages();
  await cleanOrphanedSessions();
  await closePool();
}

async function cleanOrphanedImages() {
  try {
    const selectOrphanedImagesQuery = `
      SELECT s3_object_key FROM temp_images
      WHERE created_at < NOW() - INTERVAL ? HOUR;
    `;
    const selectOrphanedImagesVars = [cleanupThresholdInterval];
    const [selectOrphanedImagesResults] = await pool.execute(
      selectOrphanedImagesQuery,
      selectOrphanedImagesVars
    );

    if (selectOrphanedImagesResults.length === 0) {
      console.log("[Cleanup Script] No orphaned images found to delete.");

      return;
    }

    const keys = [];
    for (const result of selectOrphanedImagesResults) {
      keys.push(result.s3_object_key);
    }

    const { Deleted } = await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: { Objects: keys.map((k) => ({ Key: k })) },
      })
    );

    console.log(
      `[Cleanup Script] Successfully deleted ${Deleted.length} objects from S3 bucket. Deleted objects:`
    );
    console.log(Deleted.map((d) => ` • ${d.Key}`).join("\n"));

    const placeholders = keys.map(() => "?").join(",");
    const deleteOrphanedImagesQuery = `
      DELETE FROM temp_images
      WHERE s3_object_key IN (${placeholders})
    `;
    const [deleteOrphanedImagesResults] = await pool.execute(
      deleteOrphanedImagesQuery,
      keys
    );

    console.log(
      `[Cleanup Script] Deleted ${deleteOrphanedImagesResults.affectedRows} temp_images records.`
    );
  } catch (error) {
    if (error instanceof S3ServiceException && error.name === "NoSuchBucket") {
      console.error(
        `[Cleanup Script] Error from S3 while deleting objects from ${BUCKET_NAME}. The bucket doesn't exist.`
      );
    } else if (error instanceof S3ServiceException) {
      console.error(
        `[Cleanup Script] Error from S3 while deleting objects from ${BUCKET_NAME}.  ${error.name}: ${error.message}`
      );
    } else {
      throw error;
    }
  }
}

async function cleanOrphanedSessions() {
  try {
    const deleteOrphanedSessionsQuery = `DELETE FROM sessions WHERE expires < UNIX_TIMESTAMP()`;
    const [deleteOrphanedSessionsQueryResults] = await pool.execute(
      deleteOrphanedSessionsQuery
    );
    if (deleteOrphanedSessionsQueryResults.affectedRows > 0) {
      console.log("[Cleanup Script] Orphaned sessions deleted");
    } else {
      console.log("[Cleanup Script] No orphaned sessions found to delete");
    }
  } catch (error) {
    console.error("[Cleanup Script] Error deleting orphaned sessions: ", error);
  }
}

async function closePool() {
  console.log(
    "[Cleanup Script] Entering finally block. Attempting to close database pool..."
  );
  if (pool) {
    try {
      await pool.end();
      console.log("[Cleanup Script] Database pool closed cleanly.");
    } catch (error) {
      console.error("[Cleanup Script] ERROR closing database pool:", error);
    }
  }
  console.log("[Cleanup Script] Exiting cleanup script function.");
}

deleteOrphanedData();

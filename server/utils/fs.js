const fs = require("fs");
const { promises } = fs;
const os = require("os");
const { tmpdir } = os;
const path = require("path");

async function appendToFile(filename, text) {
  try {
    await promises.appendFile(filename, text);
  } catch (error) {
    console.error(`Error appending to file: ${error.message}`);
  }
}

async function clearFile(filename) {
  try {
    await promises.writeFile(filename, "");
  } catch (error) {
    console.error(`Error writing file: ${error.message}`);
  }
}

async function createTempDir() {
  try {
    const tempDir = await promises.mkdtemp(
      path.join(tmpdir(), "temp-"),
      (err, directory) => {
        if (err) throw err;

        return directory;
      }
    );

    return tempDir;
  } catch (error) {
    console.error(`Error creating temporary directory: ${error.message}`);
  }
}

async function renameFile(oldPath, newPath) {
  try {
    await promises.rename(oldPath, newPath);
  } catch (error) {
    console.error(`Error renaming file uploads: ${error.message}`);
  }
}

async function openFileHandle(filepath, flag) {
  try {
    return await promises.open(filepath, flag);
  } catch (error) {
    console.error(`Error opening file handle: ${error.message}`);
  }
}

async function deleteTempFile(path) {
  try {
    return await promises.unlink(path);
  } catch (error) {
    console.error(`Error deleting temporary file: ${error.message}`);
  }
}

async function checkFileDeletion(path) {
  try {
    await promises.access(path);
    return {
      status: "failed",
      message: `File still exists at path: ${path}`,
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        status: "success",
        message: `File at path ${path} successfully deleted.`,
      };
    } else {
      console.error(`Unexpected error: ${error.message}`);
      return { status: "error", message: error.message };
    }
  }
}

const createReadStream = fs.createReadStream;

module.exports = {
  appendToFile,
  clearFile,
  createTempDir,
  renameFile,
  openFileHandle,
  deleteTempFile,
  checkFileDeletion,
  createReadStream,
};

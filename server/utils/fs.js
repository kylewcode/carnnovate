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

module.exports = {
  appendToFile,
  clearFile,
  createTempDir,
  renameFile,
  openFileHandle,
};

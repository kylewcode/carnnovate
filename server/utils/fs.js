const fs = require("fs");
const { promises, mkdtemp, rename } = fs;
const os = require("os");
const { tmpdir } = os;

async function appendToFile(filename, text) {
  try {
    await promises.appendFile(filename, text);
    console.log(`Text appended to ${filename}`);
  } catch (error) {
    console.error(`Error appending to file: ${error.message}`);
  }
}

async function clearFile(filename) {
  await promises.writeFile(filename, "");
}

module.exports = {
  appendToFile,
  clearFile,
  mkdtemp,
  tmpdir,
  rename,
};

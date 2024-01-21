const fs = require("fs");

async function appendToFile(filename, text) {
  try {
    await fs.promises.appendFile(filename, text);
    console.log(`Text appended to ${filename}`);
  } catch (error) {
    console.error(`Error appending to file: ${error.message}`);
  }
}

async function clearFile(filename) {
  await fs.promises.writeFile(filename, "");
}

module.exports.appendToFile = appendToFile;
module.exports.clearFile = clearFile;

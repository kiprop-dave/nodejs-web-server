const format = require("date-fns/format");
const { v4: uuid } = require("uuid");

const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

// append file cannot create a directory

const logMessage = async (message, logName) => {
  const date = format(new Date(), "yyyy|MM|dd\tHH:mm:ss");
  const logItem = `${date}\t${uuid()}\t ${message}\n`;
  console.log(logItem);
  try {
    if (!fs.existsSync(path.join(__dirname, "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "logs"));
    }
    await fsPromises.appendFile(path.join(__dirname, "logs", logName), logItem);
  } catch (err) {
    console.error(err);
  }
};

module.exports = logMessage;

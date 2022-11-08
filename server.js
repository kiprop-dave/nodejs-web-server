const http = require("http");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;

const logEvents = require("./logEvents");

// Event Emmitter
const EventEmmiter = require("events");

// Creeate a class that extends the eventEmmiter
class Emmiter extends EventEmmiter {}

// Create an instance of MyEmmitter
const myEmmitter = new Emmiter();

myEmmitter.on("log", (msg, fileName) => logEvents(msg, fileName));
// Define port
const PORT = process.env.PORT || 3500;

// function to serve requested files

const serveFile = async (filePath, contentType, response) => {
  try {
    const rawData = await fsPromises.readFile(
      filePath,
      !contentType.includes("image") ? "utf8" : "",
    );
    const data =
      contentType === "application/json" ? JSON.parse(rawData) : rawData;
    response.writeHead(filePath.includes("404.html") ? 404 : 200, {
      "content-Type": contentType,
    });
    response.end(
      contentType === "application/json" ? JSON.stringify(data) : data,
    );
  } catch (err) {
    console.error(err);
    myEmmitter.emit("log", `${err.name}: ${err.message}`, "errLog.txt");
    response.statusCode = 500;
    response.end();
  }
};

const server = http.createServer((req, res) => {
  console.log(req.url, req.method);
  myEmmitter.emit("log", `${req.url}\t${req.method}`, "reqLog.txt");

  //   let filePath;
  //   switch (req.url) {
  //     // Using a switch statement is very verbose, you'll have to write conditions for every request
  //     case "/":
  //       res.statusCode = 200;
  //       filePath = path.join(__dirname, "views", "index.html");
  //       fs.readFile(filePath, "utf8", (err, data) => {
  //         res.end(data);
  //       });
  //       break;

  //     default:
  //       break;
  //   }
  const extension = path.extname(req.url); // Check extension of the url
  let contentType;

  switch (extension) {
    case ".css":
      contentType = "text/css";
      break;
    case ".json":
      contentType = "application/json";
      break;
    case ".js":
      contentType = "text/javascript";
      break;
    case ".txt":
      contentType = "text/plain";
      break;
    case ".jpg":
      contentType = "image/jpeg";
      break;
    case ".png":
      contentType = "image/png";
      break;

    default:
      contentType = "text/html";
      break;
  }

  let filePath =
    contentType === "text/html" && req.url === "/"
      ? path.join(__dirname, "views", "index.html")
      : contentType === "text/html" && req.url.slice(-1) === "/"
      ? path.join(__dirname, "views", req.url, "index.html")
      : contentType === "text/html"
      ? path.join(__dirname, "views", req.url)
      : path.join(__dirname, req.url);

  // Makes the html extension not required in the browser
  if (!extension && req.url.slice(-1) !== "/") {
    filePath += ".html";
  }
  // Check if the file exists
  const fileExists = fs.existsSync(filePath);
  if (fileExists) {
    // Serve the files requested
    serveFile(filePath, contentType, res);
  } else {
    // 404 => error
    // 301 => redirect
    switch (path.parse(filePath).base) {
      case "old-page.html":
        res.writeHead(301, { location: "/new-page.html" }); // writeHead is redirect
        res.end();
        break;
      case "www.page.html":
        res.writeHead(301, { location: "/" }); // writeHead is redirect
        res.end();
        break;
      default:
        // Serve a 404
        serveFile(path.join(__dirname, "views", "404.html"), "text/html", res);
    }
  }
});

server.listen(PORT, () => console.log(`listening on port ${PORT}`));

// Add listener for the event
// myEmmitter.on("log", (msg) => logEvents(msg));

// // Emit the event
// myEmmitter.emit("log", "log event emitted!");

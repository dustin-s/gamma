// tutorials on how to do https:
//    https://adamtheautomator.com/https-nodejs/
//    https://www.geeksforgeeks.org/how-to-create-https-server-with-node-js/

// Import builtin NodeJS modules to instantiate the service
const https = require("https");
const fs = require("fs");

// Import the express module
const express = require("express");

// Import the loggers
// const winston = require("winston");
const expressWinston = require("express-winston");
const logger = require("./logger");

// configure modules
const sequelize = require("./config/connection");
const routes = require("./routes");

// set up server
const app = express();
const PORT = 3001;

// set up middleware (parses incoming req as JSON)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(expressWinston.logger({ winstonInstance: logger }));

// routing middleware
app.use(routes);

app.use(expressWinston.errorLogger({ winstonInstance: logger }));

// Creating object of key and certificate for SSL
let options = {};
if (typeof PhusionPassenger === "undefined") {
  options.key = fs.readFileSync("gamma.key");
  options.cert = fs.readFileSync("gamma.cert");
}

// connect to the DB
sequelize
  .sync(/*{ force: true }*/)
  .then(() => {
    // start the server
    https.createServer(options, app).listen(PORT, (err) => {
      if (err) logger.error(err);
      // console.log("Gamma now listening on port: " + PORT);
      logger.info("Gamma now listening on port: " + PORT);
    });
  })
  .catch((err) => logger.error("Database failed to initialize:\n", err));

// tutorials on how to do https:
//    https://adamtheautomator.com/https-nodejs/
//    https://www.geeksforgeeks.org/how-to-create-https-server-with-node-js/

// Import builtin NodeJS modules to instantiate the service

const IS_PASSENGER = typeof PhusionPassenger != "undefined";

if (IS_PASSENGER) {
  PhusionPassenger.configure({ autoInstall: false });
}

const https = require("https");
const fs = require("fs");

// Import the express module
const express = require("express");

// Create and import the loggers
const expressWinston = require("express-winston");
const makeLogger = require("./logger");

const { loggers } = require("winston");
const logger = loggers.get("logger");

// configure modules
const sequelize = require("./config/connection");
const routes = require("./routes");

// set up server
const app = express();
const PORT = IS_PASSENGER ? "passenger" : 3001;

// set up middleware (parses incoming req as JSON)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(expressWinston.logger({ winstonInstance: logger }));

// routing middleware
app.use(routes);
app.use(express.static("public"));

app.use(expressWinston.errorLogger({ winstonInstance: logger }));

// Creating object of key and certificate for SSL
let options = {};
if (!IS_PASSENGER) {
  options.key = fs.readFileSync("gamma.key");
  options.cert = fs.readFileSync("gamma.cert");
}

// connect to the DB
sequelize
  .sync(/*{ force: true }*/)
  .then(() => {
    // start the server
    if (IS_PASSENGER) {
      app.listen(PORT);
      logger.info("Gamma now listening on port: " + PORT);
    } else {
      https.createServer(options, app).listen(PORT, (err) => {
        if (err) logger.error(err);
        logger.info("Gamma now listening on port: " + PORT);
      });
    }
  })
  .catch((err) =>
    logger.error(err, { errorMsg: "Database failed to initialize" })
  );

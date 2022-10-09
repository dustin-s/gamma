// Import builtin NodeJS modules to instantiate the service
const IS_PASSENGER = typeof PhusionPassenger != "undefined";

if (IS_PASSENGER) {
  PhusionPassenger.configure({ autoInstall: false });
}

const https = require("https");
const fs = require("fs");

const express = require("express");
const path = require("path");

const expressWinston = require("express-winston");
const makeLogger = require("./logger");

const { loggers } = require("winston");
const logger = loggers.get("logger");

const sequelize = require("./config/connection");
const routes = require("./routes");

const app = express();
const PORT = IS_PASSENGER ? "passenger" : 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "./public")));

app.use(expressWinston.logger({ winstonInstance: logger }));

app.use(routes);

app.use(expressWinston.errorLogger({ winstonInstance: logger }));

let options = {};
if (!IS_PASSENGER) {
  options.key = fs.readFileSync("gamma.key");
  options.cert = fs.readFileSync("gamma.cert");
}

sequelize
  .sync(/*{ force: true }*/)
  .then(() => {
    if (IS_PASSENGER) {
      app.listen(PORT);
      logger.info("Gamma now listening on port: " + PORT);
    } else {
      https.createServer(options, app).listen(PORT, (err) => {
        if (err) logger.error(err, { errorMsg: "Server failed to start" });
        logger.info("Gamma now listening on port: " + PORT);
      });
    }
  })
  .catch((err) =>
    logger.error(err, { errorMsg: "Database failed to initialize" })
  );

// tutorials on how to do https:
//    https://adamtheautomator.com/https-nodejs/
//    https://www.geeksforgeeks.org/how-to-create-https-server-with-node-js/

// Import builtin NodeJS modules to instantiate the service
const https = require("https");
const fs = require("fs");

// Import the express module
const express = require("express");

// Import font styles for console
const { successMsg, errorMsg } = require("./utils/formatting");

// configure modules
const sequelize = require("./config/connection");
const routes = require("./routes");

// set up server
const app = express();
const PORT = 3001;

// set up middleware (parses incoming req as JSON)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routing middleware
app.use(routes);

// Creating object of key and certificate for SSL
const options = {};

// connect to the DB
sequelize
  .sync(/*{ force: true }*/)
  .then(() => {
    // start the server
    https.createServer(options, app).listen(PORT, (err) => {
      if (err) console.log(errorMsg(err));
      console.log(successMsg("Gamma now listening on port: " + PORT));
    });
  })
  .catch((err) =>
    console.log(errorMsg("Database failed to initialize:\n"), err)
  );

// tutorials on how to do https:
//    https://adamtheautomator.com/https-nodejs/
//    https://www.geeksforgeeks.org/how-to-create-https-server-with-node-js/

// Import builtin NodeJS modules to instantiate the service

if (typeof(PhusionPassenger) != 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}

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
const PORT = typeof(PhusionPassenger) != 'undefined' ? 'passenger' : 3001;

// set up middleware (parses incoming req as JSON)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routing middleware
app.use(routes);

app.listen(PORT);

// connect to the DB
sequelize
.sync(/*{ force: true }*/)
.catch((err) =>
  console.log(errorMsg("Database failed to initialize:\n"), err)
);
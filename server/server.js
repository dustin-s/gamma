const express = require("express");

const sequelize = require("./config/connection");

// set up server
const app = express();
const PORT = 3001;

// connect to the DB
sequelize.sync({ force: false }).then(() => {
  // start the server
  app.listen(PORT, () => console.log("Gamma now listening on port: " + PORT));
});

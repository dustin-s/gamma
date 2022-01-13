const express = require("express");

// configure modules
const sequelize = require("./config/connection");
const routes = require("./routes");

// set up server
const app = express();
const PORT = 3001;

// set up middleware (parses incoming req as JSON)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect to the DB
sequelize.sync({ force: false }).then(() => {
  // start the server
  app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log("Gamma now listening on port: " + PORT);
  });
});

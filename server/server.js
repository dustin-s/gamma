const express = require("express");

// set up server
const app = express();
const PORT = /* env.process.PORT ||*/ 3001;

// start the server
app.listen(PORT, () => console.log("Gamma now listening on port: " + PORT));

const router = require("express").Router();
const path = require("path");

//base url: http://localhost:3001/ +

// display home page
router.get("/", async (req, res) => {
  console.log("hello", path.resolve(__dirname, "../public"));
  res.sendFile("index.html", { root: path.resolve(__dirname, "../public") });
});

module.exports = router;

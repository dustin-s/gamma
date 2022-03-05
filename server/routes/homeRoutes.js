const express = require("express");
const router = require("express").Router();
const Sequelize = require("sequelize");

const path = require("path");

//base url: http://localhost:3001/ +

router.use(express.static(path.join(__dirname, "../public")));

// display home page
router.get("/", async (req, res) => {
  console.log("hello", path.resolve(__dirname, "../public"));
  res.sendFile("index.html", { root: path.resolve(__dirname, "../public") });
});

module.exports = router;

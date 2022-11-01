require("dotenv").config(); // Read environment variables from .env
const exp = require("constants");
const express = require("express");
const res = require("express/lib/response");
const path = require("path");
const { parseArgs } = require("util");
const PORT = process.env.PORT || 5163;

express()
  .use(express.static(path.join(__dirname, "public")))
  .use(express.json())
  .use(express.urlencoded({ extended: true}))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", async(req, res) => {
    const args = {
      times: [0, Date.now(), Date.now() + 1000]
    }
    res.render('pages/index', args);
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
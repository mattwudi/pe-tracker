require("dotenv").config(); // Read environment variables from .env
const exp = require("constants");
const express = require("express");
const res = require("express/lib/response");
const path = require("path");
const { parseArgs } = require("util");
const PORT = process.env.PORT || 5163;
const { Pool } = require("pg");
const { response } = require("express");
const client = require("pg/lib/native/client");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

express()
  .use(express.static(path.join(__dirname, "public")))
  .use(express.json())
  .use(express.urlencoded({ extended: true}))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", async(req, res) => {
    try {
      const client = await pool.connect();
      const buttonSql = "SELECT * FROM buttons ORDER BY id ASC;";
      const buttons = await client.query(buttonSql);
      const args = {
        "buttons": buttons ? buttons.rows : null
      };
      res.render("pages/index", args);
    }
    catch (err) {
      console.error(err);
      res.set({
        "Content-Type": "application/json"
      });
      res.json({
        error: err
      });
    }
  })
  .post("/log", async(req, res) => {
    res.set({
      "Content-Type": "application/json"
    });

    try {
      const client = await pool.connect(); // connects to postgres client
      const id = req.body.id; // reads the id from the request in index.ejs
      var updateSql = ``;

      // see if reset button was pressed or not
      if (id == 3) {
        updateSql = `UPDATE buttons
        SET count = 0
        WHERE id <> $1
        RETURNING count as new_count`;
      } else {
        updateSql = `UPDATE buttons
          SET count = count + 1
          WHERE id = $1
          RETURNING count as new_count`;
      }

      const update = await client.query(updateSql, [id]);

      const response = {
        newCount: update ? update.rows[0] : null,
        buttonId: id
      };
      res.json(response);
      client.release();
    }
    catch (err) {
      console.error(err);
      res.json({
        error: err
      });
    }
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
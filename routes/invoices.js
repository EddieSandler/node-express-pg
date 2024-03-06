const express = require("express");
const ExpressError = require("../expressError")
const router = new express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {

  try {
    const results = await db.query(`SELECT comp_code,amt
    FROM invoices
    ORDER BY comp_code
    `);

    return res.json({invoices:results.rows})
  } catch (e) {
    return next(e);
  }
})






module.exports = router;
const express = require("express");
const ExpressError = require("../expressError")
const router = new express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT id,comp_code,amt
    FROM invoices
    ORDER BY id
    `);
    return res.json({invoices:results.rows})
  } catch (e) {
    return next(e);
  }
})
//GET /invoices/[id] : Returns obj on given invoice.
router.get('/:id',async(req,res,next)=>{
  try {
      const { id } = req.params;
      const results = await db.query('SELECT * FROM invoices JOIN companies on invoices.comp_code=companies.code WHERE id =$1 ', [id]);
      if (results.rows.length === 0) {
        throw new ExpressError(`Can't find invoice  with id of ${ id }, 404`);
      }
      return res.send({ code: results.rows[0] });


  } catch (e){
    return next(e)
  }
})





module.exports = router;
const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT id,comp_code,amt
    FROM invoices
    ORDER BY id
    `);
    return res.json({ invoices: results.rows },200);
  } catch (e) {
    return next(e);
  }
});
//GET /invoices/[id] : Returns obj on given invoice.
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query('SELECT * FROM invoices JOIN companies on invoices.comp_code=companies.code WHERE id =$1 ', [id]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find invoice  with id of ${id}, 404`);
    }
    return res.send({ company:results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

/****POST /invoices :** Adds an invoice. Needs to be passed in JSON body of: `{comp_code, amt}`
Returns: `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}`**/
router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
       VALUES ($1, $2 )
       RETURNING id,comp_code,amt,paid,add_date,paid_date`,
      [comp_code, amt]);

    return res.status(201).json({ "invoice": result.rows[0] });

  } catch (e) {
    return next(e);
  }
});



// **PUT /invoices/[id] :** Updates an invoice. If invoice cannot be found, returns a 404.
// Needs to be passed in a JSON body of `{amt}` Returns: `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}`

router.put('/:id', async (req, res, next) => {

  try {
    const { id } = req.params;
    const { amt } = req.body;
    const result = await db.query(
      `UPDATE invoices SET amt= $1
      WHERE id=${id}
       RETURNING id,comp_code,amt,paid,add_date,paid_date`,
      [amt]);
    if (result.rows.length === 0) {
      throw new ExpressError(`Cannot locate invoice id ${id}`, 404);
    }
    return res.status(201).json({ "invoice": result.rows[0] });

  } catch (e) {
    return next(e);
  }
});




// **DELETE /invoices/[id] :** Deletes an invoice.If invoice cannot be found, returns a 404. Returns: `{status: "deleted"}` Also, one route from the previous part should be updated:
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await db.query(`DELETE FROM invoices WHERE id =$1 RETURNING id`, [id]);
    if (result.rows.length === 0) {
      throw new ExpressError(`Cannot locate invoice id ${id}`, 404);
    }
    return res.send({ "status": "DELETED" });
  } catch (e) {
    return next(e);
  }

});


module.exports = router;
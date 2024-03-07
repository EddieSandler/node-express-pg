const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();
const db = require("../db");
const slugify = require('slugify');



// ///**GET /companies :** Returns list of companies, like `{companies: [{code, name}]}`

router.get('/', async (req, res, next) => {

  try {
    const results = await db.query(`SELECT code,name,description
    FROM companies
    ORDER BY name
    `);

    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});
// **GET /companies/[code] :** Return obj of company: `{company: {code, name, description}}`
// If the company given cannot be found, this should return a 404 status response.
//// **GET /companies/[code] :** Return obj of company: `{company: {code, name, description, invoices: [id, ...]}}` If the company given cannot be found, this should return a 404 status response. */
router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    // Query to fetch company details
    const companyRes = await db.query('SELECT * FROM companies WHERE code = $1', [code]);

    if (companyRes.rows.length === 0) {
      // If no company is found, throw an error with a 404 status code
      return res.status(404).send({ error: `Can't find company with code of ${code}` });
    }

    const company = companyRes.rows[0];

    // Query to fetch related invoice IDs
    const invoicesRes = await db.query('SELECT id FROM invoices WHERE comp_code = $1', [code]);

    // Map over the invoices to extract just the IDs
    const invoiceIds = invoicesRes.rows.map(row => row.id);

    // Construct and send the response object
    return res.json({
      company: {

        name: company.name,
        description: company.description,
        invoices: invoiceIds,
      },
    });

  } catch (e) {
    // Pass the error to the error handler
    return next(e);
  }
});

// **POST /companies :** Adds a company. Needs to be given JSON like: `{code, name, description}` Returns obj of new company:  `{company: {code, name, description}}`
router.post('/', async (req, res, next) => {
  try {
    let { name, description } = req.body;
    let code = slugify(name, {lower: true});
    const results = await db.query('INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) RETURNING code,name,description', [code, name, description]);
    return res.status(201).json({ company: results.rows[0] });
  } catch (e) {
    return next(e);

  }
});

// **PUT /companies/[code] :** Edit existing company. Should return 404 if company cannot be found.
// Needs to be given JSON like: `{name, description}` Returns update company object: `{company: {code, name, description}}`
router.put('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query('UPDATE companies SET name=$1,description=$2 WHERE code =$3 RETURNING code,name,description', [name, description, code]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update company with code of ${code},404`);
    }
    return res.send({ company: results.rows[0] });
  } catch (e) {
    return next(e);

  }
});


// **DELETE /companies/[code] :** Deletes company. Should return 404 if company cannot be found.
// Returns `{status: "deleted"}`

router.delete('/:code', (req, res, next) => {
  try {
    const results = db.query("DELETE FROM companies WHERE code =$1", [req.params.code]);
    return res.send({ msg: "DELETED" });
  } catch (e) {
    return next(e);
  }

});


module.exports = router;











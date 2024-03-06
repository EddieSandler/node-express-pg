/** Database setup for BizTime. */

const { Client } = require("pg");

let DB_URI;

// If we're running in test "mode", use our test db
// Make sure to create both databases!
if (process.env.NODE_ENV === "test") {
  DB_URI = "biztime_test";
} else {
  DB_URI = "biztime";
}

let db = new Client({
  // connectionString: DB_URI,
  // password:process.env.DB_PASSWORD
  host:"/var/run/postgresql",
  database:DB_URI
});

db.connect();

module.exports = db;

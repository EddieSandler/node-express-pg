const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();


const db = require('../db'); // Adjust this path to your database connection module

// Runs once before all tests in this file
beforeAll(async () => {
  // Perform global setup, such as connecting to the test database
});

// Runs before each test in this file
beforeEach(async () => {
  // Seed the database with initial data for a consistent starting state
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
  await db.query("INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple Computer', 'Maker of OSX.')");
  await db.query("INSERT INTO invoices (id,comp_code, amt) VALUES (1,'apple', 100)");
});

// Runs after each test in this file
afterEach(async () => {
  // Clean up the database to ensure tests are isolated
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
});

// Runs once after all tests in this file
afterAll(async () => {
  // Perform global teardown, such as closing database connections
  await db.end();
});
const request = require("supertest");
const app = require("../app"); // Adjust this path to where your Express app is initialized

describe("GET /invoices", () => {
  test("It should respond with an array of invoices", async () => {
    const response = await request(app).get("/invoices");
    expect(response.statusCode).toBe(200);
    expect(response.body.invoices).toBeInstanceOf(Array);
    // If you know the exact shape of your data, you can add more specific tests here.
  });
});
describe("GET /invoices/:id", () => {
  test("It should return invoice details for a given id", async () => {
    const response = await request(app).get("/invoices/1"); // Assuming an invoice with ID 1 exists
    expect(response.statusCode).toBe(200);
    expect(response.body.company).toBeDefined();
    // Add more specific tests based on the structure of your response
  });

  test("It should return a 500 for a nonexistent invoice", async () => {
    const response = await request(app).get("/invoices/9999");
    expect(response.statusCode).toBe(500);
  });
});
describe("POST /invoices", () => {
  test("It should create a new invoice", async () => {
    const newInvoice = { comp_code: "apple", amt: 100 };
    const response = await request(app).post("/invoices").send(newInvoice);
    expect(response.statusCode).toBe(201);
    expect(response.body.invoice).toHaveProperty("id");
    // Validate other properties of the newly created invoice
  });
});
describe("PUT /invoices/:id", () => {
  test("It should update an invoice's amount", async () => {
    const updatedInvoice = { amt: 200 };
    const response = await request(app).put("/invoices/1").send(updatedInvoice); // Assuming an invoice with ID 1 exists
    expect(response.statusCode).toBe(201);
    expect(response.body.invoice.amt).toBe(200);
    // Add more assertions as needed
  });
});
describe("DELETE /invoices/:id", () => {
  test("It should delete an invoice", async () => {
    const response = await request(app).delete("/invoices/1"); // Assuming an invoice with ID 1 exists and can be deleted
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "DELETED" });
  });

  test("It should return a 404 for trying to delete a nonexistent invoice", async () => {
    const response = await request(app).delete("/invoices/9999");
    expect(response.statusCode).toBe(404);
  });
});

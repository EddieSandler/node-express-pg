// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const ExpressError = require("../expressError");

// let testCompany;
beforeEach(async () => {
  const result = await db.query(`INSERT INTO companies (code,name, description) VALUES ('Test', 'Test Company','This is a test') RETURNING  code, name, description`);

  testCompany = result.rows[0]
})

afterEach(async () => {
  await db.query(`DELETE FROM companies`)})

afterAll(async () => {
  await db.end()
})

describe("GET /companies", () => {
  test("Get a list with one company", async () => {
    const res = await request(app).get('/companies')
    // expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      companies:[
        {
      code:'Test',
      name:'Test Company',
      description:'This is a test',
        },
      ]
    })
  })
})

describe("GET /companies/:code", () => {
  test("Gets a single company", async () => {
    const testCode='Test'
    const res = await request(app).get(`/companies/${testCode}`)
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {

      name: 'Test Company',
      description:'This is a test',
      invoices:[]
     }
  })
})
  test("Responds with 404 for invalid id", async () => {
    const res = await request(app).get(`/companies/0`)
    expect(res.statusCode).toBe(404);
  })
})

describe("POST /companies", () => {
  test("Creates a single Company", async () => {
    const res = await request(app).post('/companies').send({ code :'Test2' ,name: 'Test Company2', description: 'another test' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: { code :'Test2',name: 'Test Company2', description: 'another test' }
    })
  })
})

describe("PUT /companies/:code", () => {
  test("Updates a single company", async () => {
    const code='Test'
    const updatedCompany = { name: 'Test change Company2', description: 'test editing' };
    const res = await request(app).put(`/companies/${code}`).send(updatedCompany);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: { code :'Test',...updatedCompany }
    })
  },10000)
})

describe("DELETE /companies/:code", () => {
  test("Deletes a company", async () => {
    const companyCode='Test'
    const res = await request(app).delete(`/companies/${companyCode}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: 'DELETED' })
  })
})



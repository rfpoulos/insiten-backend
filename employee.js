const express = require('express');
const employee = new express.Router();
const db = require('./database');

employee.get('/user', (req, res) =>
    res.send(req.jwt)
);

let getCompanyById = (companyId) =>
    db.query(`
    SELECT * FROM companies
    WHERE companies.id = $1;
    `, companyId)

employee.get('/company/:id', async (req, res) => {
    let { id } = req.params;
    let company = await getCompanyById(id);
    res.send(company);
});

let getCompanyNotes = (companyId) =>
    db.query(`
    SELECT * FROM notes
    WHERE notes.companyid = $1
    ORDER BY timestamp DESC;
    `, companyId);

employee.get('/companynotes/:id', async (req, res) =>{
    let { id } = req.params;
    let notes = await getCompanyNotes(id);
    res.send(notes);
});

let getCountries = (country) =>
    db.query(`
    SELECT DISTINCT country 
    FROM companies
    WHERE country ILIKE $1;
    `, '%' + country + '%')

employee.get('/countries/:country', async (req, res) => {
    let { country } = req.params;
    let countries = await getCountries(country);
    res.send(countries);
});

let getCompanyByName = (company) =>
    db.query(`
    SELECT *
    FROM companies
    WHERE name ILIKE $1;
    `, '%' + company + '%')

employee.get('/companyname/:company', async (req, res) => {
    let { company } = req.params;
    let companies = await getCompanyByName(company);
    res.send(companies);
});

let generateCompanyQuery = (query) => {
    let search = `
        SELECT * FROM companies
        WHERE employees
        BETWEEN $1
        AND $2
        `
    if (query.country) {
        search += 'AND country = $3'
    }
    if (query.public !== 'both') {
        search += 'AND public = $4'
    }
    if (query.status !== 'any') {
        search += 'AND status = $5'
    }
    search += `ORDER BY $6 ${query.direction}`
    return search
}

let companyQuery = (query) =>
    db.query(
        generateCompanyQuery(query),
        [
            query.sizeMin,
            query.sizeMax,
            query.country,
            query.public,
            query.status,
            parseInt(query.sortBy),
        ]
    );

employee.get('/companysearch/', async (req, res) =>{
    let query = req.query
    let companies = await companyQuery(query);
    res.send(companies);
});

module.exports = employee;
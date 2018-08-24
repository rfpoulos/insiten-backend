const express = require('express');
const employee = new express.Router();
const db = require('./database');

employee.get('/user', (req, res) =>
    res.send(req.jwt)
);

let getCompanyById = (id) =>
    db.query(`
    SELECT * FROM companies
    WHERE id = $1;
    `, id)

employee.get('/company/:id', async (req, res) => {
    let { id } = req.params;
    let company = await getCompanyById(id);
    res.send(company);
});

module.exports = employee;
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
})
module.exports = employee;
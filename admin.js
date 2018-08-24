const express = require('express');
const admin = new express.Router();
const db = require('./database');

let addCompany = (company) =>
    db.query(`
    INSERT INTO companies
    (
        name,
        address,
        city,
        state,
        country,
        description,
        public,
        employees,
        founded,
        status
    )
    VALUES
    (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10
    )
    RETURNING *;
    `, [
        company.name,
        company.address,
        company.city,
        company.state,
        company.country,
        company.description,
        company.public,
        company.employees,
        company.founded,
        company.status
    ]);

admin.get('/user', (req, res) =>
    res.send(req.jwt)
);
admin.post('/addcompany', async (req, res) =>{
    let companyId = await addCompany(req.body);
    res.send(companyId[0]);
});

module.exports = admin;
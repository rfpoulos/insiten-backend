const express = require('express');
const admin = new express.Router();
const db = require('./database');

admin.get('/user', (req, res) =>
    res.send(req.jwt)
);

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

admin.post('/company', async (req, res) =>{
    let companyId = await addCompany(req.body);
    res.send(companyId[0]);
});

let updateCompany = (company) =>
    db.query(`
    UPDATE companies
    SET name = $2,
        address = $3,
        city = $4,
        state = $5,
        country = $6,
        description = $7,
        public = $8,
        employees = $9,
        founded = $10,
        status = $11
    WHERE id = $1
    RETURNING *;
    `, [
        company.id,
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
    ])

admin.put('/company', async (req, res) => {
    let newEntry = await updateCompany(req.body);
    res.send(newEntry)
});
module.exports = admin;
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
    SELECT username,
        note,
        timestamp,
        name,
        type
    FROM notes
    LEFT JOIN contacts
    ON (contacts.id = notes.contactid)
    JOIN users
    ON (notes.userid = users.id)
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

let contactQuery = ({ id, query }) =>
    db.query(`
    SELECT contacts.name, 
        phone,
        email,
        role,
        contacts.id
    FROM contacts
    JOIN companies
    ON (companies.id = contacts.companyid)
    WHERE companyid = $1
    AND (contacts.name ILIKE $2
    OR email ILIKE $2
    OR phone ILIKE $2 )
    `, [ 
        parseInt(id), 
        '%' + query + '%'
    ])

employee.get('/contacts/:id/:query', async (req, res) => {
    let contacts = await contactQuery(req.params);
    res.send(contacts);
})

let addNote = (note, userId) =>
    db.query(`
    INSERT INTO notes
    (
        companyid,
        userid,
        note,
        type,
        timestamp,
        contactid
    )
    VALUES
    ($1, $2, $3, $4, $5, $6)
    `, [
        note.companyId,
        userId,
        note.note,
        note.type,
        note.timestamp,
        note.contactId
    ])

employee.post('/notes', async (req, res) => {
    await addNote(req.body, req.jwt.id);
    let notes = await getCompanyNotes(req.body.companyId);
    res.send(notes);
})

let companyContacts = (companyId) =>
    db.query(`
    SELECT * FROM contacts
    WHERE companyid = $1;
    `, parseInt(companyId));

employee.get('/companycontacts/:id', async (req, res) => {
    let contacts = await companyContacts(req.params.id);
    res.send(contacts);
})

let addContact = (contact) =>
    db.query(`
    INSERT INTO contacts
    (
        companyid,
        name,
        role,
        phone,
        email
    )
    VALUES
    ($1, $2, $3, $4, $5)
    RETURNING *;
    `, [
        contact.companyId,
        contact.name,
        contact.role,
        contact.phone,
        contact.email
    ])

employee.post('/contacts', async (req, res) => {
    let contact = await addContact(req.body);
    res.send(contact);
})

let updateContact = (contact) =>
    db.query(`
    UPDATE contacts
    SET name = $2,
        role = $3,
        phone = $4,
        email = $5
    WHERE id = $1
    RETURNING *;
    `, [
        contact.id,
        contact.name,
        contact.role,
        contact.phone,
        contact.email,
    ])

employee.put('/contacts', async (req, res) => {
    let contact = await updateContact(req.body)
    res.send(contact);
})

module.exports = employee;
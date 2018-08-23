const express = require('express');
const employee = new express.Router();

employee.get('/user', (req, res) =>
    res.send(req.jwt)
);

module.exports = employee;
const express = require('express');
const admin = new express.Router();

admin.get('/user', (req, res) =>
    res.send(req.jwt)
);

module.exports = admin;
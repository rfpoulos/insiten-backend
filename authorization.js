require('dotenv').config()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const signature = process.env.SIGNATURE;
const pg = require('pg-promise')();
const db = pg(process.env.DATABASE_URL);

let checkEmployee = async (req, res, next) => {
  let { token: token } = req.headers;
  let payload;
  try {
    payload = await jwt.verify(token, signature);
  } catch(err) {
    console.log(err);
  }

  if (payload.role === 'admin' || 
        payload.role === 'employee') {
    req.jwt = payload;
    delete req.jwt.password
    next();
  } else {
    res.send('Invalid Token');
  }
};

let checkAdmin = async (req, res, next) => {
    let { token: token } = req.headers;
    console.log(token)
    let payload;
    try {
      payload = await jwt.verify(token, signature);
    } catch(err) {
      console.log(err);
    }
  
    if (payload.role === 'admin') {
      req.jwt = payload;
      delete req.jwt.password
      next();
    } else {
      res.send('Invalid Token');
    }
  };

let createToken = user =>
  jwt.sign(
    { 
        ...user
    },
    signature,
    { expiresIn: '7d' }
  );


let userByIdentifier = (identifier) =>
  db.query(`
      SELECT * FROM users
      WHERE username = $1
      OR email = $1;
  `, [identifier]);

let postTokens = async (req, res) => {
  let { identifier, password } = req.body;
  let user = await userByIdentifier(identifier);
  user = user[0];
  let isValid = await bcrypt.compare(password, user.password);
  if (isValid && user.role) {
    let token = createToken(user);
    user.token = token;
    delete user.password;
    res.send(user);
  } else if (isValid) {
      res.send({ role: null })
  } else {
    res.send('Invalid identifier and/or password.');
  }
};

let createAccountInDb = (email, username, password) =>
    db.query(`
        INSERT INTO users (email, username, password)
        VALUES ('$1', '$2', '$3');
    `, [email, username, password]);

let saltAndHashPassword = (password) =>
  bcrypt.hash(password, 10);

let createAccount = (req, res) => {
    let { email, username, password } = req.body;
    saltAndHashPassword(password)
    .then(hashedPassword => {
        createAccountInDb(email, username, hashedPassword)
        .then(data => res.send('User added.'));
    })
}

module.exports = {
    createAccount,
    postTokens,
    checkEmployee,
    checkAdmin,
}
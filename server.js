const express = require('express');
const Router = express.Router;
const bodyParser = require('body-parser');
const app = express();
const router = new Router();

const { 
  postTokens, 
  createAccount, 
  checkAdmin,
  checkEmployee, 
} = require('./authorization');
const employee =  require('./employee');
const admin =  require('./admin');

app.use(express.static('./public'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", 
              "Origin, X-Requested-With, Content-Type, Accept, token");
  res.header("Access-Control-Allow-Methods", 
              "*");
  if ('OPTIONS' === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

router.post('/signin', postTokens);
router.post('/createaccount', createAccount);
router.use(checkEmployee, employee);
router.use(checkAdmin, admin)

app.use(bodyParser.json());
app.use(router);
app.listen(process.env.PORT || 5000);
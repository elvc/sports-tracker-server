require('dotenv').config();

const ENV = process.env.NODE_ENV || 'development';
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig[ENV]);

const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const dbUsers = require('../db/users')(knex);

const router = express.Router();

module.exports = (function() {
  router.use(cookieSession({
    name: 'session',
    keys: ['Lighthouse'],
    maxAge: 24 * 60 * 60 * 1000
  }));

  // for reg and login forms
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));

  router.use((req, res, next) => {
    const sessionUsername = req.session.username;
    if (!sessionUsername) {
      res.locals.username = null;
    } else {
      dbUsers.getUserByUserName(sessionUsername).then(result => {
        res.locals.username = result.Username;
      });
    }
    next();
  });

  // register route
  router.post('/register', (req, res) => {
    dbUsers.getUserByEmail(req.body.email).then(result => {
      if (!req.body.email || !req.body.password || !req.body.username){
        res.status(400);
        res.json({ response: 'Please input all fields.'});
      } else if (result[0]) {
        res.status(400);
        res.json({ response: 'Email entered already in use. Please register with another email' });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          const username = req.body.username;
          const email = req.body.email;
          dbUsers.insertUser(username, email, hash)
          .then(() => {
            req.session.username = req.body.username;
            res.json({ response: 'Registration OK' })
          });
        });
      }
    });
  });

  // LOGIN routes
  router.post('/login', (req, res) => {
    const inputPw = req.body.password;
    const inputUsername = req.body.username;
    
    dbUsers.getUserByUserName(inputUsername).then((result) => {
      if (!result[0]) {
        res.status(403)
        return Promise.reject({
          type: 403,
          message: `Account with email entered not found.`
        });
      } else {
        const registeredPw = result[0].password;
        bcrypt.compare(inputPw, registeredPw, (err, result) => {
          if (!result) {
            res.status(401);
            res.json({ response: 'incorrect username or password' });
          } else {
            req.session.username = inputUsername;
            res.json({ response: 'login ok' });
          }
        });
      }
    }).catch(err => {
      res.redirect('/');
    });
  });

  //Logout route
  router.post('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
  });

  return router;
})();

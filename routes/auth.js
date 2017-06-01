require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { sendEmail, sendEmailNow } = require('../emailer/emailer');

const ENV = process.env.NODE_ENV || 'development';
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig[ENV]);
const dbUsers = require('../db/users')(knex);

const router = express.Router();

module.exports = (function () {
  router.use(cookieSession({
    name: 'session',
    keys: ['Lighthouse'],
    maxAge: 24 * 60 * 60 * 1000
  }));

  // for reg and login forms
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));

  // checks for sessions on page refresh
  router.get('/checkifloggedin', (req, res) => {
    if (req.session.username !== undefined) {
      dbUsers.getUserByUserName(req.session.username).then((result) => {
        res.json({
          isLoggedIn: (req.session.username !== undefined),
          username: req.session.username,
          user_id: req.session.user_id,
          email: result[0].email
        });
      });
    } else {
      res.json({ isLoggedIn: false });
    }
  });

  // share email route
  router.post('/share', (req, res) => {
    sendEmailNow(req.body.date, req.body.awayTeam, req.body.homeTeam, req.body.email);
    res.status(200);
    res.json({ message: 'Success', email: req.body.email });
  });

  // notify-me route
  router.post('/notify-me', (req, res) => {
    sendEmail(req.body.date, req.body.awayTeam, req.body.homeTeam, req.body.email, req.body.startTime);
    res.status(200);
    res.json({ message: 'Success', email: req.body.email });
  });

  // register route
  router.post('/register', (req, res) => {
    dbUsers.getUserByUserNameOrEmail(req.body.username, req.body.email)
    .then((user) => {
      if (!req.body.email || !req.body.password || !req.body.username) {
        res.status(400);
        res.json({ message: 'Please input all fields.' });
      } else if (req.body.password.length < 8) {
        res.status(400);
        res.json({ message: 'Password length must contain at least 8 characters.' });
      } else if (req.body.username.length < 5) {
        res.status(400);
        res.json({ message: 'User name length must exceed 5 characters.' });
      } else if (user[0]) {
        res.status(400);
        res.json({ message: 'Username/Email already in use. Please register with another username and email' });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          const username = req.body.username.toLowerCase();
          const email = req.body.email.toLowerCase();
          dbUsers.insertUser(username, email, hash)
          .then((response) => {
            req.session.username = username;
            req.session.user_id = response[0];
            res.json({ username: req.session.username, user_id: req.session.user_id, email });
          });
        });
      }
    });
  });

  // LOGIN routes
  router.post('/login', (req, res) => {
    const inputPw = req.body.password;
    const inputUsername = req.body.username.toLowerCase();

    dbUsers.getUserByUserName(inputUsername).then((result) => {
      if (!result[0]) {
        res.status(401);
        res.json({ message: 'Incorrect username or password' });
      } else {
        const registeredPw = result[0].password;
        const userId = result[0].id;
        bcrypt.compare(inputPw, registeredPw, (err, auth) => {
          if (!auth) {
            res.status(401);
            res.json({ message: 'Incorrect username or password' });
          } else {
            req.session.username = inputUsername;
            req.session.user_id = userId;
            res.json({ username: req.session.username, user_id: req.session.user_id, email: result[0].email });
          }
        });
      }
    }).catch(() => {
      res.status(500);
      res.json({ message: 'Database Error. Please try again' });
    });
  });

  // Logout route
  router.post('/logout', (req, res) => {
    req.session = null;
    res.status(200);
    res.json({ message: 'Logout Successful' });
  });

  return router;
}());

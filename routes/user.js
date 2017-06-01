require('dotenv').config();
const express = require('express');
const user_router = express.Router();
const ENV = process.env.NODE_ENV || 'development';
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig[ENV]);
const dbCards = require('../db/cards')(knex);
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');

module.exports = (function() {
  user_router.get('/get', (req, res) => {
    const user_id = req.session.user_id;
    if(user_id){
      dbCards.getCardsByUser(user_id).then(result => {
        const games = result.map(dbGame => {
          let game = {};
          game.gameId = dbGame.gameId;
          game.awayTeam = dbGame.awayteam;
          game.homeTeam = dbGame.hometeam;
          game.date = dbGame.date;
          game.time = dbGame.time;
          game.startTime = dbGame.time;
          game.league = dbGame.league;
          return game;
        })
        res.json({response: games});
      }).catch(error => {
        res.status(500);
        res.json({ message: 'Database Error. Please try again' });
      })
    } else {
      res.json();
    }
  }),

  user_router.post('/remove', (req, res) => {
    const user_id = req.session.user_id;
    const gameId = req.body;
    if(user_id){
      dbCards.findByGameAndUser(gameId.gameId, user_id).then(result => {
        if(result[0]){
          dbCards.removeCard(result[0]).then(result =>  res.json()).catch(error => {
            res.status(500);
            res.json({ message: 'Database Error. Please try again' });
          });
        }
      }).catch(error => {
        res.status(500);
        res.json({ message: 'Database Error. Please try again' });
      });
    } else {
      res.json();
    }
  })

return user_router;
})();

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
    console.log('inrouter');
    console.log(req.session.username);
    console.log(user_id);
    if(user_id){
      dbCards.getCardsByUser(user_id).then(result => {
        console.log(result);
        res.json({response: result});
      })
    }
  }),

  user_router.post('/remove', (req, res) => {
    const user_id = req.session.user_id;
    const gameId = req.body;
    console.log(gameId);
    if(user_id){
      dbCards.findByGameAndUser(gameId.gameId, user_id).then(result => {
        if(result[0]){
          dbCards.removeCard(result[0]).then(result => console.log('card removed'));
        }
      });
    }
  })

return user_router;
})();
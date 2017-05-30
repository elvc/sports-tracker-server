require('dotenv').config();
const axios = require('axios');
const express = require('express');
const api_router = express.Router();
const ENV = process.env.NODE_ENV || 'development';
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig[ENV]);
const dbCards = require('../db/cards')(knex);
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const moment = require('moment-timezone');

const {addCard} = require('../api/feed');

const config = {
  auth: {
    username: process.env.MY_SPORTS_FEED_USERNAME,
    password: process.env.MY_SPORTS_FEED_PASSWORD
  }
};

const date_format = 'YYYYMMDD';
const date_time_zone = 'America/Los_Angeles';
const game_time_zone = 'America/New_York';


module.exports = (function() {

   api_router.get('/:league', (req, res) => {
    const league = req.params.league;
    const date = moment().tz(date_time_zone).format(date_format);
    axios.get(`https://www.mysportsfeeds.com/api/feed/pull/${league}/latest/daily_game_schedule.json?fordate=${date}`, config)
    .then(function(json){
      if(!json.data.dailygameschedule.gameentry){
        res.json({ response: {}});
        return;
      }
      let startTime;
      const values = json.data.dailygameschedule.gameentry.map(game => {
        game.gameId = game.id;
        startTime = moment.tz(`${game.date} ${game.time}`, "YYYY-MM-DD hh:mmA", game_time_zone);
        game.time =  startTime.tz(date_time_zone).format('hh:mmA');
        return game;
      })
      res.json({ response: values });
    }).catch(error => {
        console.log(error.response.data.message);
        // TODO what to do with errors!!!!!!!!!!!!!!1
        res.json({ response: {}})
    });
  });

  api_router.post('/:league/games/:id', (req, res) => {
    const user_id = req.session.user_id;
    addCard(user_id, req.body, res);
  });

  // api_router.get('/users', (req, res) => {
  //   const user_id = req.session.user_id;
  //   console.log('inrouter');
  //   console.log(req.session.username);
  //   console.log(user_id);
  //   if(user_id){
  //     dbCards.getCardsByUser(user_id).then(result => {
  //       console.log(result);
  //       res.json({response: result});
  //     })
  //   }
  // }),

  // api_router.post('/remove', (req, res) => {
  //   const user_id = req.session.user_id;
  //   const gameId = req.body;
  //   console.log(gameId);
  //   if(user_id){
  //     dbCards.findByGameAndUser(gameId, user_id).then(result => dbCards.removeCard(result[0]).then(result => console.log('card removed')));
  //   }
  // })

return api_router;
})();
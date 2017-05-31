require('dotenv').config();
const axios = require('axios');
const express = require('express');
const api_router = express.Router();
const ENV = process.env.NODE_ENV || 'development';
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig[ENV]);
const dbCards = require('../db/cards')(knex);
const dbGames = require('../db/games')(knex);
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

const date_format = 'YYYY-MM-DD';
const date_time_zone = 'America/Los_Angeles';
const game_time_zone = 'America/New_York';


module.exports = (function() {

   api_router.get('/:league', (req, res) => {
    const league = req.params.league;
    const date = moment().tz(date_time_zone).format(date_format);
    dbGames.findByLeagueAndDate(league, date).then(result => {
      if(result[0]){
        const values = result.map(dbGame => {
          let game = {};
          game.gameId = dbGame.id;
          game.awayTeam = {Abbreviation: dbGame.awayteam};
          game.homeTeam = {Abbreviation: dbGame.hometeam};
          game.date = dbGame.date;
          game.time = dbGame.time;
          game.league = dbGame.league;
          return game;
        });
        res.json({ response: values });
        return;
      } else {
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
          return;
        }).catch(error => {
            res.status(500);
            res.json({ message: 'Unable to get the API data. Please try again' });
        });
      }
    }).catch(error => {
        res.status(500);
        res.json({ message: 'Database Error. Please try again' });
    });
  });

  api_router.post('/:league/games/:id', (req, res) => {
    const user_id = req.session.user_id;
    addCard(user_id, req.body, res);
  });

return api_router;
})();
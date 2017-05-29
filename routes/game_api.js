require('dotenv').config();
const axios = require('axios');
const express = require('express');
const api_router = express.Router();
const ENV = process.env.NODE_ENV || 'development';
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig[ENV]);
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

const api_key = process.env.GOOGLE_API_KEY;
const date_format = 'YYYYMMDD';
const date_time_zone = 'America/Los_Angeles';
const game_time_zone = 'America/New_York';


function getStartingTime(game){
  const date = game.date;
  const time = game.time;
  const city = game.homeTeam.City;
  const location = game.location;
  return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}+${city}&sensor=false&key=${api_key}`)
  .then(json => {
    const result = json.data.results[0];
    const latitude = result.geometry.location.lat;
    const longitude = result.geometry.location.lng;
    const location = `${latitude},${longitude}`;
    return axios.get(`https://maps.googleapis.com/maps/api/timezone/json?location=${location}&timestamp=1331161200&sensor=false&key=${api_key}`)
    .then(json => {
      const timezone = json.data.timeZoneId;
      const startTime = moment.tz(`${date} ${time}`, "YYYY-MM-DD hh:mmA", game_time_zone);
      return startTime.tz('America/Los_Angeles');
    })
  });
};

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
      Promise.all(json.data.dailygameschedule.gameentry.map(game => {
        return getStartingTime(game)
          .then(newtime => {
            game.time = newtime.format('hh:mmA');
            game.gameId = game.id;
            return game;
          });
      })).then(values => {
        res.json({ response: values })
      });
    }).catch(error => {
        console.log(error);
        // TODO what to do with errors!!!!!!!!!!!!!!1
        res.json({ response: {}})
    });
  });

  api_router.post('/:league/games/:id', (req, res) => {
    addCard(req.body, res);
  });

  return api_router;
})();
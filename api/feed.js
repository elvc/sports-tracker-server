require('dotenv').config();
const nba = require('./play_filters/nba');
const mlb = require('./play_filters/mlb');
const nhl = require('./play_filters/nhl');
const axios = require('axios');
const moment = require('moment-timezone');

const ENV = process.env.NODE_ENV || 'development';

const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig[ENV]);
const dbCards = require('../db/cards')(knex);
const dbGames = require('../db/games')(knex);

const api_key = process.env.GOOGLE_API_KEY;
const date_format = 'YYYYMMDD';
const date_time_zone = 'America/Los_Angeles';
const game_time_zone = 'America/New_York';

const BASEBALL = 'MLB';
const BASKETBALL = 'NBA';
const AMERICAN_FOOTBALL = 'NFL';
const HOCKEY = 'NHL';

const config = {
  auth: {
    username: process.env.MY_SPORTS_FEED_USERNAME,
    password: process.env.MY_SPORTS_FEED_PASSWORD
  }
};

function gameSelector(id, json) {
  return json.scoreboard.gameScore.find(obj => obj.game.ID === id);
}

function addUserCard(user_id, game, res) {
  if (user_id) {
    dbCards.findByGameAndUser(Number(game.gameId), Number(user_id)).then((result) => {
      if (!result[0]) {
        dbCards.insertCard(game, user_id).then((result) => {
        }).catch((error) => {
          res.status(500);
          res.json({ message: 'Database Error. Please try again' });
        });
      }
    }).catch((error) => {
      res.status(500);
      res.json({ message: 'Database Error. Please try again' });
    });
  }
}

function addGame(user_id, game, res) {
  dbGames.findGame(game.gameId).then((result) => {
    if (!result[0]) {
      dbGames.insertGame(game).then((result) => {
        addUserCard(user_id, game, res);
      })
      .catch((error) => {
        res.status(500);
        res.json({ message: 'Database Error. Please try again' });
      });
    } else {
      addUserCard(user_id, game, res);
    }
  }).catch((error) => {
    res.status(500);
    res.json({ message: 'Database Error. Please try again' });
  });
}

function addCard(user_id, game, res) {
  addGame(user_id, game, res);

  const league = game.league;
  const game_id = game.gameId;
  const game_starting_time = moment.tz(`${game.date} ${game.time}`, 'YYYY-MM-DD hh:mmA', date_time_zone);
  const now = moment().tz(date_time_zone);

  const date = game.date.replace(/-/g, '');
  const data = {};

  axios.get(`https://www.mysportsfeeds.com/api/feed/pull/${league}/latest/scoreboard.json?fordate=${date}`, config)
  .then((response) => {
    const selectedGame = gameSelector(game.gameId, response.data);
    data.gameId = game.gameId;
    data.league = game.league;
    data.display = 'BASIC';
    data.awayTeam = game.awayTeam;
    data.awayTeamId = selectedGame.game.awayTeam.ID;
    data.homeTeam = game.homeTeam;
    data.homeTeamId = selectedGame.game.homeTeam.ID;
    data.homeScore = selectedGame.homeScore ? selectedGame.homeScore : 0;
    data.awayScore = selectedGame.awayScore ? selectedGame.awayScore : 0;
    data.date = game.date;
    data.gameCompleted = selectedGame.isCompleted;
    data.displayPlayByPlay = false;
    data.startTime = game.time;
    data.time = game.time;
    data.inProgress = selectedGame.isInProgress;
    data.isUnplayed = selectedGame.isUnplayed;
    data.plays = [];
    if (game_starting_time.diff(now) < 0) {
      axios.get(`https://www.mysportsfeeds.com/api/feed/pull/${game.league}/latest/game_playbyplay.json?gameid=${game.gameId}`, config)
      .then((response) => {
        switch (game.league) {
          case BASEBALL:
            if (response.data.gameplaybyplay.atBats) {
              if (!Array.isArray(response.data.gameplaybyplay.atBats.atBat)) {
                const newArray = new Array(response.data.gameplaybyplay.atBats.atBat);
                response.data.gameplaybyplay.atBats.atBat = newArray;
              }
              data.plays = mlb(response.data).reverse();
              data.currentInning = selectedGame.currentInning;
              data.currentInningHalf = selectedGame.currentInningHalf;
              data.innings = selectedGame.inningSummary.inning;
            }
            break;
          case BASKETBALL:
            if (response.data.gameplaybyplay.plays) {
              if (!Array.isArray(response.data.gameplaybyplay.plays.play)) {
                const newArray = new Array(response.data.gameplaybyplay.plays.play);
                response.data.gameplaybyplay.plays.play = newArray;
              }
              data.plays = nba(response.data).reverse();
              data.timeRemaining = data.plays[0].time;
              data.quarter = selectedGame.quarterSummary.quarter[selectedGame.quarterSummary.quarter.length - 1]['@number'];
            }
            break;
          case HOCKEY:
            if (response.data.gameplaybyplay.plays) {
              if (!Array.isArray(response.data.gameplaybyplay.plays.play)) {
                const newArray = new Array(response.data.gameplaybyplay.plays.play);
                response.data.gameplaybyplay.plays.play = newArray;
              }
              data.plays = nhl(response.data).reverse();
              data.timeRemaining = data.plays[0].time;
              data.period = selectedGame.periodSummary.period[selectedGame.periodSummary.period.length - 1]['@number'];
              data.periods = selectedGame.periodSummary.period;
            }
            break;
          default:
            break;
        }
        res.json({ response: data });
      }).catch((error) => {
        res.status(500);
        res.json({ message: 'Unable to get the API data. Please try again' });
      });
    } else {
      switch (game.league) {
        case BASEBALL:
          data.currentInning = 0;
          data.currentInningHalf = '';
          data.innings = [];
          break;
        case BASKETBALL:
          data.quarter = 0;
          data.timeRemaining = 0;
          break;
        case HOCKEY:
          data.period = 0;
          data.timeRemaining = 0;
          data.periods = [];
          break;
        default:
          break;
      }
      res.json({ response: data });
    }
  }).catch((error) => {
    res.status(500);
    res.json({ message: 'Unable to get the API data. Please try again' });
  });
}


function updateDashboard(league, socket) {
  const today = moment().tz(date_time_zone);
  return axios.get(`https://www.mysportsfeeds.com/api/feed/pull/${league}/latest/scoreboard.json?fordate=${today.format('YYYYMMDD')}`, config)
  .then((response) => {
    if (response.data.scoreboard.gameScore) {
      return Promise.all(response.data.scoreboard.gameScore.map(game => new Promise((resolve, reject) => {
        const time = game.game.time;
        const date = game.game.date;
        const game_starting_time = moment.tz(`${date} ${time}`, 'YYYY-MM-DD hh:mmA', game_time_zone);
        const now = moment().tz(date_time_zone);
        const data = {};
        data.gameId = Number(game.game.ID);
        data.league = league;
        data.display = 'BASIC';
        data.awayTeam = game.game.awayTeam.Abbreviation;
        data.awayTeamId = game.game.awayTeam.ID;
        data.homeTeam = game.game.homeTeam.Abbreviation;
        data.homeTeamId = game.game.homeTeam.ID;
        data.homeScore = game.homeScore ? Number(game.homeScore) : 0;
        data.awayScore = game.awayScore ? Number(game.awayScore) : 0;
        data.date = game.game.date;
        data.gameCompleted = game.isCompleted;
        data.displayPlayByPlay = false;
        data.startTime = game.time;
        data.time = game.time;
        data.isCompleted = game.isInProgress !== 'true' && game.isUnplayed !== 'true';
        data.plays = [];
        data.currentInning = '';
        data.currentInningHalf = '';
        data.innings = [];
        data.timeRemaining = 0;
        data.quarter = '';
        data.period = '';
        data.periods = [];
        if (game_starting_time.diff(now) < 0) {
          const date = game.game.date.replace(/-/g, '');
          return axios.get(`https://www.mysportsfeeds.com/api/feed/pull/${data.league}/latest/game_playbyplay.json?gameid=${data.gameId}`, config)
              .then((response) => {
                switch (data.league) {
                  case BASEBALL:
                    if (response.data.gameplaybyplay.atBats) {
                      if (!Array.isArray(response.data.gameplaybyplay.atBats.atBat)) {
                        const newArray = new Array(response.data.gameplaybyplay.atBats.atBat);
                        response.data.gameplaybyplay.atBats.atBat = newArray;
                      }
                      data.plays = mlb(response.data).reverse();
                      data.currentInning = game.currentInning;
                      data.currentInningHalf = game.currentInningHalf;
                      data.innings = game.inningSummary.inning;
                    }
                    break;
                  case BASKETBALL:
                    if (response.data.gameplaybyplay.plays) {
                      if (!Array.isArray(response.data.gameplaybyplay.plays.play)) {
                        const newArray = new Array(response.data.gameplaybyplay.plays.play);
                        response.data.gameplaybyplay.plays.play = newArray;
                      }
                      data.plays = nba(response.data).reverse();
                      data.timeRemaining = data.plays[0].time;
                      data.quarter = game.quarterSummary.quarter[game.quarterSummary.quarter.length - 1]['@number'];
                    }

                    break;
                  case HOCKEY:
                    if (response.data.gameplaybyplay.plays) {
                      if (!Array.isArray(response.data.gameplaybyplay.plays.play)) {
                        const newArray = new Array(response.data.gameplaybyplay.plays.play);
                        response.data.gameplaybyplay.plays.play = newArray;
                      }
                      data.plays = nhl(response.data).reverse();
                      data.timeRemaining = data.plays[0].time;
                      data.period = game.periodSummary.period[game.periodSummary.period.length - 1]['@number'];
                      data.periods = game.periodSummary.period;
                    }
                    break;
                  default:
                    break;
                }
                const some = new Array(data);
                const onUpdateCards = {
                  type: 'UPDATE_CARDS',
                  some
                };
                socket.emit('action', onUpdateCards);
              }).catch((error) => {
                socket.emit({ message: 'Unable to get the API data. Please try again' });
              });
        }
      })));
    }
  }).catch((error) => {
    socket.emit({ message: 'Unable to get the API data. Please try again' });
  });
}

module.exports = { addCard, updateDashboard };

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

function gameSelector(id, json){
  return json.scoreboard.gameScore.find(obj => {
    return obj.game.ID === id;
  });
}

function addCard(user_id, game, res){
  if(user_id){
    dbCards.findByGameAndUser(Number(game.gameId), Number(user_id)).then(result => {
      if(!result[0]){
        dbCards.insertCard(game, user_id).then(result => console.log(result));
      }
    });
  }
  const league = game.league;
  const game_id = game.gameId;
  const game_starting_time = moment.tz(`${game.date} ${game.time}`,'YYYY-MM-DD hh:mmA', date_time_zone);
  const now = moment().tz(date_time_zone);
  if(game_starting_time.diff(now) < 0){
    const date = game.date.replace(/-/g , '');
    const data = {};
    axios.get(`https://www.mysportsfeeds.com/api/feed/pull/${league}/latest/scoreboard.json?fordate=${date}`, config)
    .then(response => {
      const selectedGame = gameSelector(game.gameId, response.data);
      data.gameId = game.gameId;
      data.league = game.league;
      data.display = 'BASIC';
      data.awayTeam = game.awayTeam;
      data.homeTeam = game.homeTeam;
      data.homeScore = selectedGame.homeScore;
      data.awayScore = selectedGame.awayScore;
      data.date = game.date;
      data.gameStarted = true;
      data.gameCompleted = selectedGame.isCompleted;
      data.displayPlayByPlay = true;
      data.startTime = game.time;
      data.inProgress = selectedGame.isInProgress;
      data.isUnplayed = selectedGame.isUnplayed;
      data.plays = [];
      axios.get(`https://www.mysportsfeeds.com/api/feed/pull/${game.league}/latest/game_playbyplay.json?gameid=${game.gameId}`, config)
        .then(response => {
          switch (game.league){
            case BASEBALL:
              if(response.data.gameplaybyplay.atBats){
                if(!Array.isArray(response.data.gameplaybyplay.atBats.atBat)){
                  const newArray = new Array(response.data.gameplaybyplay.atBats.atBat);
                  response.data.gameplaybyplay.atBats.atBat = newArray;
                }
                data.plays = mlb(response.data).reverse();
              }
              data.currentInning = selectedGame.currentInning;
              data.currentInningHalf = selectedGame.currentInningHalf;
              data.innings = selectedGame.inningSummary.inning;
              break;
            case BASKETBALL:
              if(response.data.gameplaybyplay.plays){
                data.plays = nba(response.data).reverse();
                data.timeRemaining = data.plays[0].time;
              }
              data.quarter = selectedGame.quarterSummary.quarter[selectedGame.quarterSummary.quarter.length - 1]['@number'];
              break;
            case HOCKEY:
              if(response.data.gameplaybyplay.plays){
                data.plays = nhl(response.data).reverse();
                data.timeRemaining = data.plays[0].time;
              }
              data.period = selectedGame.periodSummary.period[selectedGame.periodSummary.period.length - 1]['@number'];
              data.periods = selectedGame.periodSummary.period;
              break;
            default:
              break;
          }
          res.json({ response: data });
        }).catch(error => console.log(error))
    }).catch(error => console.log(error));
  } else {

    const data = {
      gameId: game.gameId,
      league: game.league,
      display: 'BASIC',
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      homeScore: 0,
      awayScore: 0,
      date: game.date,
      gameStarted: false,
      displayPlayByPlay: false,
      startTime: game.time,
      inProgress: 'false',
      isUnplayed: 'true',
      plays: []
    }
    switch(game.league){
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
}


function updateDashboard(league, socket){
  const today = moment().tz(date_time_zone);
  return axios.get(`https://www.mysportsfeeds.com/api/feed/pull/${league}/latest/scoreboard.json?fordate=${today.format('YYYYMMDD')}`, config)
  .then(response => {
    if(response.data.scoreboard.gameScore){
      return Promise.all(response.data.scoreboard.gameScore.map(game => {
          return new Promise((resolve, reject) => {
            const time = game.game.time;
            const date = game.game.date;
            const game_starting_time = moment.tz(`${date} ${time}`,'YYYY-MM-DD hh:mmA', game_time_zone);
            const now = moment().tz(date_time_zone);
            const data = {};
            data.gameId = Number(game.game.ID);
            data.league = league;
            data.display = 'BASIC';
            data.awayTeam = game.game.awayTeam.Abbreviation;
            data.homeTeam = game.game.homeTeam.Abbreviation;
            data.homeScore = Number(game.homeScore);
            data.awayScore = Number(game.awayScore);
            data.date = game.game.date;
            data.gameStarted = true;
            data.gameCompleted = game.isCompleted;
            data.displayPlayByPlay = true;
            data.startTime = game.time;
            data.isCompleted = game.isInProgress !== 'true' && game.isUnplayed !== 'true';
            data.plays = [];
            if(game_starting_time.diff(now) < 0){
              const date = game.game.date.replace(/-/g , '');
              return axios.get(`https://www.mysportsfeeds.com/api/feed/pull/${data.league}/latest/game_playbyplay.json?gameid=${data.gameId}`, config)
              .then(response => {
                switch (data.league){
                  case BASEBALL:
                    if(response.data.gameplaybyplay.atBats){
                      data.plays = mlb(response.data).reverse();
                    }
                    data.currentInning = game.currentInning;
                    data.currentInningHalf = game.currentInningHalf;
                    data.innings = game.inningSummary.inning;
                    break;
                  case BASKETBALL:
                    if(response.data.gameplaybyplay.plays){
                      data.plays = nba(response.data);
                      data.timeRemaining = data.plays[0].time;
                    }
                    data.quarter = game.quarterSummary.quarter[game.quarterSummary.quarter.length - 1]['@number'];
                    break;
                  case HOCKEY:
                    if(response.data.gameplaybyplay.plays){
                      data.plays = nhl(response.data);
                      data.timeRemaining = data.plays[0].time;
                    }
                    data.period = game.periodSummary.period[game.periodSummary.period.length - 1]['@number'];
                    data.periods = game.periodSummary.period;
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
              }).catch(error => console.log(error))
            }
          })
      }));
    }
  }).catch(error => console.log(error))
}

module.exports = {addCard, updateDashboard};

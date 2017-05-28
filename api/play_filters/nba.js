const fieldGoalPlay = require('./nba_helper/fieldGoalPlay');
const foulPlay = require('./nba_helper/foulPlay');
const freeThrowPlay = require('./nba_helper/freeThrowPlay');
const jumpBallPlay = require('./nba_helper/jumpBallPlay');
const reboundPlay = require('./nba_helper/reboundPlay');
const substitutionPlay = require('./nba_helper/substitutionPlay');
const turnoverPlay = require('./nba_helper/turnoverPlay');
const violationPlay = require('./nba_helper/violationPlay')

module.exports = function createPlayString(data) {
  const game = data.gameplaybyplay.game;
  const playList = data.gameplaybyplay.plays.play.map((play, id) => {
    const eachPlay = {
      id: id,
      time: play.time,
      quarter: play.quarter,
      sport: 'NBA'
    };
    for(prop in play) {
      switch(prop){
        case 'jumpBall':
          const jump = jumpBallPlay(play[prop]);
          eachPlay.team = play[prop].wonBy === 'HOME' ? game.homeTeam.Abbreviation : game.awayTeam.Abbreviation;
          eachPlay.content = jump.play;
          break;
        case 'fieldGoalAttempt':
          const fieldG = fieldGoalPlay(play[prop]);
          eachPlay.team = fieldG.team;
          eachPlay.content = fieldG.play;
          break;
        case 'foul':
          const foul = foulPlay(play[prop]);
          eachPlay.team = foul.team;
          eachPlay.content = foul.play;
          break;
        case 'freeThrowAttempt':
          const freeThrow = freeThrowPlay(play[prop]);
          eachPlay.team = freeThrow.team;
          eachPlay.content = freeThrow.play;
          break;
        case 'rebound':
          const rebound = reboundPlay(play[prop]);
          eachPlay.team = rebound.team;
          eachPlay.content = rebound.play;
          break;
        case 'substitution':
          if (!play[prop].incomingPlayer){
            return;
          } else {
            const sub = substitutionPlay(play[prop]);
            eachPlay.team = sub.team;
            eachPlay.content = sub.play;
            break;
          }
        case 'turnover':
          const turnover = turnoverPlay(play[prop]);
          eachPlay.team = turnover.team;
          eachPlay.content = turnover.play;
          break;
        case 'violation':
          const violation = violationPlay(play[prop]);
          eachPlay.team = violation.team;
          eachPlay.content = violation.play;
          break;
      }
    }
    if(!eachPlay.content){
      return;
    }
    return eachPlay;
  });
  return playList.filter((play) => play);
}

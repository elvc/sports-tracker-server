const ordinalize = require('../helpers/ordinalize');

const getPlayInfo = plays => plays.reduce((acc, atBat, i) => {
  const item = [];
  if (atBat.inningHalf !== plays[i ? i - 1 : 0].inningHalf) {
    item.push({
      inning: atBat.inning,
      inningHalf: atBat.inningHalf,
      team: atBat.battingTeam.City,
      result: 'NEWINNINGS'
    });
  }

  const batter = atBat.atBatPlay[0].batterUp.battingPlayer.LastName;
  const result = atBat.atBatPlay[0].batterUp.result;

  const runs = atBat.atBatPlay.reduce((a, play) => {
    if (play.baseRunAttempt) {
      const run = {
        runner: play.baseRunAttempt.runningPlayer.LastName,
        safe: play.baseRunAttempt.isSafe,
        base: play.baseRunAttempt.toBase
      };
      return a.concat(run);
    }
    return a;
  }, []);
  item.push({
    batter,
    result,
    runs
  });
  return acc.concat(item);
}, []);

const createPlayString = data => getPlayInfo(data.gameplaybyplay.atBats.atBat).map((play, id) => {
  const output = {
    id,
    content: '',
    sport: 'MLB'
  };
  switch (play.result) {
    case 'NEWINNINGS': {
      output.content = `${play.team} - ${play.inningHalf} of the ${ordinalize(play.inning)}`;
      output.style = 'innings-play-mlb';
      return output;
    }
    case 'SINGLE': {
      output.content = `${play.batter} singled.`;
      break;
    }
    case 'DOUBLE': {
      output.content = `${play.batter} doubled.`;
      break;
    }
    case 'TRIPLE': {
      output.content = `${play.batter} tripled.`;
      break;
    }
    case 'HOMERUN': {
      output.content = `${play.batter} homers.`;
      break;
    }
    case 'SACRIFICE_FLY': {
      output.content = `${play.batter} hit sacrifice fly.`;
      break;
    }
    case 'SACRIFICE_BUNT': {
      output.content = `${play.batter} hit sacrifice bunt.`;
      break;
    }
    case 'STRIKEOUT': {
      output.content = `${play.batter} struck out.`;
      break;
    }
    case 'GROUNDOUT': {
      output.content = `${play.batter} grounded out.`;
      break;
    }
    case 'POPOUT': {
      output.content = `${play.batter} popped out.`;
      break;
    }
    case 'FLYOUT': {
      output.content = `${play.batter} flied out.`;
      break;
    }
    case 'FORCEOUT': {
      output.content = `${play.batter} forced out.`;
      break;
    }
    case 'LINEOUT': {
      output.content = `${play.batter} lined out.`;
      break;
    }
    case 'WALK': {
      output.content = `${play.batter} walked.`;
      break;
    }
    case 'INTENTIONAL_WALK': {
      output.content = `${play.batter} walked.`;
      break;
    }
    case 'DOUBLE_PLAY': {
      output.content = `${play.batter} out in double play.`;
      break;
    }
    case 'TRIPLE_PLAY': {
      output.content = `${play.batter} out in triple play.`;
      break;
    }
    case 'SACRIFICE_FLY_DOUBLE_PLAY': {
      output.content = `${play.batter} hits sacrifice fly resulting in double play.`;
      break;
    }
    case 'SACRIFICE_FLY_TRIPLE_PLAY': {
      output.content = `${play.batter} hits sacrifice fly resulting in triple play.`;
      break;
    }
    case 'SACRIFICE_BUNT_DOUBLE_PLAY': {
      output.content = `${play.batter} hits sacrifice bunt resulting in double play.`;
      break;
    }
    case 'SACRIFICE_BUNT_TRIPLE_PLAY': {
      output.content = `${play.batter} hits sacrifice bunt resulting in triple play.`;
      break;
    }
    case 'HIT_BY_PITCH': {
      output.content = `${play.batter} hit by pitch.`;
      break;
    }
    case 'BATTER_INTERFERENCE': {
      output.content = `${play.batter} out for batter interference.`;
      break;
    }
    case 'CATCHER_INTERFERENCE': {
      output.content = `${play.batter} walks for catcher interference.`;
      break;
    }
    case 'OUTS_WHILE_AT_BAT': {
      output.content = `${play.batter} outs while at bat.`;
      break;
    }
    default: {
      output.content = `${play.batter} batting...`;
      return output;
    }
  }
  play.runs.forEach((run) => {
    if (run.runner !== play.batter) {
      switch (true) {
        case (run.base === '4' && run.safe === 'true'):
          output.content += ` ${run.runner} scored.`;
          output.style = 'scored-play-mlb';
          break;
        case (run.safe === 'true'):
          output.content += ` ${run.runner} to ${ordinalize(run.base)}.`;
          break;
        case (run.base === '4' && run.safe === 'false'):
          output.content += ` ${run.runner} out at home.`;
          break;
        case (run.safe === 'false'):
          output.content += ` ${run.runner} out at ${ordinalize(run.base)}.`;
          break;
        default:
          break;
      }
    }
  });
  return output;
});

module.exports = createPlayString;

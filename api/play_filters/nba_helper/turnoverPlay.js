
module.exports = function turnoverPlay(turnover) {
  const team = turnover.teamAbbreviation;
  const losingPlayer = turnover.lostByPlayer.FirstName + ' ' + turnover.lostByPlayer.LastName;
  const type = turnover.turnoverType;
  const subplay = losingPlayer + ' ' + type;
  let play = type.includes('Turnover') ? subplay : subplay + ' turnover';

  if (turnover.isStolen === 'true'){
    const stealingPlayer = turnover.stolenByPlayer.FirstName + ' ' + turnover.stolenByPlayer.LastName;
    play = play + ` (stolen by ${stealingPlayer})`;  
  } 
  return {team, play};
}
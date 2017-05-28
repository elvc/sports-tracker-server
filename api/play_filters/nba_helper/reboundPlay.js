module.exports = function reboundPlay(rebound){
  const team = rebound.teamAbbreviation;
  const direction = rebound.offensiveOrDefensive === 'OFF' ? 'offensive' : 'defensive';
  let play;
  if(rebound.retrievingPlayer) {
    const player = rebound.retrievingPlayer.FirstName + ' ' + rebound.retrievingPlayer.LastName;
    play = `${player} ${direction} rebound.`;  
  } else {
    play = `${team} ${direction} rebound`;
  }
  return {team, play};
}
module.exports = function fieldGoalPlay (fieldGoalAttempt) {
  const team = fieldGoalAttempt.teamAbbreviation;
  const shooter = fieldGoalAttempt.shootingPlayer.FirstName + ' ' + fieldGoalAttempt.shootingPlayer.LastName;
  const result = fieldGoalAttempt.outcome.toLowerCase();
  const shot =  fieldGoalAttempt.shotType;
  const points = fieldGoalAttempt.Points;
  let play;

  if (result === 'blocked'){
    play = `${shooter} ${shot} ${result} by ${fieldGoalAttempt.blockingPlayer.LastName}`;
  } else {
    play = `${shooter} ${result} ${shot} for ${points} points`;
  }
  
  return {team, play};
}
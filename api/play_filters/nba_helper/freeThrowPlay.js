module.exports = function freeThrowplay(freeThrowAttempt) {
  const shooter = freeThrowAttempt.shootingPlayer.FirstName + freeThrowAttempt.shootingPlayer.LastName;
  const attempt = freeThrowAttempt.attemptNum;
  const total = freeThrowAttempt.totalAttempts;
  const outcome = freeThrowAttempt.outcome.toLowerCase();
  const team = freeThrowAttempt.teamAbbreviation;
  const play = `${shooter} ${outcome} free throw ${attempt} of ${total}`;

  return {team, play};

}
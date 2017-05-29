module.exports = function violationPlay(violation) {
  const team = violation.teamAbbreviation;
  const player = violation.violatingPlayer.FirstName + violation.violatingPlayer.LastName;
  const play = `${player} ${violation.violationType}`
  return {team, play};
}
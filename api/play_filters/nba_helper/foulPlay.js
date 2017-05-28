module.exports = function foulPlay (foul) {
  const team = foul.teamAbbreviation;
  const fouler = foul.penalizedPlayer.FirstName + foul.penalizedPlayer.LastName; 
  let type;
  let play;
  
  if (foul.foulType.includes('S.FOUL')) {
    type = 'shooting foul';
  } else if (foul.foulType.includes('P.FOUL')) {
    type = 'personal foul';
  } else if (foul.foulType.includes('OFF.FOUL')) {
    type = 'offensive foul';
  } else if (foul.foulType.includes('L.B.FOUL')) {
    type = 'loose ball foul';
  } else if (foul.foulType.includes('T.FOUL')) {
    type = 'technical foul';
  } else {
    type = foul.foulType;
  }
  
  if (!foul.drawnByPlayer){
    play = `${fouler} ${type}`;
  } else {
    const drawer =  foul.drawnByPlayer.FirstName + foul.drawnByPlayer.LastName;
    play = `${fouler} ${type} (${drawer} draws the foul)`;
  }
  return {team, play};
  
}
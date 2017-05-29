module.exports = function subPlay(sub){
  const team = sub.teamAbbreviation;
  let incoming;
  let outgoing;
  let play;
  if (sub.incomingPlayer && sub.outgoingPlayer){
    incoming = sub.incomingPlayer.FirstName + ' ' + sub.incomingPlayer.LastName;
    outgoing = sub.outgoingPlayer.FirstName + ' ' + sub.outgoingPlayer.LastName;
    play = `${outgoing} substituted for ${incoming}.`
  } else {
    incoming = sub.incomingPlayer.FirstName + ' ' + sub.incomingPlayer.LastName;
    play =  `${incoming} playing for ${team}`
  }
  return {team, play};
  
}
module.exports = function jumpBallPlay (jumpBall){
  const homePlayer = jumpBall.homePlayer.FirstName + ' ' + jumpBall.homePlayer.LastName;
  const awayPlayer = jumpBall.awayPlayer.FirstName + ' ' + jumpBall.awayPlayer.LastName;
  
  const winner = jumpBall.wonBy === 'HOME' ? homePlayer : awayPlayer;
  
  const team = '';
  const play = `${homePlayer} vs ${awayPlayer} (${winner} gains possession)`
  return {team, play};
}


const moment = require('moment');

module.exports = function (knex) {
  return {
    findByLeagueAndDate: (league, date) => knex.select('games.*', 'awayteam.abbreviation AS awayteam', 'hometeam.abbreviation AS hometeam')
      .from('games')
      .join('teams AS awayteam', 'games.away_team_id', 'awayteam.id')
      .join('teams AS hometeam', 'games.home_team_id', 'hometeam.id')
      .where('games.league', '=', league)
      .andWhere('games.date', '=', date)
      .then(data => data.sort((a, b) => {
        const aDate = moment(`${a.date} ${a.time}`, 'YYYY-MM-DD hh:mmA');
        const bDate = moment(`${b.date} ${b.time}`, 'YYYY-MM-DD hh:mmA');
        return aDate.diff(bDate);
      })),
    findGame: id => knex.select('*')
      .from('games')
      .where('id', '=', id),
    insertGame: game => knex('games').insert({ id: game.gameId, league: game.league, awayTeam: game.awayTeam, homeTeam: game.homeTeam, time: game.time, date: game.date })
  };
};

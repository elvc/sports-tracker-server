const moment = require('moment');

module.exports = function (knex) {
  return {
    findGame: (id) => knex.select('*')
      .from('games')
      .where('id','=', id),
    insertGame: (game) => knex('games').insert({id: game.gameId, league: game.league, away_team_id: game.awayTeamId, home_team_id: game.homeTeamId, time: game.time, date: game.date}),
    insertTeam: (id, abbr) => knex('teams').insert({ id: id, abbreviation: abbr }),
    findTeam: (id) => knex.select('id')
      .from('teams')
      .where('id','=', id),
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
    getGamesByTeam: teamId => knex.select('*')
      .from('games')
      .where('away_team_id', '=', teamId)
      .orWhere('home_team_id', '=', teamId)
      .then(games => games.filter((game) => {
        const days = game.league === 'MLB' ? 3 : 7;
        const gameDate = moment(game.date, 'YYYY-MM-DD');
        return gameDate.isBetween(moment(), moment().add(days, 'days'), 'day', '[]');
      }))
  };
};

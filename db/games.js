module.exports = function(knex) {
  return {
    findByLeagueAndDate: (league, date) => {
      return knex.select('games.*', 'awayteam.abbreviation AS awayteam', 'hometeam.abbreviation AS hometeam')
      .from('games')
      .join('teams AS awayteam', 'games.away_team_id', 'awayteam.id')
      .join('teams AS hometeam', 'games.home_team_id', 'hometeam.id')
      .where('games.league', '=', league).andWhere('games.date', '=', date)
      .orderBy('games.time', 'asc');
    },
    findGame: (id) => {
      return knex.select('*')
      .from('games')
      .where('id','=', id);
    },
    insertGame: (game) => {
      return knex('games').insert({id: game.gameId, league: game.league, awayTeam: game.awayTeam, homeTeam: game.homeTeam, time: game.time, date: game.date});
    }
  };
};
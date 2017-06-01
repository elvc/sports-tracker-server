const moment = require('moment');

module.exports = function (knex) {
  return {

    insertFavouriteTeam: (user_id, team_id) => knex.returning('id')
      .insert({ user_id, team_id }).into('favourites'),
    getTeamsByUser: (user_id) => {
      console.log('favourite teams by user');
      return knex.select('*')
      .from('favourites')
      .where('user_d', '=', user_id);
    },
    getGamesByUser: user_id => knex.raw('select games.*, awayTeam.Abbreviation as awayTeam, homeTeam.Abbreviation as homeTeam from games join teams as awayTeam on away_team_id = awayTeam.id join teams as homeTeam on home_team_id = homeTeam.id where home_team_id in (select team_id from favourites where user_id = ?) or away_team_id in (select team_id from favourites where user_id = ?);', [user_id, user_id])
      .then(games => games.rows.filter((game) => {
        const days = game.league === 'MLB' ? 3 : 7;
        const gameDate = moment(game.date, 'YYYY-MM-DD');
        return gameDate.isBetween(moment(), moment().add(days, 'days'), 'day', '[]');
      }))

      // .from('games')
      // .join('teams', function () {
      //   this.on('games.away_team_id', 'teams.id')
      //     .orOn('games.home_team_id', 'teams.id');
      // })
      // .join('favourites')
      // .on('favourites.team_id', 'teams.id')
      // .where('favourites.user_id', user_id)


  };
};

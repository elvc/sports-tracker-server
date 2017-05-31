module.exports = function(knex) {
  return {

    insertCard: (game, user_id) => {
      return knex.returning('id')
      .insert({user_id: user_id, game_id: Number(game.gameId)})
      .into('cards');
    },
    getCardsByUser: (user_id) => {
      return knex.select('cards.user_id', 'cards.game_id as gameId', 'games.league', 'awayteam.abbreviation as awayteam', 'hometeam.abbreviation as hometeam', 'games.time', 'games.date')
      .from('cards')
      .join('games', 'cards.game_id','games.id')
      .join('teams AS awayteam', 'games.away_team_id', 'awayteam.id')
      .join('teams AS hometeam', 'games.home_team_id', 'hometeam.id')
      .where('cards.user_id', '=', user_id);
    },
    findByGameAndUser: (game_id, user_id) => {
      return knex.select('id')
      .from('cards')
      .where('user_id', '=', user_id).andWhere('game_id', '=', game_id);
    },
    removeCard: (id) => {
      return knex('cards').where(id).del();
    }
  };
};
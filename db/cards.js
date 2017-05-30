module.exports = function(knex) {
  return {

    insertCard: (game, user_id) => {
      return knex.returning('id')
      .insert({user_id: user_id, game_id: Number(game.gameId), league: game.league, awayTeam: game.awayTeam, homeTeam: game.homeTeam, time: game.time, date: game.date})
      .into('cards');
    },
    getCardsByUser: (user_id) => {
      return knex.select('user_id', 'game_id as gameId', 'league', 'awayTeam', 'homeTeam', 'time', 'date')
      .from('cards')
      .where('user_id', '=', user_id);
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
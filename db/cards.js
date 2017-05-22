module.exports = function(knex) {
  return {

    insertCard: (user_id, game_id) => {
      return knex.returning('id')
      .insert({user_id: user_id, game_id: game_id}).into('cards');
    },
    getCardsByUser: (user_id) => {
      console.log('cards by user');
      return knex.select('*')
      .from('cards')
      .where('user_d', '=', user_id);
    }
  };
};
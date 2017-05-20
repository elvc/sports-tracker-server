module.exports = function(knex) {
  return {

    insertFavouriteTeam: (user_id, team_id) => {
      return knex.returning('id')
      .insert({user_id: user_id, team_id: team_id}).into('favourites');
    },
    getTeamsByUser: (user_id) => {
      console.log('favourite teams by user');
      return knex.select('*')
      .from('favourites')
      .where('user_d', '=', user_id);
    }
  };
};
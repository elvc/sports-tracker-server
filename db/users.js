module.exports = function(knex) {
  return {

    insertUser: (username, email, password) => {
      return knex.returning('id')
      .insert({username: firstName, email: email, password: password}).into('users');
    },
    getUserByUserName: (username) => {
      return knex.select('*')
      .from('users')
      .where('username', '=', username);
    }
  };
};
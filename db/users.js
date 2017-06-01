module.exports = function (knex) {
  return {
    insertUser: (username, email, password) => knex.returning('id')
      .insert({ username, email, password }).into('users'),
    getUserByUserName: username => knex.select('*')
      .from('users')
      .where('username', '=', username),
    getUserByEmail: email => knex.select('*')
      .from('users')
      .where('email', '=', email),
    getUserByUserNameOrEmail: (username, email) => knex.select('*')
      .from('users')
      .where('email', email)
      .orWhere('username', username)
  };
};

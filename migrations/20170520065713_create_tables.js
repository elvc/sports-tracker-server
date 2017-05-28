
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users', table => {
      table.increments();
      table.string('username');
      table.string('email');
      table.string('password');
      table.timestamps();
    }),
    knex.schema.createTable('favourites', table => {
      table.increments();
      table.integer('team_id');
      table.integer('user_id')
           .notNullable()
           .references('id')
           .inTable('users')
           .onDelete('CASCADE')
           .index();
      table.timestamps();
    }),
    knex.schema.createTable('cards', table => {
      table.increments();
      table.integer('user_id')
           .notNullable()
           .references('id')
           .inTable('users')
           .onDelete('CASCADE')
           .index();
      table.integer('game_id');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('users'),
    knex.schema.dropTable('favourites'),
    knex.schema.dropTable('cards'),
  ]);
};

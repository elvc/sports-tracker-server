
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('teams', table => {
      table.integer('id').notNullable().primary();
      table.string('city');
      table.string('name');
      table.string('abbreviation');
      table.timestamps();
    }),
    knex.schema.createTable('games', table => {
      table.integer('id').notNullable().primary();
      table.integer('away_team_id')
           .notNullable()
           .references('id')
           .inTable('teams')
           .onDelete('CASCADE')
           .index();
      table.integer('home_team_id')
           .notNullable()
           .references('id')
           .inTable('teams')
           .onDelete('CASCADE')
           .index();
      table.string('league');
      table.string('time');
      table.string('date');
      table.timestamps();
    }),
    knex.schema.table('cards', (table) => {
      table.dropColumn('league');
      table.dropColumn('awayTeam');
      table.dropColumn('homeTeam');
      table.dropColumn('time');
      table.dropColumn('date');
      table.integer('game_id')
           .notNullable()
           .references('id')
           .inTable('games')
           .onDelete('CASCADE')
           .index().alter();
    }),
    knex.schema.table('favourites', (table) => {
      table.integer('team_id')
           .notNullable()
           .references('id')
           .inTable('teams')
           .onDelete('CASCADE')
           .index().alter();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('teams'),
    knex.schema.dropTable('games'),
    knex.schema.table('cards', (table) => {
      table.string('league');
      table.string('awayTeam');
      table.string('homeTeam');
      table.string('time');
      table.string('date');
    })
  ]);
};

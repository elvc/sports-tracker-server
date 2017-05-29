
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('cards', (table) => {
      table.string('league');
      table.string('awayTeam');
      table.string('homeTeam');
      table.string('time');
      table.string('date');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('cards', (table) => {
      table.dropColumn('league');
      table.dropColumn('awayTeam');
      table.dropColumn('homeTeam');
      table.dropColumn('time');
      table.dropColumn('date');
    })
  ]);
};

const faker = require('faker');
const bcrypt = require('bcrypt');

const config = {
  users: 3,
  favourites: 2,
  cards: 5
};

function id(ids) {
  return ids[Math.floor(Math.random() * ids.length)];
}

function team(ids) {
  return 131 + id(ids);
}

function game(ids) {
  return 37705 + id(ids);
}

function empty(length) {
  return new Array(length).fill(undefined);
}

exports.seed = function(knex, Promise) {
  const users = () => {
    const users = empty(config.users).map(() => {
      return { username: faker.internet.userName(), email: faker.internet.email(), password: bcrypt.hashSync("1234", 10) };
    });

    return knex('users').del().then(() => {
      return knex('users').insert(users, 'id');
    });
  };

  const favourites = (users) => {
    const favourites = empty(config.favourites).map(() => {
      return { user_id: id(users), team_id: team(users) };
    });

    return Promise.all([
      users,
      knex('favourites').del().then(() => {
        return knex('favourites').insert(favourites, 'id');
      })
    ]);
  };

  const cards = (all) => {
    const users = all[0];

    const cards = empty(config.cards).map(() => {
      return { user_id: id(users), game_id: game(users) };
    });

    return knex('cards').del().then(() => {
      return knex('cards').insert(cards);
    });
  }

  return users().then(favourites).then(cards);
};
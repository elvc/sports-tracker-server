require('dotenv').config();

const express = require('express');
const path = require('path');

const ENV = process.env.NODE_ENV || 'development';

const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig[ENV]);
const app = express();

app.use(express.static('build'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '/index.html'));
});

const server = app.listen(process.env.PORT || 8080, () => {
  const address = server.address();
  console.log(`Listening on ${address.port}`);
});
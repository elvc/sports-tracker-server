require('dotenv').config();

const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ENV = process.env.NODE_ENV || 'development';

const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig[ENV]);
const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const dbUsers = require('./db/users')(knex);
const dbFavourites = require('./db/favourites')(knex);
const dbCards = require('./db/cards')(knex);

app.use(express.static('build'));

app.get('/', (req, res) => {
 res.sendFile(path.resolve(__dirname, '/index.html'));
});

server.listen(PORT, () => {
   console.log('Sports tracker listening on port ' + PORT);
});

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('post', function (data) {
    console.log(data);

    socket.to(data.room).emit(data.post);
  });
  socket.on('join', function (data) {
    console.log(data);
    socket.join(data.room);
  });
});
require('dotenv').config();

const express = require('express');
const path = require('path');

const ENV = process.env.NODE_ENV || 'development';

const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig[ENV]);
const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static('build'));

server.listen(process.env.PORT || 8080);

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '/index.html'));
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
require('dotenv').config();

const express = require('express');
const path = require('path');
const uuidV4 = require('uuid/v4');

const PORT = process.env.PORT || 8080;
const ENV = process.env.NODE_ENV || 'development';

const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig[ENV]);
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cron = require('node-cron');

const cors = require('cors');

const dbUsers = require('./db/users')(knex);
const dbFavourites = require('./db/favourites')(knex);
const dbCards = require('./db/cards')(knex);

const router = require('./routes/auth');
const api_router = require('./routes/game_api');
const { updateDashboard }= require('./api/feed');

const { sendEmail } = require('./emailer/emailer');

app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true
}));

app.use(express.static('build'));

app.use('/', router);
app.use('/leagues', api_router);

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '/index.html'));
});

server.listen(PORT, () => {
  console.log(`Sports tracker listening on port ${PORT}`);
});

const task = cron.schedule(`0 * * * * *`, function(){
  updateDashboard('MLB', io);
  updateDashboard('NBA', io);
  updateDashboard('NHL', io);
}, false);
task.start();

const broadcastUserCount = (room) => {
  const users = io.sockets.adapter.rooms[room];
  const onlineUsersMsg = {
    type: 'UPDATE_USER_COUNT',
    room,
    userCount: users ? users.length : 0
  };
  io.in(room).emit('action', onlineUsersMsg);
};

const broadcastToRoom = (room, message) => {
  const newMessage = {
    message,
    type: 'RECEIVE_MESSAGE',
    room
  };
  newMessage.message.id = uuidV4();
  io.in(room).emit('action', newMessage);
};

io.on('connection', (socket) => {
  console.log('new client');
  socket.on('action', (action) => {
    switch (action.type) {
      case 'socket/POST_JOIN_ROOM': {
        console.log('joining ', action.payload.roomId);
        socket.join(action.payload.roomId);
        broadcastUserCount(action.payload.roomId);
        break;
      }
      case 'socket/POST_LEAVE_ROOM': {
        console.log('leaving ', action.payload.roomId);
        socket.leave(action.payload.roomId);
        broadcastUserCount(action.payload.roomId);
        break;
      }
      case 'socket/POST_MESSAGE': {
        console.log('post to', action.payload.room, ':', action.payload.message);
        broadcastToRoom(action.payload.room, action.payload.message);
        break;
      }
      default: {
        console.log('unknown action', action);
      }
    }
  });

  let usersRooms = [];
  socket.on('disconnecting', () => {
    usersRooms = Object.values(socket.rooms).filter(e => typeof e === 'number');
  });
  socket.on('disconnect', () => {
    usersRooms.forEach((room) => {
      broadcastUserCount(room);
    });
  });
});


const _ = require('lodash');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const {nanoid} = require('nanoid');

app.use(express.static('public', {index: null}))

app.get('/', (req, res) => {
  res.redirect(`/${nanoid(10)}`);
});

app.get('/health', (req, res) => {
  res.status(200).json({success: true});
});

app.get('/:room', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public/index.html'));
});


class Room {
  constructor(id) {
    this.id = id;
    this.sockets = {};
  }

  async add(socket) {
    await socket.join(this.id);
    this.sockets[socket.user.id] = socket;
  }

  async remove(socket) {
    await socket.leave(this.id);
    delete this.sockets[socket.user.id];
  }

  toJSON() {
    return {
      users: _.map(this.sockets, socket => {
        return {...socket.user};
      }),
      id: this.id
    }
  }
}

const rooms = {};

const getRoom = (roomId) => {
  if (!rooms[roomId])
    rooms[roomId] = new Room(roomId);
  return rooms[roomId];
}


const removeUserFromAllRooms = (socket) => {
  for (let room of Object.values(rooms)) {
    delete room.sockets[socket.user.id];
  }
}

io.on('connection', (socket) => {
  socket.on('join-room', async (roomId, user) => {
    socket.user = user;

    console.log(`JOIN: ${socket.user.id}=>${roomId}`);
    const room = getRoom(roomId);
    await room.add(socket);

    io.to(roomId).emit('room-updated', room.toJSON());

    /* Let everyone know that a new user was connected */
    socket.to(roomId).broadcast.emit('user-connected', socket.user);


    socket.on('update', (user) => {
      socket.user = user;
      io.to(roomId).emit('room-updated', room.toJSON());
    });

    socket.on('disconnect', () => {
      removeUserFromAllRooms(socket);
      io.to(roomId).emit('room-updated', room.toJSON());
      socket.to(roomId).broadcast.emit('user-disconnected', socket.user)
    });
  })
});

http.listen(process.env.PORT || 5474, (err) => {
  console.log(`listening ${process.env.PORT || 5474}`, err);
});



const _ = require('lodash');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const SpaceManager = require('./space-manager');
const spaceManager = new SpaceManager(io);
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

io.on('connection', (socket) => {
  socket.on('space.join', async (spaceId, user) => {
    socket.user = user;

    console.log(`JOIN: ${socket.user.id}=>${spaceId}`);
    const space = spaceManager.getSpaceById(spaceId);
    await space.add(socket);

    space.broadcastState();

    /* Let everyone know that a new user was connected */
    socket.to(spaceId).broadcast.emit('user.conected', socket.user);

    socket.on('user.update', (user) => {
      socket.user = user;
      space.broadcastState();
    });

    socket.on('disconnect', () => {
      spaceManager.removeUserFromRooms(socket);
      space.broadcastState();
      socket.to(spaceId).broadcast.emit('user.disconnected', socket.user)
    });
  })
});

http.listen(process.env.PORT || 5474, (err) => {
  console.log(`listening ${process.env.PORT || 5474}`, err);
});


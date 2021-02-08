const _ = require('lodash');


class Space {
  constructor(id, io) {
    this.io = io;
    this.id = id;

    this.users = {};

    this.createdAt = Date.now();

    this.broadcastState = _.throttle(this.broadcastState.bind(this), 100);
  }

  async add(socket) {
    await socket.join(this.id);
    this.users[socket.user.id] = socket;
  }

  async remove(socket) {
    await socket.leave(this.id);
    delete this.users[socket.user.id];
  }

  broadcastState() {
    this.io.to(this.id).emit('room.updated', this.toJSON());
  }

  toJSON() {
    return {
      users: _.map(this.users, socket => {
        return {...socket.user};
      }),
      id: this.id
    }
  }
}

module.exports = Space;

const Space = require('./space');

class SpaceManager {
  constructor(io) {
    this.io = io;
    this.spaces = {};
  }

  getSpaceById(id) {
    if (!this.spaces[id])
      this.spaces[id] = new Space(id, this.io);
    return this.spaces[id];
  }

  removeUserFromRooms(socket) {
    for (let space of Object.values(this.spaces)) {
      delete space.users[socket.user.id];
    }
  }
}

module.exports = SpaceManager;

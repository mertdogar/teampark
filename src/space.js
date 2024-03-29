const _ = require('lodash');
const Widget = require('./widget');

class Space {
  constructor(id, io) {
    this.io = io;
    this.id = id;

    this.users = {};
    this.widgets = [
      new Widget({
        id: 'asdas013',
        type: 'iframe',
        name: 'An iframe',
        createdAt: new Date(),
        ownerId: null,
        x: 600,
        y: 400,
        z: 1,
        width: 300,
        height: 150,
        data: 'https://play.omma.io/fadbf6501a336702a02e74967997347e2dbbea5ca7f82058640e71dcaa9533d1/index.html',
      }),
      new Widget({
        id: 'asd1r',
        type: 'player',
        name: `Township Rebellion - Fusion Festival, Turmbühne 2018`,
        createdAt: new Date(),
        ownerId: null,
        x: 200,
        y: 700,
        z: 1,
        width: 300,
        height: 200,
        data: 'https://www.youtube.com/watch?v=e-hWYG7O2dA',
      }),
      new Widget({
        id: 'badsssd1r',
        type: 'player',
        name: `Spinnin' | 24/7 Live Radio`,
        createdAt: new Date(),
        ownerId: null,
        x: 900,
        y: 400,
        z: 1,
        width: 150,
        height: 100,
        data: 'https://www.youtube.com/watch?v=BD_guK9b64k  ',
      }),
      new Widget({
        id: 'fountain1',
        type: 'sticker',
        name: `Fountain 1`,
        createdAt: new Date(),
        ownerId: null,
        x: 1200,
        y: 700,
        z: 1,
        width: 96,
        height: 96,
        data: {
          image: 'asset/fountain.gif',
          sound: 'asset/fountain.wav'
        },
      })
    ];

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

  updateWidget(widget) {
    const widget_ = _.find(this.widgets, {id: widget.id});
    widget_.update(widget);
  }

  broadcastState() {
    this.io.to(this.id).emit('space.updated', this.toJSON());
  }

  toJSON() {
    return {
      users: _.map(this.users, socket => ({...socket.user})),
      widgets: _.map(this.widgets, widget => widget.toJSON()),
      id: this.id
    }
  }
}

module.exports = Space;

const _ = require('lodash');


class Widget {
  constructor(raw) {
    this.raw = _.cloneDeep(raw);
    this.id = this.raw.id;
    this.type = this.raw.type;
    this.name = this.raw.name;
    this.createdAt = this.raw.createdAt;
    this.ownerId = this.raw.ownerId;
    this.x = this.raw.x;
    this.y = this.raw.y;
    this.z = this.raw.z;
    this.width = this.raw.width;
    this.height = this.raw.height;
    this.data = this.raw.data;
  }

  async updatePosition({x, y, z, width, height}) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = width;
    this.height = height;
  }

  update(raw) {
    _.assign(this, _.omit(raw, ['id']));
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      createdAt: this.createdAt,
      ownerId: this.ownerId,
      x: this.x,
      y: this.y,
      z: this.z,
      width: this.width,
      height: this.height,
      data: this.data,
    }
  }
}

module.exports = Widget;

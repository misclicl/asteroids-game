import Vector2d from './Vector2d';

const objectDefaults = {
  position: {
    x: 0,
    y: 0,
  },
};

export default class GameObject {
  constructor(args) {
    const params = Object.assign({}, objectDefaults, args);
    this.position = new Vector2d(...params.position);
    this.velocity = new Vector2d(0, 0);
    this.rotation = 0;
  }
  getPosition() {
    return this.position.getPosition();
  }
  setPosition(x, y) {
    this.position = new Vector2d(x, y);
  }
  setRotation(value) {
    this.rotation = value;
  }
  getRotation() {
    return this.rotation;
  }
};

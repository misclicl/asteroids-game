import Vector2d from './Vector2d';
import {radians, degrees} from './utils';

const objectDefaults = {
  position: [0, 0],
};

export default class GameObject {
  constructor(args) {
    const params = { ...objectDefaults, ...args};
    this.position = new Vector2d(...params.position);
    this.velocity = new Vector2d(0, 0);
    this._rotation = 0;
    this.context = params.context || null;
    this.collider = null;
  }
  setCollider(collider) {
    this.collider = collider;
  }
  getCollider() {
    return this.collider;
  }
  removeCollider() {
    this.collider = null;
  }
  attachToContext(context) {
    this.context = context;
  }
  getPosition() {
    return this.position.getPosition();
  }
  setPosition(x, y) {
    this.position = new Vector2d(x, y);
    if (this.collider) {
      this.collider.setPosition(...new Vector2d(x, y).getPosition());
    }
  }
  setRotation(value) {
    this._rotation = radians(value);
  }
  getRotation() {
    return this._rotation;
  }
  getRotationInDegrees() {
    return degrees(this._rotation);
  }
};

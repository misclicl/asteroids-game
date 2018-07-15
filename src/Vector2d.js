export default class Vector2d {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }
  getPosition() {
    return [this.x, this.y];
  }
  add(vector) {
    return new Vector2d(this.x + vector.x, this.y + vector.y);
  }
  mult(value) {
    return new Vector2d(this.x * value, this.y * value);
  }
  min(value) {
    return new Vector2d(Math.min(this.x, value), Math.min(this.y, value));
  }
  isNull() {
    return (this.x !== 0 && this.y !== 0);
  }
}

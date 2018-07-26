const {sin, cos, round, sqrt} = Math;

export default class Vector2d {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  getPosition() {
    return [this.x, this.y];
  }
  getPositionRounded() {
    return [round(this.x), round(this.y)];
  }
  add(vector) {
    return new Vector2d(this.x + vector.x, this.y + vector.y);
  }
  addScalar(value) {
    return new Vector2d(this.x + value, this.y + value);
  }
  mult(value) {
    return new Vector2d(this.x * value, this.y * value);
  }
  min(value) {
    return new Vector2d(Math.min(this.x, value), Math.min(this.y, value));
  }
  getLength() {
    return sqrt(this.x ** 2 + this.y ** 2);
  }
  isNull() {
    return this.x == 0 && this.y == 0;
  }
  rotate(degree) {
    const degreeInRadians = degree;
    const {x, y} = this;
    const newX = round(
      x * cos(degreeInRadians) - y * sin(degreeInRadians)
    );
    const newY = round(
      x * sin(degreeInRadians) + y * cos(degreeInRadians)
    );
    return new Vector2d(newX, newY);
  }
  addVector(vector) {
    return new Vector2d(
      this.x + vector.x,
      this.y + vector.y,
    );
  }
  static randomUnitVector(length = 1) {
    const angle = Math.random() * Math.PI * 2;
    return new Vector2d(length * Math.cos(angle), length * Math.sin(angle));
  }
}

import GameObject from './GameObject';
import Vector2d from './Vector2d';
import {randomFloat} from './utils';

export default class Particle extends GameObject {
  constructor(args) {
    super(args);
    this.speed = 3;

    this.velocity = new Vector2d(randomFloat(-1, 1), randomFloat(-1, 1)).mult(
      this.speed
    );
  }
  update() {
    this.position = this.position.add(this.velocity);
    this.velocity = this.velocity.mult(0.95);
  }
  render(context) {
    const [x, y] = this.getPosition();

    context.save();
    context.translate(x, y);
    context.fillStyle = 'white';
    context.fillRect(0, 0, 1, 1);

    context.restore();

    this.update();
  }
}

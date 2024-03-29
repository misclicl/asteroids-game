import GameObject from '../core/GameObject';
import Vector2d from '../core/Vector2d';
import {randomFloat} from '../core/utils';

export default class Particle extends GameObject {
  constructor(args) {
    super(args);
    this.speed = 2;

    this.velocity = Vector2d.randomUnitVector(randomFloat(.5, 2)).mult(
      this.speed
    );
  }
  update() {
    this.position = this.position.add(this.velocity);
    this.velocity = this.velocity.mult(0.92);
  }
  render(context) {
    const [x, y] = this.position.getPositionRounded();

    context.save();
    context.translate(x, y);
    context.fillStyle = 'rgba(255,255,255, 0.3)';
    context.fillRect(0, 0, 2, 2);

    context.restore();

    this.update();
  }
}

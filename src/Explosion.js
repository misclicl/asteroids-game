import GameObject from './GameObject';
import Particle from './Particle';
import {randomInt} from './utils';

export default class Explosion extends GameObject {
  constructor(args) {
    super(args);
    this.particles = [];
    for (let index = 0; index < randomInt(12, 20); index++) {
      this.particles.push(new Particle({
        position: this.getPosition(),
      }));
    }
    this.timer = 0;
  }
  render(context) {
    this.timer ++;
    const [x, y] = this.getPosition();

    context.save();
    context.translate(x, y);

    context.beginPath();
    context.beginPath();

    context.closePath();

    context.strokeStyle = 'blue';
    context.fillStyle = 'blue';

    context.stroke();
    context.restore();

    this.particles.forEach((particle) => {
      particle.render(context);
    });
    if (this.timer > 13) {
      this.particles = [];
    }
  }
}

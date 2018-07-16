import GameObject from './core/GameObject';
import Particle from './Particle';
import {randomInt} from './core/utils';

export default class Explosion extends GameObject {
  constructor(args) {
    super(args);
    this.particles = [];
    for (let index = 0; index < randomInt(12, 15); index++) {
      this.particles.push(new Particle({
        position: this.getPosition(),
      }));
    }
    this.timer = 0;
    const audio = new Audio(`explosion${randomInt(2, 3)}.wav`);
    audio.volume = .3;
    audio.play();
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
    if (this.timer > 25) {
      this.particles = [];
    }
  }
}

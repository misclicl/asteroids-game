import Particle from './Particle';

export default class ShipParticle extends Particle {
  constructor(args) {
    super(args);
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

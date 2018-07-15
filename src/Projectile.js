import GameObject from './GameObject';

export default class Projectile extends GameObject {
  constructor(args) {
    super(args);
    this.speed = 8;
    this.velocity = args.velocity.mult(this.speed);
  }
  update() {
    this.position = this.position.add(this.velocity);
  }
  render(context) {
    const [x, y] = this.getPosition();

    context.save();
    context.translate(x, y);

    context.beginPath();
    context.beginPath();
    context.arc(0, 0, 1, 0, Math.PI*2, true);
    context.closePath();

    context.strokeStyle = 'white';
    context.stroke();
    context.restore();

    this.update();
  }
}

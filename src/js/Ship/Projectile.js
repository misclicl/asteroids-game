import GameObject from '../core/GameObject.js';

export default class Projectile extends GameObject {
  constructor(args) {
    super(args);
    this.speed = 4;
    this.velocity = args.velocity.mult(this.speed);
  }
  update() {
    this.setPosition(...this.position.add(this.velocity).getPosition());
  }
  render({context, hidden} = {}) {
    const [x, y] = this.getPosition();
    const contextToUse = context || this.context;

    contextToUse.save();
    contextToUse.translate(x, y);

    contextToUse.beginPath();
    contextToUse.arc(0, 0, 1, 0, Math.PI*2, true);
    contextToUse.closePath();

    contextToUse.strokeStyle = 'white';
    contextToUse.stroke();
    contextToUse.restore();

    if (hidden) {
      if (this.collider) {
        this.collider.render();
      }
    }

    this.update();
  }
}

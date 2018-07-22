import GameObject from '../core/GameObject.js';
import {drawGlowing} from '../core/utils.js';
import Vector2d from '../core/Vector2d.js';

export default class Projectile extends GameObject {
  constructor(args) {
    super(args);
    this.speed = 8 * 2.5;
    this.velocity = args.velocity.mult(this.speed);
  }
  update() {
    this.setPosition(...this.position.add(this.velocity).getPosition());
  }
  render({context, hidden, update} = {}) {
    if (update) {
      this.update();
    }
    const [x, y] = this.position.getPositionRounded();
    const contextToUse = context || this.context;

    drawGlowing([new Vector2d(0, 0)], contextToUse, [x, y], 0, true);

    contextToUse.save();
    contextToUse.translate(x, y);
    contextToUse.fillStyle = 'rgb(224,255,255)';
    contextToUse.fillRect(0, 0, 2, 2);


    contextToUse.restore();

    if (hidden) {
      const collider = this.getCollider();
      if (collider) {
        collider.render();
      }
    }
  }
}

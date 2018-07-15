import GameObject from './GameObject';
import Vector2d from './Vector2d';

export default class Collider extends GameObject {
  constructor(args = {}) {
    super(args);
    this.blank = args.blank || false;
    this.size = args.size || 10;
    this.hasCollision = false;
  }
  collides(collider) {
    const [x, y] = this.getPosition();
    const [colliderX, colliderY] = collider.getPosition();

    const deltaRadius = this.size / 2 + collider.size / 2;
    const deltaX = colliderX - x;
    const deltaY = y - colliderY;

    const result = (deltaX ** 2 + deltaY ** 2) <= (deltaRadius ** 2);

    this.hasCollision = result;
    return result;
  }
  setPosition(x, y) {
    this.position = new Vector2d(x, y);
  }
  render(context) {
    const contextToUse = context || this.context;
    const [x, y] = this.getPosition();
    const radius = this.size / 2;

    contextToUse.save();
    contextToUse.translate(x, y);

    contextToUse.beginPath();
    contextToUse.arc(0, 0, radius, 0, Math.PI*2, true);
    contextToUse.closePath();
    contextToUse.strokeStyle = this.hasCollision ? 'red' : 'green';
    contextToUse.stroke();

    contextToUse.restore();
  }
}

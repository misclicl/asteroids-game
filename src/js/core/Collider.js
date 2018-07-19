import GameObject from './GameObject';
import Vector2d from './Vector2d';

const {abs, sqrt} = Math;

const insideCircle = (xP, yP, xC, yC, radius) =>
  sqrt(abs(xP - xC) ** 2 + abs(yP - yC) ** 2) < radius;

export default class Collider extends GameObject {
  constructor(args = {}) {
    const params = Object.assign({}, Collider.defaults, args);
    super(params);
    this.blank = params.blank || false;
    this.type = params.type;
    this.hasCollision = false;

    if (this.type === Collider.types.CUSTOM) {
      this.shape = params.shape;
    } else {
      this.size = params.size || 10;
    }
  }
  collides(collider) {
    const [x, y] = this.getPosition();
    const [colliderX, colliderY] = collider.getPosition();

    if (
      this.type === Collider.types.CURCULAR &&
      collider.type === Collider.types.CURCULAR
    ) {
      const deltaRadius = this.size / 2 + collider.size / 2;
      const deltaX = colliderX - x;
      const deltaY = y - colliderY;

      const result = deltaX ** 2 + deltaY ** 2 <= deltaRadius ** 2;

      this.hasCollision = result;
      collider.hasCollision = result;
      return result;
    } else if (
      this.type === Collider.types.CUSTOM &&
      collider.type === Collider.types.CURCULAR
    ) {
      const radius = collider.size / 2;
      const result = this.shape.some((vertex, index) => {
        const posX = vertex.x + x;
        const posY = vertex.y + y;
        return insideCircle(posX, posY, colliderX, colliderY, radius);
      });

      this.hasCollision = result;
      collider.hasCollision = result;
      return result;
    } else if (
      this.type === Collider.types.CURCULAR &&
      collider.type === Collider.types.CUSTOM
    ) {
      const radius = this.size / 2;
      const result = collider.shape.some((vertex, index) => {
        const posX = vertex.x + colliderX;
        const posY = vertex.y + colliderY;
        return insideCircle(posX, posY, x, y, radius);
      });

      this.hasCollision = result;
      collider.hasCollision = result;
      return result;
    }
  }
  setShape(shape) {
    if (this.type === Collider.types.CUSTOM) {
      this.shape = shape;
    }
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
    if (this.type === Collider.types.CURCULAR) {
      contextToUse.arc(0, 0, radius, 0, Math.PI * 2, true);
      contextToUse.closePath();
    } else {
      this.shape.forEach((vertex, index, array) => {
        contextToUse.moveTo(...vertex.getPosition());
        const secondPoint = array[index + 1] ? array[index + 1] : array[0];
        contextToUse.lineTo(...secondPoint.getPosition());
      });
    }
    contextToUse.strokeStyle = this.hasCollision ? 'red' : 'green';
    contextToUse.stroke();

    contextToUse.restore();
  }
}

Collider.types = {
  CURCULAR: 'curcular',
  CUSTOM: 'custom',
};

Collider.defaults = {
  type: Collider.types.CURCULAR,
  hasCollision: true,
};

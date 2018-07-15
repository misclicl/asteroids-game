import Vector2d from './Vector2d.js';
import GameObject from './GameObject.js';
import Projectile from './Projectile.js';
import {radians} from './utils.js';

const {sin, cos} = Math;

const playerDefaults = {
  size: 20,
};

class Ship extends GameObject {
  constructor(args) {
    const params = Object.assign({}, playerDefaults, args);
    super(params);
    this.size = params.size;
    this.projectiles = [];

    this.shape = this.calculateShape();
  }
  calculateShape() {
    const {size} = this;
    const noseAngleInRadians = radians(16);

    const shape = {
      nose: [0, -size/2],
    };
    shape.leftCorner = [
      sin(noseAngleInRadians) * size,
      cos(noseAngleInRadians) * size + shape.nose[1],
    ];
    shape.rightCorner = [
      -sin(noseAngleInRadians) * size,
      cos(noseAngleInRadians) * size + shape.nose[1],
    ];
    shape.leftTail = [
      sin(noseAngleInRadians) * 5 + shape.leftCorner[0],
      cos(noseAngleInRadians) * 5 + shape.leftCorner[1],
    ],
    shape.rightTail = [
      -sin(noseAngleInRadians) * 5 + shape.rightCorner[0],
      cos(noseAngleInRadians) * 5 + shape.rightCorner[1],
    ];
    return shape;
  }
  update() {
    this.position = this.position.add(this.velocity);
    this.velocity = this.velocity.mult(0.99);
  }
  shoot() {
    const rotation = this.getRotation();
    const projectilePosition = new Vector2d(
      Math.sin(rotation),
      -Math.cos(rotation)
    ).mult(this.size / 2);
    const projectileVector = this.position.add(projectilePosition);

    this.projectiles.push(
      new Projectile({
        position: projectileVector.getPosition(),
        velocity: new Vector2d(Math.sin(rotation), -Math.cos(rotation)),
      })
    );
  }
  accelerate() {
    const rotation = this.getRotation();
    const force = new Vector2d(Math.sin(rotation), -Math.cos(rotation));
    this.velocity = this.velocity.add(force.mult(0.05)).min(3);
  }
  render(context) {
    const [x, y] = this.getPosition();
    const {nose, leftCorner, leftTail, rightCorner, rightTail} = this.shape;

    this.projectiles.forEach((projectile) => {
      projectile.render(context);
    });

    context.save();
    context.translate(x, y);
    context.rotate(this.rotation);
    context.beginPath();

    context.moveTo(...nose);
    context.lineTo(...leftTail);

    context.moveTo(...nose);
    context.lineTo(...rightTail);

    context.moveTo(...rightCorner);
    context.lineTo(...leftCorner);

    context.strokeStyle = 'white';
    context.stroke();

    context.restore();
  }
}

export default Ship;

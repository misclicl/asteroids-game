import Vector2d from '../core/Vector2d.js';
import GameObject from '../core/GameObject.js';
import Projectile from './Projectile.js';
import {radians} from '../core/utils.js';
import {plotLine} from '../core/plotLine';
import Collider from '../core/Collider.js';
import EngineFire from './EngineFire.js';

const {round} = Math;

const {sin, cos} = Math;

const playerDefaults = {
  size: 18,
  rotationRate: 0.05,
};

class Ship extends GameObject {
  constructor(args) {
    const params = Object.assign({}, playerDefaults, args);
    super(params);
    this.size = params.size;
    this.rotationRate = params.rotationRate;
    this.projectiles = [];
    this.enginesActive = false;
    this.projectileCounter = 0;

    this.engineFire = new EngineFire({
      position: this.position,
      rotation: this.rotation,
      sizeShift: this.size / 2,
    });

    this.shape = this.calculateShape();
  }
  setPosition(x, y) {
    this.position = new Vector2d(x, y);
    const [newX, newY] = this.position.getPosition();
    if (this.collider) {
      this.collider.setPosition(newX, newY);
    }
    this.engineFire.setPosition(newX, newY);
  }
  setRotation(value) {
    this.rotation = value;
    this.engineFire.setRotation(value);
  }
  attachToContext(context) {
    this.context = context;
    this.engineFire.attachToContext(context);
  }
  calculateShape() {
    const {size} = this;
    const noseAngleInRadians = radians(17);
    const innerAngleInRadians = radians(6);

    const shape = {
      nose: [0, -size / 2],
    };

    const unitVectorX = sin(noseAngleInRadians);
    const unitVectorY = cos(noseAngleInRadians);
    const unitVectorXInner = sin(innerAngleInRadians);
    const unitVectorYInner = cos(innerAngleInRadians);

    shape.leftCorner = [unitVectorX * size, unitVectorY * size + shape.nose[1]];
    shape.leftCornerInner = [
      unitVectorXInner * size,
      unitVectorYInner * size + shape.nose[1],
    ];
    shape.rightCorner = [
      -unitVectorX * size,
      unitVectorY * size + shape.nose[1],
    ];
    shape.rightCornerInner = [
      -unitVectorXInner * size,
      unitVectorYInner * size + shape.nose[1],
    ];
    shape.leftTail = [
      unitVectorX * 5 + shape.leftCorner[0],
      unitVectorY * 5 + shape.leftCorner[1],
    ];
    shape.rightTail = [
      -unitVectorX * 5 + shape.rightCorner[0],
      unitVectorY * 5 + shape.rightCorner[1],
    ];
    for (let point in shape) {
      if (shape.hasOwnProperty(point)) {
        shape[point] = shape[point].map(round);
      }
    }
    return shape;
  }
  update() {
    this.setPosition(...this.position.add(this.velocity).getPosition());
    this.velocity = this.velocity.mult(0.99);
  }
  shoot() {
    if (this.projectiles.length <= 3) {
      const audio = new Audio('shot.wav');
      audio.play();
      const rotation = this.getRotation();
      const projectilePosition = new Vector2d(
        Math.sin(rotation),
        -Math.cos(rotation)
      ).mult(this.size / 2);
      const projectileVector = this.position.add(projectilePosition);

      const projectile = new Projectile({
        position: projectileVector.getPosition(),
        velocity: new Vector2d(Math.sin(rotation), -Math.cos(rotation)),
      });

      const projectileCollider = new Collider({
        size: 3,
      });
      projectile.attachToContext(this.context);
      projectileCollider.attachToContext(this.context);
      projectile.addCollider(projectileCollider);
      projectile.id = this.projectileCounter;

      this.projectiles.push(projectile);

      const lastId = this.projectileCounter;
      this.projectileCounter++;
      setTimeout(() => {
        const idx = this.projectiles.findIndex(
          (projectile) => projectile.id == lastId
        );

        if (idx >= 0) {
          this.projectiles.splice(idx, 1);
        }
      }, 1500);
    }
  }
  rotateRight() {
    this.setRotation(this.rotation + this.rotationRate);
  }
  rotateLeft() {
    this.setRotation(this.rotation - this.rotationRate);
  }
  stop() {
    this.enginesActive = false;
  }
  accelerate() {
    this.enginesActive = true;
    const rotation = this.getRotation();
    const force = new Vector2d(Math.sin(rotation), -Math.cos(rotation));
    this.velocity = this.velocity.add(force.mult(0.1)).min(6);
  }
  render(context) {
    const [x, y] = this.getPosition();
    const contextToUse = context || this.context;
    const {
      nose,
      leftTail,
      rightTail,
      leftCornerInner,
      rightCornerInner,
    } = this.shape;

    this.projectiles.forEach((projectile) => {
      projectile.render({});
    });
    if (this.enginesActive) {
      this.engineFire.render();
    }

    contextToUse.save();
    contextToUse.translate(x, y);
    contextToUse.rotate(this.rotation);

    plotLine(...nose, ...leftTail, contextToUse);
    plotLine(...nose, ...rightTail, contextToUse);
    plotLine(...rightTail, ...rightCornerInner, contextToUse);
    plotLine(...rightCornerInner, ...leftCornerInner, contextToUse);
    plotLine(...leftCornerInner, ...leftTail, contextToUse);

    contextToUse.restore();
  }
}

export default Ship;

import Vector2d from '../core/Vector2d.js';
import GameObject from '../core/GameObject.js';
import Projectile from './Ship/Projectile.js';
import {radians, drawGlowing, randomFloat} from '../core/utils.js';
import {plotLine} from '../core/plotLine.js';
import Collider from '../core/Collider.js';
import {shape} from '../resources/ufo.json';
import Sound from '../core/Sound.js';

const {sin, cos} = Math;

const saucerShape = shape.map((line) => {
  return [
    new Vector2d(line[0][0], line[0][1]),
    new Vector2d(line[1][0], line[1][1]),
  ];
});

class Saucer extends GameObject {
  constructor(args) {
    const params = Object.assign({}, Saucer.defaults, args);
    super(params);
    this.initialPosition = params.position;
    this.size = params.size;
    this.rotationRate = params.rotationRate;
    this.velocity = params.velocity;
    this.context = params.context;
    this.projectiles = [];
    this.projectileCounter = 0;
    this.state = true;
    this.timer = 0;
    this.shotSound = new Sound({
      src: 'shot_saucer.wav',
      volume: 0.2,
    });

    // setInterval(() => {
    //   this.shoot();
    // }, 1000);
  }
  setPosition(x, y) {
    this.position = new Vector2d(x, y);
    const [newX, newY] = this.position.getPosition();
    const collider = this.getCollider();
    if (collider) {
      collider.setPosition(newX, newY);
    }
  }
  setRotation(value) {
    this._rotation = radians(value);

    for (let point in shape) {
      if (shape.hasOwnProperty(point)) {
        shape[point] = shape[point].rotate(this.getRotation());
      }
    }

    this._displayedShape = shape;

    if (this.collider) {
      this.collider.setShape([
        this._displayedShape.nose,
        this._displayedShape.leftTail,
        this._displayedShape.rightTail,
      ]);
    }
  }
  attachToContext(context) {
    this.context = context;
  }
  update() {
    this.timer++;
    this.setPosition(...this.position.add(this.velocity).getPosition());
  }
  shoot() {
    if (this.projectiles.length <= 3) {
      this.shotSound.play();

      const projectileVector = this.position;

      const projectile = new Projectile({
        position: projectileVector.getPosition(),
        velocity: Vector2d.randomUnitVector(),
      });

      const projectileCollider = new Collider({
        size: 3,
      });
      projectile.attachToContext(this.context);
      projectileCollider.attachToContext(this.context);
      projectile.setCollider(projectileCollider);
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
      }, 3000);
    }
  }
  reset() {
    this.setPosition(...this.initialPosition);
    this.setRotation(0);
    this.velocity = Ufo.defaults.velocity;
  }
  rotateRight() {
    const newRotation = this.getRotationInDegrees() + this.rotationRate;
    this.setRotation(newRotation);
  }
  rotateLeft() {
    this.setRotation(this.getRotationInDegrees() - this.rotationRate);
  }
  stop() {}
  accelerate() {
    const rotation = this.getRotation();
    const force = new Vector2d(sin(rotation), -cos(rotation));
    this.velocity = this.velocity.add(force.mult(0.1 * 2.5)).min(6);
  }
  setState(value) {
    this.state = value;
  }
  render(context, update = true) {
    if (update) {
      this.update();
    }

    const [offsetX, offsetY] = this.getPosition();
    const offsetVector = new Vector2d(offsetX, offsetY);
    const contextToUse = context || this.context;

    if (this.collider.visible) {
      this.collider.render();
    }

    this.projectiles.forEach((projectile) => {
      // projectile.update();
      projectile.render({update});
    });

    drawGlowing(saucerShape, contextToUse, [offsetX, offsetY], 0, false);

    saucerShape.forEach((line) => {
      plotLine(
        line[0].addVector(offsetVector),
        line[1].addVector(offsetVector),
        contextToUse
      );
    });
  }
}

Saucer.defaults = {
  size: 22,
  rotationRate: 6,
  velocity: new Vector2d(randomFloat(3, 5), randomFloat(-2, 2)),
};

export default Saucer;

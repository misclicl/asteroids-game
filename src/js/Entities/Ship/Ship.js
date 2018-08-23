import Vector2d from '../../core/Vector2d.js';
import GameObject from '../../core/GameObject.js';
import Projectile from './Projectile.js';
import {radians, drawGlowing} from '../../core/utils.js';
import {plotLine} from '../../core/plotLine.js';
import Collider from '../../core/Collider.js';
import EngineFire from './EngineFire.js';
import Sound from '../../core/Sound.js';

const {sin, cos, round} = Math;

class Ship extends GameObject {
  constructor(args) {
    const params = Object.assign({}, Ship.defaults, args);
    super(params);
    this.initialPosition = params.position;
    this.size = params.size;
    this.rotationRate = params.rotationRate;
    this.velocity = params.velocity;
    this.projectiles = [];
    this.enginesActive = false;
    this.projectileCounter = 0;
    this.state = true;
    this._shape = this.calculateShape();
    this._displayedShape = this._shape;

    this.engineFire = new EngineFire({
      position: this.position,
      rotation: this._rotation,
      sizeShift: this.size / 2,
    });

    this.shotSound = new Sound({
      src: '/sounds/shot_ship.wav',
      volume: 1,
    });
  }
  setPosition(x, y) {
    this.position = new Vector2d(x, y);
    const [newX, newY] = this.position.getPosition();
    const collider = this.getCollider();
    if (collider) {
      collider.setPosition(newX, newY);
    }
    this.engineFire.setPosition(newX, newY);
  }
  setRotation(value) {
    this._rotation = radians(value);
    this.engineFire.setRotation(value);

    const shape = Object.assign({}, this._shape);

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
    this.engineFire.attachToContext(context);
  }
  calculateShape() {
    const {size} = this;
    const noseAngleInRadians = radians(17);
    const innerAngleInRadians = radians(6);

    const unitVectorX = sin(noseAngleInRadians);
    const unitVectorY = cos(noseAngleInRadians);
    const unitVectorXInner = sin(innerAngleInRadians);
    const unitVectorYInner = cos(innerAngleInRadians);

    const nose = [0, -size / 2];
    const leftCorner = [unitVectorX * size, unitVectorY * size + nose[1]];
    const rightCorner = [-unitVectorX * size, unitVectorY * size + nose[1]];
    const leftCornerInner = [
      unitVectorXInner * size,
      unitVectorYInner * size + nose[1],
    ];
    const rightCornerInner = [
      -unitVectorXInner * size,
      unitVectorYInner * size + nose[1],
    ];
    const leftTail = [
      unitVectorX * 5 + leftCorner[0],
      unitVectorY * 5 + leftCorner[1],
    ];
    const rightTail = [
      -unitVectorX * 5 + rightCorner[0],
      unitVectorY * 5 + rightCorner[1],
    ];

    const shape = {
      nose: new Vector2d(...nose),
      leftTail: new Vector2d(...leftTail),
      rightTail: new Vector2d(...rightTail),
      rightCornerInner: new Vector2d(...rightCornerInner),
      leftCornerInner: new Vector2d(...leftCornerInner),
    };

    return shape;
  }
  update() {
    this.setPosition(...this.position.add(this.velocity).getPosition());
    this.velocity = this.velocity.mult(0.99);
  }
  shoot() {
    if (this.projectiles.length <= 3) {
      this.shotSound.play();

      const rotation = this.getRotation();
      const projectilePosition = new Vector2d(
        sin(rotation),
        -cos(rotation)
      ).mult(this.size / 2);

      const projectileVector = this.position.add(projectilePosition);

      const projectile = new Projectile({
        position: projectileVector.getPosition(),
        velocity: new Vector2d(sin(rotation), -cos(rotation)).mult(
          1 + this.velocity.getLength() * 0.03
        ),
      });

      const projectileCollider = new Collider({
        size: 4,
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
      }, 1000);
    }
  }
  reset() {
    this.setPosition(...this.initialPosition);
    this.setRotation(0);
    this.velocity = Ship.defaults.velocity;
    this.enginesActive = false;
  }
  rotateRight() {
    const newRotation = this.getRotationInDegrees() + this.rotationRate;
    this.setRotation(newRotation);
  }
  rotateLeft() {
    this.setRotation(this.getRotationInDegrees() - this.rotationRate);
  }
  stop() {
    this.enginesActive = false;
  }
  accelerate() {
    this.enginesActive = true;
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
    if (this.state) {
      const [x, y] = this.getPosition();
      const contextToUse = context || this.context;

      this.projectiles.forEach((projectile) => {
        projectile.render({update});
      });

      const {
        nose,
        leftTail,
        rightTail,
        leftCornerInner,
        rightCornerInner,
      } = this._displayedShape;

      drawGlowing(
        [nose, leftTail, leftCornerInner, rightCornerInner, rightTail],
        contextToUse,
        [x, y]
      );

      if (this.enginesActive) {
        this.engineFire.render();
      }

      contextToUse.save();
      contextToUse.translate(round(x), round(y));

      plotLine(nose, leftTail, contextToUse);
      plotLine(nose, rightTail, contextToUse);
      plotLine(rightTail, rightCornerInner, contextToUse);
      plotLine(rightCornerInner, leftCornerInner, contextToUse);
      plotLine(leftCornerInner, leftTail, contextToUse);

      contextToUse.restore();
    }
  }
}

Ship.defaults = {
  size: 18,
  rotationRate: 6,
  velocity: new Vector2d(0, 0),
};

export default Ship;

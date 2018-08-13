import {plotLine} from '../core/plotLine.js';
import Vector2d from '../core/Vector2d.js';
import GameObject from '../core/GameObject.js';
import {
  randomFloat,
  drawGlowing,
  randomElementFromArray,
} from '../core/utils.js';
import Explosion from './Explosion.js';
import asteroids from '../resources/asteroids.json';

const {round} = Math;

const transformToBig = (pair) => [pair[0] * 1.7, pair[1] * 1.7];
const transformToMedium = (pair) => [pair[0] * 0.7, pair[1] * 0.7];
const transformToSmall = (pair) => [pair[0] * 0.4, pair[1] * 0.4];
const toVector = (pair) => new Vector2d(round(pair[0]), round(pair[1]));

const newShapes = asteroids.shapes.map((set) => {
  return {
    big: set.map(transformToBig).map(toVector),
    small: set.map(transformToSmall).map(toVector),
    medium: set.map(transformToMedium).map(toVector),
  };
});

export default class Asteroid extends GameObject {
  constructor(args) {
    const params = Object.assign({}, Asteroid.defaults, args);

    super(params);
    this.type = params.type;
    this.size = Asteroid.types[this.type].size;
    this.vertices = this.generateShape();
    this.destroyed = false;

    const velocityMultiplier = Asteroid.types[this.type].velocityMultiplier;

    const minSpeed = params.minSpeed * velocityMultiplier;
    const maxSpeed = params.maxSpeed * velocityMultiplier;

    this.velocity = Vector2d.randomUnitVector(randomFloat(minSpeed, maxSpeed));
  }
  defaults = {
    minSpeed: 0.7,
    maxSpeed: 2,
    type: 'big',
  }
  update() {
    const [x, y] = this.position.add(this.velocity).getPosition();
    this.position = new Vector2d(round(x), round(y));
  }
  generateShape() {
    const vertices = randomElementFromArray(newShapes)[this.type];
    return vertices;
  }
  explode() {
    this.destroyed = true;
    this.explosion = new Explosion({
      position: this.getPosition(),
    });
  }
  render(context, update = true) {
    if (update) {
      this.update();
    }
    const [x, y] = this.getPosition();

    drawGlowing(
      this.vertices,
      context,
      [x, y]
    );

    if (this.explosion) {
      this.explosion.render(context);
    }

    // this.collider.render();

    if (!this.destroyed) {
      context.save();
      context.translate(x, y);

      this.vertices.forEach((vertex, index, array) => {
        const secondPoint = array[index + 1] ? array[index + 1] : array[0];
        plotLine(vertex, secondPoint, context);
      });
      context.restore();
    }
  }
}

Asteroid.types = {
  small: {
    velocityMultiplier: 4,
    size: 16,
  },
  medium: {
    velocityMultiplier: 2.7,
    size: 25,
  },
  big: {
    velocityMultiplier: 2.2,
    size: 60,
  },
};

Asteroid.defaults = {
  minSpeed: 0.7,
  maxSpeed: 2,
  type: 'big',
};

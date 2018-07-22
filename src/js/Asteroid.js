import {plotLine} from './core/plotLine';
import Vector2d from './core/Vector2d';
import GameObject from './core/GameObject';
import {
  randomFloat,
  randomInt,
  drawGlowing,
  randomElementFromArray,
} from './core/utils';
import Explosion from './Explosion';
import asteroids from './resources/asteroids.json';

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

const sizesToType = {
  big: 60,
  medium: 25,
  small: 16,
};

export default class Asteroid extends GameObject {
  constructor(args) {
    const params = Object.assign({}, Asteroid.defaults, args);

    super(params);
    this.type = params.type;
    this.size = sizesToType[this.type];
    this.vertices = this.generateShape();
    this.destroyed = false;

    const {minSpeed, maxSpeed} = params;

    this.velocity = new Vector2d(
      [randomFloat(minSpeed, maxSpeed), randomFloat(-minSpeed, -maxSpeed)][
        randomInt(0, 1)
      ],
      [randomFloat(minSpeed, maxSpeed), randomFloat(-minSpeed, -maxSpeed)][
        randomInt(0, 1)
      ]
    );
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

Asteroid.defaults = {
  minSpeed: 0.7,
  maxSpeed: 2,
  type: 'big',
};

import {plotLine} from './core/plotLine';
import Vector2d from './core/Vector2d';
import GameObject from './core/GameObject';
import {randomFloat, randomInt, drawGlowing} from './core/utils';
import Explosion from './Explosion';

const {round} = Math;

const asteroidDefaults = {
  minSpeed: 0.7 * 2.5,
  maxSpeed: 2 * 2.5,
  type: 'big',
};

const typeParams = {
  small: {
    sizesRange: [12, 12],
    verticesRange: [5, 9],
    radiusDeviation: 2,
  },
  medium: {
    sizesRange: [20, 25],
    verticesRange: [5, 9],
    radiusDeviation: 3,
  },
  big: {
    sizesRange: [50, 65],
    verticesRange: [9, 13],
    radiusDeviation: 9,
  },
};

export default class Asteroid extends GameObject {
  constructor(args) {
    const params = Object.assign({}, asteroidDefaults, args);

    super(params);
    this.type = params.type;
    this.size = randomInt(...typeParams[this.type].sizesRange);
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
    this.position = this.position.add(this.velocity);
  }
  generateShape() {
    const {sin, cos} = Math;
    const verticesN = randomInt(...typeParams[this.type].verticesRange);
    const iterationStep = Math.PI * 2 / verticesN;

    const vertices = [];
    const radius = this.size / 2;
    const radiusDeviation = typeParams[this.type].radiusDeviation;

    for (let i = 0; i < verticesN; i++) {
      vertices.push(
        new Vector2d(
          round(cos(i * iterationStep) * radius +
            randomFloat(-radiusDeviation, radiusDeviation)),
          round(sin(i * iterationStep) * radius +
            randomFloat(-radiusDeviation, radiusDeviation)),
        )
      );
    }
    return vertices;
  }
  explode() {
    this.destroyed = true;
    this.explosion = new Explosion({
      position: this.getPosition(),
    });
  }
  render(context) {
    const [x, y] = this.getPosition();

    drawGlowing(
      this.vertices.map((vertext) => vertext.getPosition()),
      context,
      [x, y]
    );

    if (this.explosion) {
      this.explosion.render(context);
    }

    if (!this.destroyed) {
      context.save();
      context.translate(x, y);

      this.vertices.forEach((vertex, index, array) => {
        const secondPoint = array[index + 1]
          ? array[index + 1].getPosition()
          : array[0].getPosition();
        plotLine(...vertex.getPosition(), ...secondPoint, context);
      });
      context.restore();

      this.update();
    }
  }
}

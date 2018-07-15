import Vector2d from './core/Vector2d.js';
import GameObject from './core/GameObject.js';
import {randomFloat, randomInt} from './core/utils.js';
import Explosion from './Explosion.js';

const asteroidDefaults = {
  minSpeed: 0.5,
  maxSpeed: 1,
  type: 'big',
};

const typeParams = {
  small: {
    sizesRange: [5, 10],
    verticesRange: [5, 9],
    radiusDeviation: 2,
  },
  medium: {
    sizesRange: [15, 25],
    verticesRange: [5, 9],
    radiusDeviation: 3,
  },
  big: {
    sizesRange: [45, 56],
    verticesRange: [7, 12],
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
          cos(i * iterationStep) * radius +
            randomFloat(-radiusDeviation, radiusDeviation),
          sin(i * iterationStep) * radius +
            randomFloat(-radiusDeviation, radiusDeviation)
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

    if (this.explosion) {
      this.explosion.render(context);
    }

    if (!this.destroyed) {
      context.save();
      context.translate(x, y);

      context.beginPath();
      this.vertices.forEach((vertex) => {
        context.lineTo(...vertex.getPosition());
      });
      context.lineTo(...this.vertices[0].getPosition());

      context.strokeStyle = 'white';
      context.stroke();
      context.restore();

      this.update();
    }
  }
}

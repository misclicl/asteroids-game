import Vector2d from './Vector2d.js';
import GameObject from './GameObject.js';
import {randomFloat, randomInt} from './utils.js';
import Explosion from './Explosion.js';

const asteroidDefaults = {
  minSpeed: .5,
  maxSpeed: 1,
};

export default class Asteroid extends GameObject {
  constructor(args) {
    const params = Object.assign({}, asteroidDefaults, args);

    super(params);
    this.size = randomInt(8, 20);
    this.vertices = this.generateShape();

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
    const verticesN = randomInt(5, 9);
    const iterationStep = Math.PI * 2 / verticesN;

    const vertices = [];

    for (let i = 0; i < verticesN; i++) {
      vertices.push(
        new Vector2d(
          cos(i * iterationStep) * this.size + randomFloat(-3, 3),
          sin(i * iterationStep) * this.size + randomFloat(-3, 3),
        )
      );
    }
    return vertices;
  }
  explode() {
    this.explosion = new Explosion({
      position: this.getPosition(),
    });
  }
  render(context) {
    const [x, y] = this.getPosition();

    if (this.explosion) {
      this.explosion.render(context);
    }

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

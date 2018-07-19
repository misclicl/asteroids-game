import Asteroid from './js/Asteroid';
import Collider from './js/core/Collider';
import Ship from './js/Ship/Ship';
import TextLabel from './TextLabel';
import Explosion from './js/Explosion';
import Vector2d from './js/core/Vector2d';

import {
  WIDTH,
  HEIGHT,
  GAME_START_TIMEOUT,
  // RESPAWN_TIMEOUT,
} from './constants';
import {plotLine} from './js/core/plotLine';
import {drawGlowing} from './js/core/utils';

const shipShape = [
  new Vector2d(0, -9),
  new Vector2d(7, 13),
  new Vector2d(2, 9),
  new Vector2d(-2, 9),
  new Vector2d(-7, 13),
];

const typeScores = {
  big: 20,
  medium: 50,
  small: 100,
};

const keepInScreenRange = (x, y, sWidth, sHeight, size) => {
  const position = [x, y];
  if (x > sWidth + size) {
    position[0] = x - sWidth - size;
  }
  if (x + size < 0) {
    position[0] = sWidth + x + size;
  }
  if (y > sHeight + size) {
    position[1] = y - sHeight - size;
  }
  if (y + size < 0) {
    position[1] = y + sHeight + size;
  }
  return position;
};

export default class Game {
  constructor(args) {
    this.currentScore = null;
    this.leaderBoard = null;

    this.ship = null;
    this._ship = null;
    this.lives = 4;
    this.context = args.context;

    this.paused = false;
    this.explosions = [];
    this.asteroids = [];
    this.level = 0;

    this.spawnAsteroids(5);

    const startGameLabel = new TextLabel({
      value: 'press ENTER to start',
      position: [330, 600],
      shown: true,
    });
    const scoreLabel = new TextLabel({
      value: this.currentScore,
      position: [120, 40],
      shown: true,
    });

    const highestScore = new TextLabel({
      value: 0,
      position: [WIDTH / 2, 48],
      shown: true,
      size: 14,
    });

    highestScore.append();
    scoreLabel.append();
    startGameLabel.append();

    this.scoreLabel = scoreLabel;
    this.startGameLabel = startGameLabel;
    this.setScore(0);

    const shipController = {
      rotation: 0,
      acceleration: 0,
      run: () => {
        if (shipController.rotation < 0) {
          this.ship.rotateLeft();
        }
        if (shipController.rotation > 0) {
          this.ship.rotateRight();
        }

        if (shipController.acceleration) {
          this.ship.accelerate();
        } else {
          this.ship.stop();
        }
      },
    };

    const controlsHandlers = {
      mainMenu: ({key}) => {
        if (key === ' ' || key === 'Enter') {
          document.removeEventListener('keypress', controlsHandlers.mainMenu);
          startGameLabel.hide();
          this.createShip();
          this.asteroids = [];
          setTimeout(() => {
            document.addEventListener('keydown', controlsHandlers.actionStart);
            document.addEventListener('keyup', controlsHandlers.actionEnd);
            document.addEventListener('keyup', controlsHandlers.shoot);

            this.spawnShip();
            scoreLabel.show();
            this.spawnAsteroids(4);
          }, GAME_START_TIMEOUT);
        }
      },
      actionStart: ({key}) => {
        if (key === 'ArrowLeft') {
          shipController.rotation = -1;
        }
        if (key === 'ArrowRight') {
          shipController.rotation = 1;
        }
        if (key === 'ArrowUp') {
          shipController.acceleration = true;
        }
      },
      shoot: ({key}) => {
        if (key === ' ') {
          this.ship.shoot();
        }
      },
      actionEnd: ({key}) => {
        if (key === 'ArrowLeft' || key === 'ArrowRight') {
          shipController.rotation = 0;
        }
        if (key === 'ArrowUp') {
          shipController.acceleration = false;
        }
      },
    };

    this.shipController = shipController;

    document.addEventListener('keypress', controlsHandlers.mainMenu);
  }
  drawLiveIcons() {
    const {context} = this;
    context.save();
    context.translate(75, 100);
    for (let i = 0; i < this.lives; i++) {
      drawGlowing(
        shipShape,
        context,
        [0, 0]
      );
      shipShape.forEach((vertex, index, array) => {
        const secondPoint = array[index + 1] ? array[index + 1] : array[0];
        plotLine(vertex, secondPoint, context);
      });
      context.translate(18, 0);
    }
    context.restore();
  }
  setScore(value) {
    this.currentScore = value;
    this.scoreLabel.setValue(value.toString().padStart(5, '   0'));
  }
  createShip() {
    const ship = new Ship({
      position: [WIDTH / 2, HEIGHT / 2],
    });
    ship.attachToContext(this.context);
    const shipCollider = new Collider({
      type: 'custom',
      shape: [
        ship._shape.nose,
        ship._shape.leftTail,
        ship._shape.rightTail,
      ],
      visible: true,
    });
    shipCollider.attachToContext(this.context);
    ship.setCollider(shipCollider);
    this._ship = ship;
  }
  showMainMenu() {
    this.ship = null;
    this.setScore(0);
    this.asteroids = [];
    this.explosions = [];
    this.startGameLabel.show();
  }
  createAsteroid(args = {}) {
    const asteroid = new Asteroid({
      position: args.position || [
        Math.random() * WIDTH,
        Math.random() * HEIGHT,
      ],
      type: args.type || 'big',
    });
    const asteroidCollider = new Collider({
      size: asteroid.size,
      // size: 60,
      visible: true,
    });
    asteroidCollider.attachToContext(this.context);
    asteroid.setCollider(asteroidCollider);
    return asteroid;
  }
  spawnAsteroids(n) {
    if (n > 0) {
      this.asteroids.push(this.createAsteroid());
      this.spawnAsteroids(n - 1);
    }
  }
  spawnShip(x, y) {
    this.ship = this._ship;
  }
  update() {
    const ship = this.ship;
    const context = this.context;
    this.drawLiveIcons();
    if (ship) {
      ship.render();
      ship.update();
      const [x, y] = ship.getPosition();
      ship.setPosition(...keepInScreenRange(x, y, WIDTH, HEIGHT, ship.size));
      this.shipController.run();

      ship.projectiles.forEach((projectile, projectileIdx) => {
        const [pX, pY] = projectile.getPosition();
        projectile.setPosition(...keepInScreenRange(pX, pY, WIDTH, HEIGHT, 1));

        this.asteroids.forEach((asteroid, asteroidIdx) => {
          if (asteroid.getCollider().collides(projectile.getCollider())) {
            ship.projectiles.splice(projectileIdx, 1);

            this.explosions.push(
              new Explosion({
                position: asteroid.getPosition(),
              })
            );

            this.setScore(this.currentScore + typeScores[asteroid.type]);

            const newType = asteroid.type === 'big' ? 'medium' : 'small';
            const {type} = asteroid;

            if (type !== 'small') {
              this.asteroids.push(
                this.createAsteroid({
                  type: newType,
                  position: asteroid.getPosition(),
                }),
                this.createAsteroid({
                  type: newType,
                  position: asteroid.getPosition(),
                })
              );
            }

            this.asteroids.splice(asteroidIdx, 1);
          }
        });
      });
    }

    this.asteroids.forEach((asteroid) => {
      if (ship) {
        if (ship.getCollider().collides(asteroid.getCollider())) {
          this.ship = null;
          this.lives --;
          this.explosions.push(
            new Explosion({
              position: ship.getPosition(),
            })
          );
          ship.setPosition(WIDTH / 2, HEIGHT / 2);
        }
      }

      asteroid.render(context);

      const [aX, aY] = asteroid.getPosition();
      asteroid.setPosition(
        ...keepInScreenRange(aX, aY, WIDTH, HEIGHT, asteroid.size)
      );
    });
    this.explosions.forEach((explosion) => {
      explosion.render(context);
    });
  }
}

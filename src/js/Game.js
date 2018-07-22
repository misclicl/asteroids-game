import Asteroid from './Asteroid';
import Collider from './core/Collider';
import Ship from './Ship/Ship';
import Explosion from './Explosion';
import Vector2d from './core/Vector2d';

import {
  WIDTH,
  HEIGHT,
  GAME_START_TIMEOUT,
  // RESPAWN_TIMEOUT,
} from './constants';
import {plotLine} from './core/plotLine';
import {drawGlowing} from './core/utils';
import Observervable from './core/Observable';
import UILabel from './UILabel';

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
    this.stage = 1;
    this.state = Game.defaults.state;

    this.startGameLabel = new UILabel({
      position: [310, 600],
      value: 'press ENTER to start',
      context: this.context,
    });
    this.scoreLabel = new UILabel({
      value: this.currentScore,
      position: [50, 40],
      context: this.context,
    });
    this.pausedGameLabel = new UILabel({
      value: 'Paused',
      position: [WIDTH / 2 - 50, HEIGHT / 2 - 12],
      context: this.context,
      visible: false,
    });
    this.highestScore = new UILabel({
      value: '0',
      position: [WIDTH / 2, 48],
      size: 'small',
      context: this.context,
    });

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

    this.shipController = shipController;

    this.controlsHandlers = {
      [Game.states.MAIN_MENU]: {
        keypress: ({key}) => {
          if (key === ' ' || key === 'Enter') {
            this.observervable.notify(Game.states.GAME_STARTED);
          }
        },
      },
      [Game.states.GAME_STARTED]: {
        keydown: ({key}) => {
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
        keyup: ({key, keyCode}) => {
          if (keyCode == 27) {
            this.observervable.notify('paused');
          }
          if (key === ' ' && this.ship) {
            this.ship.shoot();
          }
          if (key === 'ArrowLeft' || key === 'ArrowRight') {
            shipController.rotation = 0;
          }
          if (key === 'ArrowUp') {
            shipController.acceleration = false;
          }
        },
      },
      [Game.states.PAUSED]: {
        keypress: ({key, keyCode}) => {
          if (keyCode == 27 || key === ' ') {
            this.observervable.notify(Game.states.GAME_RESUMED);
          }
        },
      },
    };

    this.controlsHandlers[Game.states.GAME_RESUMED] = this.controlsHandlers[
      Game.states.GAME_STARTED
    ];

    const gameObservervable = new Observervable();
    gameObservervable.subscribe(this.updateControlScheme.bind(this));
    gameObservervable.subscribe(this.updateUI.bind(this));
    gameObservervable.subscribe(this.updateState.bind(this));
    gameObservervable.subscribe(this.updateEntities.bind(this));
    gameObservervable.notify(Game.states.MAIN_MENU);
    this.observervable = gameObservervable;

    this.createShip();
    // this.sendScore('Asteroids Master', 1000);
  }
  drawLiveIcons() {
    const {context} = this;
    context.save();
    context.translate(75, 100);
    for (let i = 0; i < this.lives; i++) {
      drawGlowing(shipShape, context, [0, 0]);
      shipShape.forEach((vertex, index, array) => {
        const secondPoint = array[index + 1] ? array[index + 1] : array[0];
        plotLine(vertex, secondPoint, context);
      });
      context.translate(18, 0);
    }
    context.restore();
  }
  sendScore(name, score) {
    fetch('/api/projects/asteroids/setScore', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        score,
      }),
    }).then((response) => {
      // console.log(response);
    });
  }
  updateState(state) {
    // console.log(state);
  }
  updateControlScheme(state) {
    Object.values(Game.states).forEach((state) => {
      if (this.controlsHandlers[state]) {
        Object.keys(this.controlsHandlers[state]).forEach((key) => {
          document.removeEventListener(key, this.controlsHandlers[state][key]);
        });
      }
    });
    const currentHandlers = this.controlsHandlers[state];
    if (state === Game.states.MAIN_MENU) {
      for (const key in currentHandlers) {
        if (currentHandlers.hasOwnProperty(key)) {
          document.addEventListener(key, currentHandlers[key]);
        }
      }
    } else if (
      state === Game.states.GAME_STARTED ||
      state === Game.states.GAME_RESUMED
    ) {
      const timeout =
        state === Game.states.GAME_RESUMED ? 0 : GAME_START_TIMEOUT;

      setTimeout(() => {
        for (const key in currentHandlers) {
          if (currentHandlers.hasOwnProperty(key)) {
            document.addEventListener(key, currentHandlers[key]);
          }
        }
      }, timeout);
    } else if (state === Game.states.PAUSED) {
      for (const key in currentHandlers) {
        if (currentHandlers.hasOwnProperty(key)) {
          document.addEventListener(key, currentHandlers[key]);
        }
      }
    }
  }
  updateUI(state) {
    if (state === Game.states.MAIN_MENU) {
      this.setScore(0);
      this.startGameLabel.show();
    } else if (state === Game.states.GAME_STARTED) {
      this.startGameLabel.hide();
    } else if (state === Game.states.PAUSED) {
      this.pausedGameLabel.show();
    } else if (state === Game.states.GAME_RESUMED) {
      this.pausedGameLabel.hide();
    }
  }
  updateEntities(state) {
    if (state === Game.states.MAIN_MENU) {
      this.asteroids = [];
      this.spawnAsteroids(5);
    } else if (state === Game.states.GAME_STARTED) {
      this.asteroids = [];
      setTimeout(() => {
        this.spawnShip();
        this.launchStage(this.stage);
      }, GAME_START_TIMEOUT);
    } else if (state === Game.states.PAUSED) {
      this.paused = true;
    } else if (state === Game.states.GAME_RESUMED) {
      this.paused = false;
    }
  }
  setScore(value) {
    this.currentScore = value;
    this.scoreLabel.setValue(value.toString().padStart(5, '   0'));
  }
  launchStage(stage, delay = 0) {
    setTimeout(() => {
      this.spawnAsteroids(6 + 2 * stage);
    }, delay);
  }
  createShip() {
    const ship = new Ship({
      position: [WIDTH / 2, HEIGHT / 2],
    });
    ship.attachToContext(this.context);
    const shipCollider = new Collider({
      type: 'custom',
      shape: [ship._shape.nose, ship._shape.leftTail, ship._shape.rightTail],
      visible: true,
    });
    shipCollider.attachToContext(this.context);
    ship.setCollider(shipCollider);
    this._ship = ship;
  }
  showMainMenu() {
    this.ship = null;
    this.asteroids = [];
    this.explosions = [];
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
    this._ship.reset();
    this.ship = this._ship;
  }
  respawn() {
    setTimeout(() => {
      this.spawnShip();
    }, 1500);
  }
  endGame() {
    setTimeout(() => {
      this.observervable.notify(Game.states.MAIN_MENU);
      this.asteroids = [];
      this.explosions = [];
      this.ship = null;
      this.setScore(0);
      this.spawnAsteroids(6);
    }, 2500);
  }
  update() {
    this.startGameLabel.render();
    this.scoreLabel.render();
    this.pausedGameLabel.render();
    this.highestScore.render();
    const ship = this.ship;
    const context = this.context;
    this.drawLiveIcons();
    if (ship) {
      ship.render(null, !this.paused);

      const [x, y] = ship.getPosition();
      ship.setPosition(
        ...keepInScreenRange(x, y, WIDTH, HEIGHT, ship.size / 2)
      );
      this.shipController.run();

      ship.projectiles.forEach((projectile, projectileIdx) => {
        const [pX, pY] = projectile.getPosition();
        projectile.setPosition(...keepInScreenRange(pX, pY, WIDTH, HEIGHT, 30));

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
            if (this.asteroids.length < 1) {
              this.stage++;
              this.launchStage(this.stage, 2500);
            }
          }
        });
      });
    }
    this.asteroids.forEach((asteroid) => {
      if (ship) {
        if (ship.getCollider().collides(asteroid.getCollider())) {
          this.ship = null;
          this.lives--;

          this.explosions.push(
            new Explosion({
              position: ship.getPosition(),
            })
          );

          if (this.lives > 0) {
            this.respawn();
          } else {
            this.endGame();
          }
        }
      }

      asteroid.render(context, !this.paused);
      const [aX, aY] = asteroid.getPosition();
      asteroid.setPosition(
        ...keepInScreenRange(aX, aY, WIDTH, HEIGHT, asteroid.size / 2)
      );
    });
    this.explosions.forEach((explosion) => {
      explosion.render(context);
    });
  }
}

Game.states = {
  MAIN_MENU: 'mainMenu',
  PAUSED: 'paused',
  GAME_STARTED: 'gameStarted',
  GAME_RESUMED: 'gameResumed',
};
Game.defaults = {
  state: Game.states.MAIN_MENU,
};

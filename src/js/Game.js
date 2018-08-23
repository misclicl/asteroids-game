import UICollection from './core/UICollection';

import Asteroid from './Entities/Asteroid';
import Collider from './core/Collider';
import Ship from './Entities/Ship/Ship';
import Explosion from './Entities/Explosion';
import Vector2d from './core/Vector2d';
import Saucer from './Entities/Saucer';

import {plotLine} from './core/plotLine';
import {drawGlowing, randomInt, randomFloat} from './core/utils';
import Observervable from './core/Observable';
import UILabel from './core/UILabel';

import {WIDTH, HEIGHT, FPS, GAME_START_TIMEOUT} from './constants';
import Scoreboard from './Scoreboard';
import ScoreInput from './ScoreInput';

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
  saucer: 200,
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
    this.currentScore = 0;
    this.leaderBoard = null;
    this.ship = null;
    this._ship = null;
    this.lives = Game.defaults.lives;
    this.context = args.context;
    this.scoreboard = new Scoreboard();
    this.scoreInput = new ScoreInput();

    this.paused = false;
    this.explosions = [];
    this.asteroids = [];
    this.stage = 1;
    this.state = Game.defaults.state;
    this.timer = 0;
    this.stageTimer = 0;

    this.uiCollection = new UICollection();

    this.setupUIComponents();
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
      reset: () => {
        setTimeout(() => {
          shipController.rotation = 0;
          shipController.acceleration = 0;
        }, 1000);
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
        keyup: ({key, e, keyCode}) => {
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
          if (key === 'ArrowDown') {
            this.ship.setPosition(randomInt(0, WIDTH), randomInt(0, HEIGHT));
          }
        },
      },
      [Game.states.SUBMIT_HIGHSCORE]: {
        keydown: ({key}) => {
          if (key === 'ArrowUp') {
            this.scoreInput.prevSymbol();
          }
          if (key === 'ArrowDown') {
            this.scoreInput.nextSymbol();
          }
          if (key === 'ArrowRight') {
            this.scoreInput.nextPosition();
          }
          if (key === 'ArrowLeft') {
            this.scoreInput.prevPosition();
          }
          if (key === 'Enter') {
            this.scoreInput.submitScores().finally(() => {
              this.loadScores();
              setTimeout(() => {
                this.observervable.notify(Game.states.MAIN_MENU);
              });
            });
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
    gameObservervable.onNotify = (data) => {
      this.state = data;
    };
    gameObservervable.notify(Game.states.INITIAL_LOADING);
    this.observervable = gameObservervable;

    this.createShip();
  }
  drawLiveIcons() {
    if (
      this.ship ||
      this.state === 'gameStarted' ||
      this.state === 'gameResumed'
    ) {
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
  }
  setHighestScore(value) {
    this.uiCollection.getComponent('highestScoreLabel').setValue(value);
  }
  updateState(state) {
    if (state === Game.states.GAME_STARTED) {
      this.lives = Game.defaults.lives;
    }
    if (state === Game.states.GAME_OVER) {
      this.ship = null;
      this.stage = 1;
      if (
        this.scores &&
        !!this.currentScore &&
        (this.currentScore > this.scores[this.scores.length - 1].score ||
          this.scores.length < 10)
      ) {
        setTimeout(() => {
          this.observervable.notify(Game.states.SUBMIT_HIGHSCORE);
        }, 2000);
      } else {
        setTimeout(() => {
          this.observervable.notify(Game.states.MAIN_MENU);
        }, 2000);
      }
    }
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
    } else if (state === Game.states.SUBMIT_HIGHSCORE) {
      for (const key in currentHandlers) {
        if (currentHandlers.hasOwnProperty(key)) {
          document.addEventListener(key, currentHandlers[key]);
        }
      }
    }
  }
  updateUI(state) {
    if (state === Game.states.INITIAL_LOADING) {
      this.uiCollection.getComponent('loadingLabel').show();
    } else if (state === Game.states.MAIN_MENU) {
      this.setScore(0);
      this.uiCollection.getComponent('loadingLabel').hide();
      this.uiCollection.getComponent('gameOverLabel').hide();
      this.uiCollection.getComponent('startGameLabel').show();
      this.uiCollection.getComponent('highestScoreLabel').show();
      this.uiCollection.getComponent('scoreLabel').show();
      this.scoreboard.show();
      this.scoreInput.hide();
    } else if (state === Game.states.GAME_STARTED) {
      this.scoreboard.hide();
      this.uiCollection.getComponent('startGameLabel').hide();
    } else if (state === Game.states.PAUSED) {
      this.uiCollection.getComponent('pausedGameLabel').show();
    } else if (state === Game.states.GAME_RESUMED) {
      this.uiCollection.getComponent('pausedGameLabel').hide();
    } else if (state === Game.states.GAME_OVER) {
      this.uiCollection.getComponent('gameOverLabel').show();
    } else if (state === Game.states.SUBMIT_HIGHSCORE) {
      this.uiCollection.getComponent('gameOverLabel').hide();
      this.scoreInput.resetInputValue();
      this.scoreInput.show(this.currentScore);
    }
  }
  updateEntities(state) {
    if (state === Game.states.MAIN_MENU) {
      this.asteroids = [];
      this.spawnAsteroids(3);
    } else if (state === Game.states.GAME_STARTED) {
      this.asteroids = [];
      this.ufo = null;
      setTimeout(() => {
        this.spawnShip();
        this.launchStage(this.stage);
      }, GAME_START_TIMEOUT);
    } else if (state === Game.states.PAUSED) {
      this.paused = true;
    } else if (state === Game.states.GAME_RESUMED) {
      this.paused = false;
    } else if (state === Game.states.GAME_OVER) {
    } else if (state === Game.states.SUBMIT_HIGHSCORE) {
      this.asteroids = [];
      this.ufo = null;
      this.ship = null;
    }
  }
  setScore(value) {
    const prevScore = Math.floor(this.currentScore / 1e4);
    const newScore = Math.floor(value / 1e4);

    if (prevScore !== newScore) {
      this.lives++;
    }

    this.currentScore = value;
    this.uiCollection
      .getComponent('scoreLabel')
      .setValue(value.toString().padStart(5, '   0'));
  }
  launchStage(stage, delay = 0) {
    setTimeout(() => {
      // this.spawnAsteroids(2 + 2 * stage);
      this.spawnAsteroids(1);
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
    const position =
      args.position ||
      Vector2d.randomUnitVector(HEIGHT / 2)
        .add(this._ship.position)
        .getPosition();

    const asteroid = new Asteroid({
      position,
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
  spawnShip() {
    this._ship.reset();
    this.shipController.reset();
    this.ship = this._ship;
  }
  spawnSaucer(x, y) {
    if (!this.ufo) {
      const yMin = HEIGHT * 0.2;
      const yMax = HEIGHT * 0.8;
      const xPosition = Math.random() > 0.5 ? -50 : WIDTH + 50;
      const multiplier = xPosition > 0 ? -1 : 1;
      // const velocityVector = new Vector2d(0, 0);

      const velocityVector = new Vector2d(
        randomFloat(3, 4),
        randomFloat(-1, 1.5)
      ).mult(multiplier);

      const ufo = new Saucer({
        position: [300, 300],
        position: [xPosition, randomInt(yMin, yMax)],
        context: this.context,
        velocity: velocityVector,
      });

      ufo.direction = multiplier > 0 ? 'right' : 'left';

      const ufoCollider = new Collider({
        size: ufo.size + 4,
        // visible: true,
        context: this.context,
      });
      ufo.setCollider(ufoCollider);
      this.ufo = ufo;

      const shootingLoop = () => {
        if (this.ufo) {
          if (!this.paused) {
            this.ufo.shoot();
          }
          setTimeout(() => {
            shootingLoop();
          }, randomInt(900, 1500));
        }
      };

      shootingLoop();
    }
  }
  respawn() {
    setTimeout(() => {
      this.spawnShip();
    }, 1500);
  }
  setupUIComponents() {
    const startGameLabel = new UILabel({
      position: [280, 660],
      value: 'press ENTER to start',
      context: this.context,
      visible: false,
    });
    const scoreLabel = new UILabel({
      value: this.currentScore,
      position: [50, 24],
      context: this.context,
      visible: false,
    });
    const gameOverLabel = new UILabel({
      value: 'Game Over',
      position: [WIDTH / 2 - 80, HEIGHT / 2 - 40],
      context: this.context,
      visible: false,
    });
    const pausedGameLabel = new UILabel({
      value: 'Paused',
      position: [WIDTH / 2 - 50, HEIGHT / 2 - 12],
      context: this.context,
      visible: false,
    });
    const highestScoreLabel = new UILabel({
      value: '0',
      position: [WIDTH / 2 - 32, 32],
      size: 'small',
      context: this.context,
      visible: false,
    });
    const loadingLabel = new UILabel({
      value: 'Loading',
      position: [WIDTH / 2 - 70, HEIGHT / 2 - 20],
      context: this.context,
      visible: false,
    });

    this.uiCollection.add('startGameLabel', startGameLabel);
    this.uiCollection.add('scoreLabel', scoreLabel);
    this.uiCollection.add('pausedGameLabel', pausedGameLabel);
    this.uiCollection.add('highestScoreLabel', highestScoreLabel);
    this.uiCollection.add('gameOverLabel', gameOverLabel);
    this.uiCollection.add('loadingLabel', loadingLabel);
  }
  update() {
    this.scoreboard.render();
    this.scoreInput.render();
    const {ufo, ship, context} = this;

    this.uiCollection.render(null, !this.paused);
    this.drawLiveIcons();

    if (!this.paused) {
      this.timer++;
      this.stageTimer++;
    }

    if (
      this.stageTimer % (FPS * 15) === 0 &&
      (this.state == Game.states.GAME_STARTED ||
        this.state == Game.states.GAME_RESUMED)
    ) {
      this.spawnSaucer();
    }

    if (ufo) {
      ufo.render(null, !this.paused);

      const [saucerX, saucerY] = ufo.getPosition();
      const [newSaucerX, newSaucerY] = keepInScreenRange(
        saucerX,
        saucerY,
        WIDTH,
        HEIGHT,
        16
      );

      // destroying sauser if it goes beyond horizontal viewport edges
      if (
        (ufo.direction === 'left' && ufo.position.x < -20) ||
        (ufo.direction === 'right' && ufo.position.x > WIDTH + 20)
      ) {
        this.ufo = null;
        this.stageTimer = 0;
      }
      ufo.setPosition(saucerX, newSaucerY);
    }

    if (ship) {
      ship.render(null, !this.paused);

      const [x, y] = ship.getPosition();
      ship.setPosition(
        ...keepInScreenRange(x, y, WIDTH, HEIGHT, ship.size / 2)
      );
      this.shipController.run();

      if (ufo && ufo.getCollider().collides(ship.getCollider())) {
        this.ship = null;
        this.ufo = null;
        this.stageTimer = 0;

        this.shipController.reset();
        this.lives--;
        this.explosions.push(
          new Explosion({
            position: ship.getPosition(),
          })
        );

        if (this.lives > 0) {
          this.respawn();
        } else {
          this.observervable.notify(Game.states.GAME_OVER);
        }
      }

      ship.projectiles.forEach((projectile, projectileIdx) => {
        const [pX, pY] = projectile.getPosition();
        projectile.setPosition(...keepInScreenRange(pX, pY, WIDTH, HEIGHT, 30));

        if (ufo && ufo.getCollider().collides(projectile.getCollider())) {
          this.ufo = null;
          this.setScore(this.currentScore + typeScores.saucer);
          this.explosions.push(
            new Explosion({
              position: ufo.getPosition(),
            })
          );
        }

        this.asteroids.forEach((asteroid, asteroidIdx) => {
          if (asteroid.getCollider().collides(projectile.getCollider())) {
            ship.projectiles.splice(projectileIdx, 1);

            this.explosions.push(
              new Explosion({
                position: asteroid.getPosition(),
              })
            );

            this.setScore(this.currentScore + typeScores.saucer);

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
              this.stageTimer = 0;
              this.launchStage(this.stage, 2500);
            }
          }
        });
      });
    }

    this.asteroids.forEach((asteroid, asteroidIdx) => {
      if (ship) {
        if (ship.getCollider().collides(asteroid.getCollider())) {
          this.ship = null;
          this.shipController.reset();
          this.lives--;

          this.explosions.push(
            new Explosion({
              position: ship.getPosition(),
            })
          );

          if (this.lives > 0) {
            this.respawn();
          } else {
            this.observervable.notify(Game.states.GAME_OVER);
          }
        }
      }

      if (ufo) {
        if (ufo.getCollider().collides(asteroid.getCollider())) {
          this.ufo = null;
          this.stageTimer = 0;
          this.asteroids.splice(asteroidIdx, 1);

          this.explosions.push(
            new Explosion({
              position: ufo.getPosition(),
            })
          );

          const {type} = asteroid;
          const newType = asteroid.type === 'big' ? 'medium' : 'small';

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
  preload() {
    this.loadScores();
  }
  loadScores() {
    fetch('/api/projects/asteroids/highest-score', {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        response
          .json()
          .then((data) => {
            this.setHighestScore(data[0].score.toString());
            this.scores = data;
            this.scoreboard.setScores(data);
          })
          .finally(() => {
            this.observervable.notify(Game.states.MAIN_MENU);
          });
      })
      .catch((error) => {
        console.warn(error); // eslint-disable-line
        this.observervable.notify(Game.states.MAIN_MENU);
      });
  }
}

Game.states = {
  INITIAL_LOADING: 'initialLoading',
  MAIN_MENU: 'mainMenu',
  PAUSED: 'paused',
  SUBMIT_HIGHSCORE: 'submitHighscore',
  GAME_STARTED: 'gameStarted',
  GAME_RESUMED: 'gameResumed',
  GAME_OVER: 'gameOver',
};
Game.defaults = {
  state: Game.states.INITIAL_LOADING,
  lives: 4,
};

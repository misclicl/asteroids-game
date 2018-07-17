import './style.css';
import Ship from './js/Ship/Ship';
import Asteroid from './js/Asteroid';
import Collider from './js/core/Collider';
import Explosion from './js/Explosion';

const WIDTH = 1024;
const HEIGHT = 768;

const canvas = document.createElement('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;
document.body.appendChild(canvas);

const state = {
  score: 0,
};

const typeScores = {
  big: 20,
  medium: 50,
  small: 100,
};

const ship = new Ship({
  position: [WIDTH / 2, HEIGHT / 2],
});
ship.attachToContext(context);
const shipCollider = new Collider({
  size: ship.size,
  visible: true,
});
shipCollider.attachToContext(context);
ship.setCollider(shipCollider);

const shipController = {
  rotation: 0,
  acceleration: 0,
  run() {
    if (shipController.rotation < 0) {
      ship.rotateLeft();
    }
    if (shipController.rotation > 0) {
      ship.rotateRight();
    }

    if (shipController.acceleration) {
      ship.accelerate();
    } else {
      ship.stop();
    }
  },
};

const setupNewAsteroid = (args) => {
  const asteroid = new Asteroid({
    position: args.position,
    type: args.type,
  });
  asteroid.attachToContext(args.context);
  const asteroidCollider = new Collider({
    size: asteroid.size * 1.2,
  });
  asteroidCollider.attachToContext(args.context);

  asteroid.setCollider(asteroidCollider);
  return asteroid;
};

const asteroids = [];
const explosions = [];

for (let index = 0; index < 4; index++) {
  const asteroid = new Asteroid({
    position: [Math.random() * WIDTH, Math.random() * HEIGHT],
  });
  const asteroidCollider = new Collider({
    size: asteroid.size,
    visible: true,
  });
  asteroidCollider.attachToContext(context);
  asteroid.setCollider(asteroidCollider);
  asteroids.push(asteroid);
}

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

let fps = 29;
let now;
let then = Date.now();
let interval = 1000/fps;
let delta;

const update = () => {
  now = Date.now();
  delta = now - then;

  if (delta > interval) {
    then = now - (delta % interval);
    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = 'black';
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.save();
    context.font = '24px Vectorb';
    context.fillStyle = 'rgb(224,255,255)';
    context.shadowBlur = 12;
    context.shadowColor = '#92d5e4';
    context.fillText(`${state.score.toString().padStart(4, '   0')}`, 105, 65);
    context.restore();

    ship.render();

    ship.update();

    const [x, y] = ship.getPosition();
    const {projectiles} = ship;

    ship.setPosition(...keepInScreenRange(x, y, WIDTH, HEIGHT, ship.size));

    shipController.run();

    asteroids.forEach((asteroid) => {
      if (ship.getCollider().collides(asteroid.getCollider())) {
        ship.setState(false);
        explosions.push(
          new Explosion({
            position: ship.getPosition(),
          }),
        );
        ship.setPosition(WIDTH / 2, HEIGHT / 2);
      }

      asteroid.render(context);

      const [aX, aY] = asteroid.getPosition();
      asteroid.setPosition(
        ...keepInScreenRange(aX, aY, WIDTH, HEIGHT, asteroid.size)
      );
    });

    projectiles.forEach((projectile, projectileIdx) => {
      const [pX, pY] = projectile.getPosition();
      projectile.setPosition(
        ...keepInScreenRange(pX, pY, WIDTH, HEIGHT, 1)
      );

      asteroids.forEach((asteroid, asteroidIdx) => {
        if (asteroid.getCollider().collides(projectile.getCollider())) {
          projectiles.splice(projectileIdx, 1);

          explosions.push(
            new Explosion({
              position: asteroid.getPosition(),
            })
          );

          state.score += typeScores[asteroid.type];

          const newType = asteroid.type === 'big' ? 'medium' : 'small';
          const {type} = asteroid;

          if (type !== 'small') {
            asteroids.push(
              setupNewAsteroid({
                type: newType,
                position: asteroid.getPosition(),
                context,
              }),
              setupNewAsteroid({
                type: newType,
                position: asteroid.getPosition(),
                context,
              })
            );
          }

          asteroids.splice(asteroidIdx, 1);
        }
      });
    });

    explosions.forEach((explosion) => {
      explosion.render(context);
    });
  }

  window.requestAnimationFrame(update);
};

window.requestAnimationFrame(update);

document.addEventListener('keydown', ({key}) => {
  if (key === 'ArrowLeft') {
    shipController.rotation = -1;
  }
  if (key === 'ArrowRight') {
    shipController.rotation = 1;
  }
  if (key === 'ArrowUp') {
    shipController.acceleration = true;
  }
});

document.addEventListener('keyup', ({key}) => {
  if (key === ' ') {
    ship.shoot();
  }
});

document.addEventListener('keyup', ({key}) => {
  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    shipController.rotation = 0;
  }
  if (key === 'ArrowUp') {
    shipController.acceleration = false;
  }
});

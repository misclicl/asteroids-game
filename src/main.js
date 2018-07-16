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

const ship = new Ship({
  position: [WIDTH / 2, HEIGHT / 2],
});
ship.attachToContext(context);
const shipCollider = new Collider({
  size: ship.size,
  visible: true,
});
shipCollider.attachToContext(context);
ship.addCollider(shipCollider);

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

  asteroid.addCollider(asteroidCollider);
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
  asteroid.addCollider(asteroidCollider);
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

const update = () => {
  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = 'black';
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.font = '14px Vectorb';
  context.fillStyle = 'white';
  context.fillText('0000', 20, 30);

  ship.render();

  ship.update();

  const [x, y] = ship.getPosition();
  const {projectiles} = ship;

  ship.setPosition(...keepInScreenRange(x, y, WIDTH, HEIGHT, ship.size));

  shipController.run();
  asteroids.forEach((asteroid) => {
    if (ship.collider.collides(asteroid.collider)) {
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
      if (asteroid.collider.collides(projectile.collider)) {
        projectiles.splice(projectileIdx, 1);

        explosions.push(
          new Explosion({
            position: asteroid.getPosition(),
          })
        );

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

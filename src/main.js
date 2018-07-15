import './style.css';
import Player from './Ship.js';
import Asteroid from './Asteroid.js';

const WIDTH = 640;
const HEIGHT = 480;

const canvas = document.createElement('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;
const context = canvas.getContext('2d');
const player = new Player({
  position: [WIDTH / 2, HEIGHT / 2],
});

const playerController = {
  rotation: 0,
  rotationValue: 0,
  acceleration: 0,
  run() {
    if (playerController.rotation < 0) {
      playerController.rotationValue -= 0.08;
    }
    if (playerController.rotation > 0) {
      playerController.rotationValue += 0.08;
    }

    player.setRotation(playerController.rotationValue);
    if (playerController.acceleration) {
      player.accelerate();
    }
  },
};

const asteroids = [];
for (let index = 0; index < 1; index++) {
  asteroids.push(
    new Asteroid({
      position: [Math.random() * WIDTH, Math.random() * HEIGHT],
    })
  );
}

const keepInScreenRange = (x, y, sWidth, sHeight, size) => {
  const position = [x, y];
  if (x > sWidth + size) {
    // console.log('out of range', x, y);
    position[0] = x - sWidth - size;
  }
  if (x + size < 0) {
    // console.log('out of range', x, y);
    position[0] = sWidth + x + size;
  }
  if (y > sHeight + size) {
    // console.log('out of range', x, y);
    position[1] = y - sHeight - size;
  }
  if (y + size < 0) {
    // console.log('out of range', x, y);
    position[1] = y + sHeight + size;
  }
  return position;
};

const update = () => {
  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.fillRect(0, 0, WIDTH, HEIGHT);
  player.render(context);
  player.update();

  const [x, y] = player.getPosition();
  player.setPosition(...keepInScreenRange(x, y, WIDTH, HEIGHT, player.size));

  playerController.run();
  asteroids.forEach((asteroid) => {
    asteroid.render(context);
    if (Math.random() > .99) {
      asteroid.explode();
    }
    const [aX, aY] = asteroid.getPosition();
    asteroid.setPosition(
      ...keepInScreenRange(aX, aY, WIDTH, HEIGHT, asteroid.size)
    );
  });

  const {projectiles} = player;

  projectiles.forEach((projectile, index) => {
    const [pX, pY] = projectile.getPosition();
    const [pXN, pYN] = keepInScreenRange(pX, pY, WIDTH, HEIGHT, 1);
    if (pX !== pXN || pY !== pYN) {
      projectiles.splice(index, 1);
    }
  });

  window.requestAnimationFrame(update);
};

window.requestAnimationFrame(update);

document.body.appendChild(canvas);

document.addEventListener('keydown', ({key}) => {
  if (key === 'ArrowLeft') {
    playerController.rotation = -1;
  }
  if (key === 'ArrowRight') {
    playerController.rotation = 1;
  }
  if (key === 'ArrowUp') {
    playerController.acceleration = true;
  }
});

document.addEventListener('keyup', ({key}) => {
  if (key === ' ') {
    player.shoot();
  }
});

document.addEventListener('keyup', ({key}) => {
  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    playerController.rotation = 0;
  }
  if (key === 'ArrowUp') {
    playerController.acceleration = false;
  }
});

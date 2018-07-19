import './style.css';
import Game from './Game';

const WIDTH = 1024;
const HEIGHT = 768;

const container = document.getElementById('main-container');


const canvas = document.createElement('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;
container.appendChild(canvas);
const game = new Game({context});

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
    game.update();
  }
  window.requestAnimationFrame(update);
};

window.requestAnimationFrame(update);

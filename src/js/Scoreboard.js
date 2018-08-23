import UILabel from './core/UILabel';

const SCREEN_RATIO = 4 / 3;

const HEIGHT = 768;
const WIDTH = HEIGHT * SCREEN_RATIO;

const scores = [
  {name: 'Olga', score: 43000},
  {name: 'Olga', score: 43},
  {name: 'Olga', score: 43},
  {name: 'Olga', score: 43},
  {name: 'Olga', score: 43},
  {name: 'Olga', score: 43},
  {name: 'Olga', score: 43},
  {name: 'Olga', score: 43},
  {name: 'Olga', score: 43},
  {name: 'Olga', score: 43},
];

export default class Scoreboard {
  constructor() {
    const container = document.getElementById('main-container');
    const canvasContainer = document.createElement('div');
    container.appendChild(canvasContainer);
    canvasContainer.classList.add('scoreboard-container');
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.width = Scoreboard.defaults.width;
    this.canvas.height = Scoreboard.defaults.height;
    this._visibility = null;
    this.canvas.classList.add('scoreboard');
    canvasContainer.appendChild(this.canvas);
    this.scores = scores;

    this.setVisibility(Scoreboard.defaults.visibility);

    this.labels = [];
    this.labels.push(
      new UILabel({
        position: [389, 80],
        value: 'High scores',
        context: this.context,
        visible: true,
      })
    );
    this.leaders = [];
  }
  setScores(scores) {
    let yStep = 0;

    this.leaders = [];

    scores.forEach((record, index) => {
      this.leaders.push(
        new UILabel({
          position: [index < 9 ? 330 : 305, 180 + yStep],
          value: `${index + 1}. ${record.name} ${record.score}`,
          context: this.context,
          visible: true,
        })
      );
      yStep += 40;
    });
  }
  hide() {
    this.setVisibility(false);
  }
  show() {
    this.setVisibility(true);
  }
  setVisibility(value) {
    if (!value) {
      this.clearCanvas();
    }
    this._visibility = value;
    this.canvas.style.display = value;
  }
  visibility() {
    return this._visibility;
  }
  clearCanvas() {
    const {context} = this;
    const {width, height} = Scoreboard.defaults;
    context.clearRect(0, 0, width, height);
    context.fillStyle = 'transparent';
    context.fillRect(0, 0, width, height);
  }
  render() {
    if (this.visibility()) {
      this.clearCanvas();

      this.labels.forEach((label) => {
        label.render();
      });
      this.leaders.forEach((leader) => {
        leader.render();
      });
    }
  }
  static defaults = {
    width: WIDTH,
    height: HEIGHT,
    visibility: false,
  };
}

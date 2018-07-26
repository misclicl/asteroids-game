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
        position: [400, 80],
        value: 'Highscores',
        context: this.context,
        visible: true,
      })
    );
    this.leaders = [];
  }
  setVisibility(value) {
    this._visibility = value;
    this.canvas.style.display = value;
  }
  setScores(scores) {
    let yStep = 0;

    scores.forEach((record, index) => {
      this.leaders.push(
        new UILabel({
          position: [330, 180 + yStep],
          value: `${index + 1}. ${
            index < 9 ? ' ' + record.name : record.name
          } ${record.score}`,
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
  visibility() {
    return this._visibility;
  }
  render() {
    const {context} = this;
    const {width, height} = Scoreboard.defaults;
    context.clearRect(0, 0, width, height);
    context.fillStyle = 'transparent';
    context.fillRect(0, 0, width, height);
    if (this.visibility()) {
      context.clearRect(0, 0, width, height);
      context.fillStyle = 'transparent';
      context.fillRect(0, 0, width, height);

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

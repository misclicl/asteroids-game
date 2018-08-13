import UILabel from './core/UILabel';
import {letters as symbols} from './resources/symbols';

const symbolsKeys = Object.keys(symbols)
  .sort()
  .slice(3, 39);

const SCREEN_RATIO = 4 / 3;

const HEIGHT = 768;
const WIDTH = HEIGHT * SCREEN_RATIO;

const {min, max} = Math;

const getHandlers = (input) => {
  return {
    keydown: ({key}) => {
      if (key === 'ArrowUp') {
        input.prevSymbol();
      }
      if (key === 'ArrowDown') {
        input.nextSymbol();
      }
      if (key === 'ArrowRight') {
        input.nextPosition();
      }
      if (key === 'ArrowLeft') {
        input.prevPosition();
      }
      if (key === 'Enter') {
        input.submitScores();
      }
    },
  };
};

export default class ScoreInput {
  constructor() {
    const container = document.getElementById('main-container');
    const canvasContainer = document.createElement('div');
    container.appendChild(canvasContainer);

    canvasContainer.classList.add('score-input-container');
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.width = ScoreInput.defaults.width;
    this.canvas.height = ScoreInput.defaults.height;
    this._visibility = null;
    this.canvas.classList.add('score-input');
    canvasContainer.appendChild(this.canvas);
    this.caretPosition = 0;
    this.name = [10, 10, 10, 10];

    this.handlers = getHandlers(this);
    this.renderUnderscores();
    this.setupLetter();
    this.setCaretPosition(0);
    ScoreInput.defaults.visibility ? this.show() : this.hide();

    this.loadingLabel = new UILabel({
      position: [WIDTH / 2 - 160, HEIGHT / 2 + 20],
      value: 'Sending scores...',
      context: this.context,
      visible: false,
    }),

    this.messageLabels = [
      new UILabel({
        position: [100, 80 + 80],
        value: 'Your score is one of the ten best',
        context: this.context,
        visible: true,
      }),
      new UILabel({
        position: [100, 130 + 80],
        value: 'Please enter yout initials',
        context: this.context,
        visible: true,
      }),
      new UILabel({
        position: [100, 180 + 80],
        value: 'Push arrows to select letters',
        context: this.context,
        visible: true,
      }),
      new UILabel({
        position: [100, 230 + 80],
        value: 'Push enter when initials are correct',
        context: this.context,
        visible: true,
      }),
    ];
  }
  hide() {
    this.setVisibility(false);
    // const {handlers} = this;
    // Object.keys(handlers).forEach((key) => {
    //   document.removeEventListener(key, handlers[key]);
    // });
  }
  nextPosition() {
    this.setCaretPosition(min(this.caretPosition + 1, 3));
  }
  prevPosition() {
    this.setCaretPosition(max(this.caretPosition - 1, 0));
  }
  nextSymbol() {
    const newIndex = min(35, this.name[this.caretPosition] + 1);
    this.name[this.caretPosition] = newIndex;
  }
  prevSymbol() {
    const newIndex = max(0, this.name[this.caretPosition] - 1);
    this.name[this.caretPosition] = newIndex;
  }
  setCaretPosition(position) {
    this.caretPosition = position;
    const value = '----'.split('');
    value[position] = '/';
    this.underscores.value = value.join('');
  }
  show(score) {
    this.score = score;
    this.setVisibility(true);
    // const {handlers} = this;
    // Object.keys(handlers).forEach((key) => {
    //   document.addEventListener(key, handlers[key]);
    // });
  }
  visibility() {
    return this._visibility;
  }
  renderUnderscores() {
    this.underscores = new UILabel({
      position: [460, 610],
      value: '',
      context: this.context,
      visible: true,
    });
  }
  setupLetter() {
    const value = this.name.map((digit) => symbolsKeys[digit]).join('');
    this.letters = new UILabel({
      position: [460, 600],
      value: value,
      context: this.context,
      visible: true,
    });
  }
  renderLetters() {
    const value = this.name.map((digit) => symbolsKeys[digit]).join('');
    this.letters.setValue(value);
    this.letters.render();
  }
  setVisibility(value) {
    if (!value) {
      this.clearCanvas();
    }
    this._visibility = value;
    this.canvas.style.display = value;
  }
  clearCanvas() {
    const {context} = this;
    const {width, height} = ScoreInput.defaults;
    context.clearRect(0, 0, width, height);
    context.fillStyle = 'transparent';
    context.fillRect(0, 0, width, height);
  }
  render() {
    if (this.visibility()) {
      this.clearCanvas();
      this.underscores.render();
      this.loadingLabel.render();
      this.renderLetters();
      this.messageLabels.forEach((label) => {
        label.render();
      });
    }
  }
  getNameString() {
    return this.name.map((digit) => symbolsKeys[digit]).join('');
  }
  submitScores(score) {
    this.loadingLabel.show();
    const name = this.getNameString();
    return new Promise((resovle, reject) => {
      fetch('/api/projects/asteroids/setScore', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          score: score || this.score,
        }),
      }).finally(() => {
        resovle();
        this.loadingLabel.hide();
      });
    });
  }
  static defaults = {
    width: WIDTH,
    height: HEIGHT,
    visibility: false,
  };
}

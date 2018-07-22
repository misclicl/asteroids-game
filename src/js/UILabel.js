import GameObject from './core/GameObject';
import {uid, drawGlowing} from './core/utils';
import lettersRegular from './resources/symbols';
import lettersSmall from './resources/symbolsSmall.json';
import {plotLine} from './core/plotLine';
import Vector2d from './core/Vector2d';
export const container = document.getElementById('main-container');

export default class UILabel extends GameObject {
  constructor(args = {}) {
    const params = Object.assign({}, UILabel.defaults, args);
    super(params);
    this.id = uid('label');
    this.size = params.size;
    this.symbolsLink =
      this.size === UILabel.sizes.SMALL
        ? lettersSmall.letters
        : lettersRegular.letters;
    if (params.context) {
      this.attachToContext(params.context);
    }
    this.visible = params.visible;
    if (params.value) {
      this.setValue(params.value);
    }
  }
  setValue(value) {
    this.value = value;
  }
  hide() {
    this.visible = false;
  }
  show() {
    this.visible = true;
  }
  render() {
    if (this.visible) {
      const letterArray = this.value.split('');
      const {context} = this;
      const letters = this.symbolsLink;
      let offsetX = this.position.x;
      let offsetY = this.position.y;

      letterArray.forEach((letter) => {
        const letterCoords = letters[letter.toLowerCase()];
        if (letterCoords) {
          // drawGlowing(
          //   letterCoords,
          //   context,
          //   [0, 0]
          // );
          letterCoords.forEach((line) => {
            plotLine(
              new Vector2d(line[0][0] + offsetX, line[0][1] + offsetY),
              new Vector2d(line[1][0] + offsetX, line[1][1] + offsetY),
              context
            );
          });
        }
        offsetX += 20;
      });
    }
  }
}

UILabel.sizes = {
  SMALL: 'small',
  REGULAR: 'regular',
};

UILabel.defaults = {
  visible: true,
  value: '',
  size: UILabel.sizes.REGULAR,
};


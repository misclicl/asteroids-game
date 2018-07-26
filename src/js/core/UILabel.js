import GameObject from './GameObject';
import {uid, drawGlowing} from './utils';
import lettersRegular from '../resources/symbols';
import lettersSmall from '../resources/symbolsSmall.json';
import {plotLine} from './plotLine';
import Vector2d from './Vector2d';
export const container = document.getElementById('main-container');

const processLetterData = (data) => {
  const object = {};
  Object.keys(data.letters).forEach((letterKey) => {
    object[letterKey] = data.letters[letterKey].map(
      (line) => {
        return [
          new Vector2d(line[0][0], line[0][1]),
          new Vector2d(line[1][0], line[1][1]),
        ];
      }
    );
  });
  return object;
};

const lettersRegularShape = processLetterData(lettersRegular);
const lettersSmallShape = processLetterData(lettersSmall);

export default class UILabel extends GameObject {
  constructor(args = {}) {
    const params = Object.assign({}, UILabel.defaults, args);
    super(params);
    this.id = uid('label');
    this.size = params.size;
    this.symbolsLink =
      this.size === UILabel.sizes.SMALL
        ? lettersSmallShape
        : lettersRegularShape;
    this.letterSpacing = this.size === UILabel.sizes.REGULAR ? 24 : 12;
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
      const [offsetX, offsetY] = this.position.getPosition();
      let offsetVector = new Vector2d(offsetX, offsetY);
      const {letterSpacing} = this;

      letterArray.forEach((letter) => {
        const letterShape = letters[letter.toLowerCase()];

        if (letterShape) {
          drawGlowing(
            letterShape,
            context,
            offsetVector.getPosition(),
            0,
            false,
          );
          letterShape.forEach((line) => {
            plotLine(
              line[0].addVector(offsetVector),
              line[1].addVector(offsetVector),
              context
            );
          });
        }
        offsetVector = offsetVector.addVector(new Vector2d(letterSpacing, 0));
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

import GameObject from '../core/GameObject.js';
import {randomFloat, drawGlowing} from '../core/utils.js';
import {plotLine} from '../core/plotLine';

export default class EngineFire extends GameObject {
  constructor(args) {
    super(args);
    this.visible = false;
    this.sizeShift = args.sizeShift;
    this.counter = 0;
  }
  setVisibility(value) {
    this.visible = value;
  }
  render(context) {
    this.counter = this.counter + 1;
    if (this.counter <= 4 && this.counter >= 0) {
      const [x, y] = this.getPosition();
      const contextToUse = context || this.context;

      drawGlowing(
        [
          [2, 1 + this.sizeShift],
          [0, (rand > 0.95 ? 10 : 8) + this.sizeShift],
          [-2, 1 + this.sizeShift],
        ],
        contextToUse,
        [x, y],
        this.rotation,
      );

      contextToUse.save();
      contextToUse.translate(x, y);
      contextToUse.rotate(this.rotation);

      const rand = randomFloat(0, 1);
      plotLine(
        2,
        1 + this.sizeShift,
        0, (rand > 0.95 ? 10 : 8) + this.sizeShift,
        contextToUse
      );
      plotLine(
        -2,
        1 + this.sizeShift,
        0, (rand > 0.95 ? 10 : 8) + this.sizeShift,
        contextToUse
      );
      contextToUse.restore();
    } else if (this.counter > 0) {
      this.counter = -4;
    }
  }
}

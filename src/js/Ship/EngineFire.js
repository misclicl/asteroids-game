import GameObject from '../core/GameObject.js';

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

      contextToUse.save();
      contextToUse.translate(x, y);
      contextToUse.rotate(this.rotation);

      contextToUse.moveTo(0 + 2.5, 1 + this.sizeShift);
      contextToUse.lineTo(0, 8 + this.sizeShift);
      contextToUse.lineTo(0 - 2.5, 1 + this.sizeShift);

      contextToUse.strokeStyle = 'white';
      contextToUse.stroke();

      contextToUse.restore();
    } else if (this.counter > 0) {
      this.counter = -4;
    }
  }
}

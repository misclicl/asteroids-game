import GameObject from './js/core/GameObject';
import {uid} from './js/core/utils';
export const container = document.getElementById('main-container');

export default class TextLabel extends GameObject {
  constructor(args = {}) {
    super(args);
    this._el = document.createElement('span');
    this._el.id = uid('label');
    const textNode = document.createTextNode(args.value);
    this._el.appendChild(textNode);
    this._el.classList.add('ui-label-container');
    this._el.style.left = args.position ? args.position[0] + 'px' : 0 + 'px';
    this._el.style.top = args.position ? args.position[1] + 'px' : 0 + 'px';
    this._el.style['font-size'] = args.size + 'px' || '24px';
    this._el.style.display = args.shown ? 'block' : 'none';
  }
  setValue(value) {
    this._el.innerHTML = value;
  }
  hide() {
    this._el.style.display = 'none';
  }
  show() {
    this._el.style.display = 'block';
  }
  append(el) {
    const target = el || container;
    target.appendChild(this._el);
  }
}

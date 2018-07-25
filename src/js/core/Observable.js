export default class Observable {
  constructor() {
    this.observers = [];
    this.onNotify = null;
  }
  subscribe(f) {
    this.observers.push(f);
  }
  unsubscribe(f) {
    this.observers = this.observers.filter((subscriber) => subscriber !== f);
  }
  notify(data) {
    this.observers.forEach((observer) => observer(data));
    if (this.onNotify) {
      this.onNotify(data);
    }
  }
};

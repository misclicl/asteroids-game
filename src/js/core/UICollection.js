export default class UICollection {
  constructor() {
    this.components = {};
  }
  add(name, component) {
    this.components[name] = component;
  }
  getComponent(name) {
    return this.components[name];
  }
  render() {
    const {components} = this;
    Object.keys(components).forEach((key) => {
      components[key].render();
    });
  }
}

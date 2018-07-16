export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
export const randomFloat = (min, max) => {
  return Math.random() * (max - min) + min;
};

export const radians = (degrees) => {
  return degrees * Math.PI / 180;
};

export const degrees = (radians) => {
  return radians * 180 / Math.PI;
};

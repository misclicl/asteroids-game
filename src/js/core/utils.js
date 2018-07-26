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

export const reverseString = (string) =>
  string
    .split('')
    .reverse()
    .join('');

export const uid = (() => {
  let _id = 0;
  return (prefix) => (prefix || '') + _id++;
})();

export const randomElementFromArray = (array) =>
  array[Math.floor(Math.random() * array.length)];

export const drawGlowing = (
  vertices,
  context,
  origin,
  rotation,
  sequential = true
) => {
  context.save();
  context.translate(...origin);
  context.rotate(rotation || 0);
  context.beginPath();
  context.shadowBlur = 2;
  context.shadowColor = '#d0eef5';

  if (sequential) {
    vertices.forEach((vertex, index, array) => {
      const [x0, y0] = vertex.getPosition();
      context.moveTo(x0 + 1, y0 + 1);
      const [x1, y1] = array[index + 1]
        ? array[index + 1].getPosition()
        : array[0].getPosition();
      context.lineTo(x1, y1);
      context.lineTo(x1, y1);
      context.lineTo(x1, y1);
      context.lineTo(x1, y1);
    });
  } else {
    vertices.forEach((line) => {
      const [x0, y0] = line[0].getPosition();
      const [x1, y1] = line[1].getPosition();

      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
    });
  }

  context.lineWidth = 1;
  context.strokeStyle = 'black';
  context.stroke();
  context.restore();
};

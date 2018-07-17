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

export const drawGlowing = (vertices, context, origin, rotation, type) => {
  context.save();
  context.translate(...origin);
  context.rotate(rotation || 0);
  context.beginPath();
  context.shadowBlur = 12;
  context.shadowColor = '#92d5e4';

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

  context.lineWidth = 1;
  context.strokeStyle = 'black';
  context.stroke();
  context.restore();
};

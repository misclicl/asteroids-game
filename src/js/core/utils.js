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

export const drawGlowing = (vertices, context, origin, rotation) => {
  context.save();
  context.translate(...origin);
  context.rotate(rotation);
  context.beginPath();
  context.shadowBlur = 12;
  context.shadowColor = '#92d5e4';

  vertices.forEach((vertex, index, array) => {
    context.moveTo(vertex[0] + 1, vertex[1] + 1);
    const secondPoint = array[index + 1]
      ? array[index + 1]
      : array[0];
    context.lineTo(...secondPoint);
  });

  context.lineWidth = 1;
  context.strokeStyle = 'black';
  context.stroke();
  context.restore();
};

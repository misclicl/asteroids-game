const setPixel = (x, y, context) => {
  context.fillRect(x, y, 1, 1);
  context.fillStyle = 'rgb(224,255,255)';
};

export const plotLine = (from, to, context) => {
  let [x0, y0] = from.getPosition();
  const [x1, y1] = to.getPosition();
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;

  let err = dx - dy;

  while (true) {
    setPixel(x0, y0, context);
    if (Math.abs(x0 - x1) < 0.0001 && Math.abs(y0 - y1) < 0.0001) {
      break;
    }
    let e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
};

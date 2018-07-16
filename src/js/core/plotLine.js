const setPixel = (x, y, context) => {
  context.fillStyle = 'rgba(255,255,255,' + 0.5 + ')';
  context.fillRect(x, y, 1, 1);
};

export const plotLine = (x0, y0, x1, y1, context) => {
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
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

import type { Rect } from "./types";

export function splitInto4(rect: Rect): Rect[] {
  const x = rect.x;
  const y = rect.y;

  const w = rect.width;
  const h = rect.height;

  const halfW = Math.floor(w / 2);
  const halfH = Math.floor(h / 2);

  const restW = w - halfW;
  const restH = h - halfH;

  return [
    { x, y, width: halfW, height: halfH },

    { x: x + halfW, y, width: restW, height: halfH },

    { x, y: y + halfH, width: halfW, height: restH },

    { x: x + halfW, y: y + halfH, width: restW, height: restH },
  ];
}

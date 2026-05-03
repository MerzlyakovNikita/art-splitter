import { useEffect, useRef } from "react";
import type { Rect } from "../../core/types";
import styles from "./Canvas.module.css";

type Props = {
  image: HTMLImageElement | null;
  rects: Rect[];
  mode?: "grid" | "color";
};

export default function Canvas({ image, rects, mode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = image;

    const maxWidth = 720;
    const maxHeight = 480;

    const scale = Math.min(maxWidth / img.width, maxHeight / img.height);

    const width = img.width * scale;
    const height = img.height * scale;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;

    const bufferCanvas = document.createElement("canvas");
    bufferCanvas.width = img.width;
    bufferCanvas.height = img.height;

    const bufferCtx = bufferCanvas.getContext("2d");
    if (!bufferCtx) return;

    bufferCtx.drawImage(img, 0, 0);

    const imageData = bufferCtx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    function getAverageColor(rect: Rect) {
      let r = 0,
        g = 0,
        b = 0,
        count = 0;

      const startX = Math.floor(rect.x);
      const startY = Math.floor(rect.y);
      const endX = Math.floor(rect.x + rect.width);
      const endY = Math.floor(rect.y + rect.height);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const i = (y * img.width + x) * 4;

          r += data[i];
          g += data[i + 1];
          b += data[i + 2];

          count++;
        }
      }

      if (count === 0) return { r: 0, g: 0, b: 0 };

      return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
      };
    }

    ctx.drawImage(img, 0, 0, width, height);

    if (!mode || !rects) return;

    if (mode === "grid") {
      ctx.strokeStyle = "#22c55e";

      rects.forEach((r) => {
        ctx.strokeRect(
          Math.floor(r.x * scale),
          Math.floor(r.y * scale),
          Math.ceil(r.width * scale),
          Math.ceil(r.height * scale),
        );
      });
    }

    if (mode === "color") {
      rects.forEach((r) => {
        const color = getAverageColor(r);

        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;

        ctx.fillRect(
          Math.floor(r.x * scale),
          Math.floor(r.y * scale),
          Math.ceil(r.width * scale),
          Math.ceil(r.height * scale),
        );
      });
    }
  }, [image, rects, mode]);

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} />
    </div>
  );
}

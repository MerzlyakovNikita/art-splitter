import { useState, useEffect } from "react";
import Layout from "./components/Layout/Layout";
import Canvas from "./components/Canvas/Canvas";
import Controls from "./components/Controls/Controls";
import ImageLoader from "./components/ImageLoader/ImageLoader";
import type { Rect } from "./core/types";
import { splitInto4 } from "./core/splitInto4";
import { saveGallery, getAllGalleries } from "./core/storage/db";

const MAX_DEPTH = 10;

type Gallery = {
  id: string;
  name: string;
  images: string[];
  path: string;
};

type ProcessedGallery = {
  id: string;
  name: string;
  depth: number;
  images: string[];
  originalPath: string;
  originalImages: string[];
  createdAt: number;
};

function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rects, setRects] = useState<Rect[]>([]);
  const [depth, setDepth] = useState(0);
  const [mode, setMode] = useState<"grid" | "color">("grid");

  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);

  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [processedGalleries, setProcessedGalleries] = useState<
    ProcessedGallery[]
  >([]);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null,
  );
  const [isProcessedView, setIsProcessedView] = useState(false);

  const [displayDepth, setDisplayDepth] = useState(0);
  const [displayBlocks, setDisplayBlocks] = useState(0);

  useEffect(() => {
    getAllGalleries().then((data) => {
      setProcessedGalleries(data as ProcessedGallery[]);
    });
  }, []);

  const hasImage = !!image;

  const handleImageLoad = (img: HTMLImageElement) => {
    setImage(img);
    setOriginalImage(null);

    setRects([
      {
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
      },
    ]);

    setDepth(0);
    setDisplayDepth(0);
    setDisplayBlocks(1);
    setMode("color");
    setIsProcessedView(false);
  };

  const handleSplit = () => {
    if (!image) return;
    if (depth >= MAX_DEPTH) return;

    setRects((prev) => prev.flatMap(splitInto4));

    setDepth((d) => d + 1);
    setDisplayDepth((d) => d + 1);
    setDisplayBlocks((b) => b * 4);
  };

  const handleReset = () => {
    if (!image) return;

    setRects([
      {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      },
    ]);

    setDepth(0);
    setDisplayDepth(0);
    setDisplayBlocks(1);
  };

  const processGallery = async () => {
    if (!selectedGallery || depth === 0) return;

    setIsProcessing(true);
    setProgress(0);

    const results: string[] = [];
    const total = selectedGallery.images.length;

    for (let i = 0; i < total; i++) {
      const imgName = selectedGallery.images[i];
      const src = selectedGallery.path + imgName;

      const img = await loadImage(src);

      const rects = generateRects(img, depth);

      const result = renderToImage(img, rects);

      results.push(result);

      setProgress((i + 1) / total);
    }

    const galleryData: ProcessedGallery = {
      id: selectedGallery.id,
      name: selectedGallery.name,
      depth,
      images: results,
      originalPath: selectedGallery.path,
      originalImages: selectedGallery.images,
      createdAt: Date.now(),
    };

    await saveGallery(galleryData);

    setProcessedGalleries((prev) => {
      const filtered = prev.filter((g) => g.id !== galleryData.id);
      return [...filtered, galleryData];
    });

    setIsProcessing(false);
  };

  const handleLoadProcessed = (
    processedSrc: string,
    originalSrc: string,
    depthValue: number,
  ) => {
    const processedImg = new Image();
    const originalImg = new Image();

    processedImg.src = processedSrc;
    originalImg.src = originalSrc;

    Promise.all([
      new Promise((res) => (processedImg.onload = res)),
      new Promise((res) => (originalImg.onload = res)),
    ]).then(() => {
      setImage(processedImg);
      setOriginalImage(originalImg);

      setRects([]);
      setDepth(depthValue);

      setDisplayDepth(depthValue);
      setDisplayBlocks(Math.pow(4, depthValue)); // 🔥

      setIsProcessedView(true);
    });
  };

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
    });
  }

  function generateRects(image: HTMLImageElement, depth: number) {
    let rects: Rect[] = [
      {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      },
    ];

    for (let i = 0; i < depth; i++) {
      rects = rects.flatMap(splitInto4);
    }

    return rects;
  }

  function renderToImage(image: HTMLImageElement, rects: Rect[]) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!ctx) return "";

    const img = image;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    function getColor(rect: Rect) {
      const startX = Math.max(0, Math.floor(rect.x));
      const startY = Math.max(0, Math.floor(rect.y));
      const endX = Math.min(img.width, Math.ceil(rect.x + rect.width));
      const endY = Math.min(img.height, Math.ceil(rect.y + rect.height));

      let r = 0,
        g = 0,
        b = 0,
        count = 0;

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

    rects.forEach((r) => {
      const c = getColor(r);

      ctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;

      ctx.fillRect(
        Math.floor(r.x),
        Math.floor(r.y),
        Math.ceil(r.width),
        Math.ceil(r.height),
      );
    });

    return canvas.toDataURL("image/png");
  }

  return (
    <Layout
      sidebar={
        <ImageLoader
          onLoad={handleImageLoad}
          onSelectGallery={setSelectedGallery}
          processedGalleries={processedGalleries}
          onLoadProcessed={handleLoadProcessed}
        />
      }
      content={
        <>
          <h1>Разбиение изображений</h1>

          {image && (
            <div>
              <p>Глубина: {displayDepth}</p>
              <p>
                Блоков: 4^{displayDepth} = {displayBlocks}
              </p>
            </div>
          )}

          <Controls
            onSplit={handleSplit}
            onReset={handleReset}
            onChangeMode={setMode}
            onProcessGallery={processGallery}
            isProcessing={isProcessing}
            progress={progress}
            disabled={!hasImage}
            isProcessedView={isProcessedView}
          />

          <div style={{ display: "flex", gap: 20 }}>
            <div>
              <h3>Исходное изображение</h3>
              <Canvas image={isProcessedView ? originalImage : image} />
            </div>

            <div>
              <h3>{isProcessedView ? "Обработанная картина" : "Результат"}</h3>
              <Canvas
                image={image}
                rects={isProcessedView ? undefined : rects}
                mode={isProcessedView ? undefined : mode}
              />
            </div>
          </div>
        </>
      }
    />
  );
}

export default App;

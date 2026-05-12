import { useState, useEffect } from "react";
import Layout from "./components/Layout/Layout";
import Canvas from "./components/Canvas/Canvas";
import Controls from "./components/Controls/Controls";
import ImageLoader from "./components/ImageLoader/ImageLoader";
import HelpModal from "./components/HelpModal/HelpModal";
import ImageStrip from "./components/ImageStrip/ImageStrip";
import TreeModal from "./components/TreeModal/TreeModal";
import type {
  Rect,
  Gallery,
  ProcessedGallery,
  ProcessedImage,
  FeatureVector,
  TreeStep,
} from "./core/types";
import { splitInto4 } from "./core/splitInto4";
import { saveGallery, getAllGalleries } from "./core/storage/db";
import galleriesData from "./data/galleriesData.json";
import Button from "./components/UI/Button/Button";
import styles from "./App.module.css";

const MAX_DEPTH = 9;

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

  const [stripImages, setStripImages] = useState<
    {
      src: string;
      title?: string;
      author?: string;
      metric?: number;
      isProcessed?: boolean;
      originalSrc?: string;
      depth?: number;
      kL: number;
      kV: number;
      features?: FeatureVector;
    }[]
  >([]);
  const [stripTitle, setStripTitle] = useState("");
  const [sortMode, setSortMode] = useState<"asc" | "desc">("asc");
  const [isProcessedStrip, setIsProcessedStrip] = useState(false);

  const [kL, setKL] = useState(1);
  const [kV, setKV] = useState(1);

  const [currentL, setCurrentL] = useState(0);
  const [currentV, setCurrentV] = useState(0);
  const [currentM, setCurrentM] = useState(0);

  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null,
  );
  const [isProcessedView, setIsProcessedView] = useState(false);

  const [displayDepth, setDisplayDepth] = useState(0);
  const [displayBlocks, setDisplayBlocks] = useState(0);

  const [helpOpen, setHelpOpen] = useState(false);
  const [treeOpen, setTreeOpen] = useState(false);
  const [selectedTree, setSelectedTree] = useState<TreeStep[]>([]);

  useEffect(() => {
    getAllGalleries().then((data) => {
      setProcessedGalleries(data as ProcessedGallery[]);
    });
  }, []);

  const hasImage = !!image;

  const handleOpenGallery = (galleryId: "russian" | "london") => {
    const gallery = galleriesData[galleryId as keyof typeof galleriesData];

    if (!gallery) return;

    setSelectedGallery({
      id: galleryId,
      name: gallery.name,
      path: gallery.path,
      images: gallery.items.map((i) => i.file),
    });

    setStripTitle(gallery.name);
    setIsProcessedStrip(false);

    setStripImages(
      gallery.items.map((item) => ({
        src: gallery.path + item.file,
        title: item.title,
        author: item.author,
        kL: 0,
        kV: 0,
        isProcessed: false,
      })),
    );
  };

  const handleOpenProcessed = (galleryId: "russian" | "london") => {
    const gallery = processedGalleries.find((g) => g.id === galleryId);

    if (!gallery) return;

    setStripTitle(`${gallery.name} (глубина = ${gallery.depth})`);
    setSelectedTree(gallery.tree);
    setIsProcessedStrip(true);

    setStripImages(
      gallery.images.map((img) => ({
        src: img.processedSrc,
        metric: img.metric,
        luminance: img.luminance,
        variance: img.variance,
        title: img.title,
        author: img.author,
        isProcessed: true,
        originalSrc: img.originalSrc,
        depth: gallery.depth,
        kL: gallery.kL,
        kV: gallery.kV,
        features: img.features,
      })),
    );
  };

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

    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d");

    if (ctx) {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);

      const metricData = calculateMetric(imageData.data, img.width, [
        {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        },
      ]);

      setCurrentL(metricData.luminance);

      setCurrentV(0);

      setCurrentM(kL * metricData.luminance);
    }

    setMode("color");
    setIsProcessedView(false);
  };

  const handleReset = () => {
    applyDepth(0);
  };

  const processGallery = async () => {
    if (!selectedGallery) return;

    setIsProcessing(true);
    setProgress(0);

    const results: ProcessedImage[] = [];
    let tree: TreeStep[] = [];
    const total = selectedGallery.images.length;

    for (let i = 0; i < total; i++) {
      const imgName = selectedGallery.images[i];
      const src = selectedGallery.path + imgName;

      const img = await loadImage(src);

      const rects = generateRects(img, depth);

      const result = renderToImage(img, rects);

      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");

      if (!tempCtx) continue;

      tempCanvas.width = img.width;
      tempCanvas.height = img.height;

      tempCtx.drawImage(img, 0, 0);

      const imageData = tempCtx.getImageData(0, 0, img.width, img.height);

      const metricData = calculateMetric(imageData.data, img.width, rects);

      const galleryItem =
        galleriesData[selectedGallery.id as keyof typeof galleriesData].items[
          i
        ];

      results.push({
        processedSrc: result,
        originalSrc: src,
        metric: metricData.metric,
        luminance: metricData.luminance,
        variance: metricData.variance,
        features: metricData.features,
        title: galleryItem.title,
        author: galleryItem.author,
        year: galleryItem.year,
      });

      setProgress((i + 1) / total);
    }

    tree = buildTree(results);

    const galleryData: ProcessedGallery = {
      id: selectedGallery.id,
      name: selectedGallery.name,
      depth,
      kL,
      kV,
      images: results,
      tree,
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
    savedKL: number,
    savedKV: number,
    luminance: number,
    variance: number,
    metric: number,
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
      setDisplayBlocks(Math.pow(4, depthValue));

      setKL(savedKL);
      setKV(savedKV);

      setCurrentL(luminance);
      setCurrentV(variance);
      setCurrentM(metric);

      setSelectedGallery(null);

      setIsProcessedView(true);
    });
  };

  const applyDepth = (newDepth: number) => {
    if (!image) return;

    const safeDepth = Math.max(0, Math.min(MAX_DEPTH, newDepth));

    let nextRects: Rect[] = [
      {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      },
    ];

    for (let i = 0; i < safeDepth; i++) {
      nextRects = nextRects.flatMap(splitInto4);
    }

    setRects(nextRects);

    setDepth(safeDepth);
    setDisplayDepth(safeDepth);
    setDisplayBlocks(Math.pow(4, safeDepth));

    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d");

    if (!ctx || !image) return;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, image.width, image.height);

    const metricData = calculateMetric(imageData.data, image.width, nextRects);

    setCurrentL(metricData.luminance);
    setCurrentV(metricData.variance);
    setCurrentM(metricData.metric);
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

  function calculateLuminance(r: number, g: number, b: number) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  function extractFeatures(
    avgR: number,
    avgG: number,
    avgB: number,
    luminance: number,
    variance: number,
  ) {
    const dark = luminance < 110 ? 1 : 0;

    const detailed = variance > 70 ? 1 : 0;

    const warm = avgR > avgB ? 1 : 0;

    const greenDominant = avgG > avgR && avgG > avgB ? 1 : 0;

    const monochrome =
      Math.abs(avgR - avgG) < 15 &&
      Math.abs(avgR - avgB) < 15 &&
      Math.abs(avgG - avgB) < 15
        ? 1
        : 0;

    return {
      dark,
      detailed,
      warm,
      greenDominant,
      monochrome,
    };
  }

  function featureVector(features: FeatureVector) {
    return [
      features.dark,
      features.detailed,
      features.warm,
      features.greenDominant,
      features.monochrome,
    ];
  }

  function cosineSimilarity(a: number[], b: number[]) {
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  function multiCosineSimilarity(vectors: number[][]) {
    if (vectors.length < 2) {
      return 0;
    }

    const dimension = vectors[0].length;
    let numerator = 0;

    for (let i = 0; i < dimension; i++) {
      let product = 1;
      for (let j = 0; j < vectors.length; j++) {
        product *= vectors[j][i];
      }
      numerator += product;
    }

    let denominatorProduct = 1;

    for (let j = 0; j < vectors.length; j++) {
      let normSquared = 0;
      for (let i = 0; i < dimension; i++) {
        normSquared += vectors[j][i] * vectors[j][i];
      }
      denominatorProduct *= normSquared;
    }

    const denominator = Math.sqrt(denominatorProduct);

    if (denominator === 0) {
      return 0;
    }

    return numerator / denominator;
  }

  function buildTree(results: ProcessedImage[]) {
    let bestPair = [0, 1];
    let bestSimilarity = -1;

    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const similarity = cosineSimilarity(
          featureVector(results[i].features),
          featureVector(results[j].features),
        );

        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestPair = [i, j];
        }
      }
    }

    const currentClass = [bestPair[0], bestPair[1]];

    const steps: TreeStep[] = [
      {
        classItems: [...currentClass],
        similarity: bestSimilarity,
        addedIndex: null,
      },
    ];

    while (currentClass.length < results.length) {
      let bestCandidate = -1;
      let bestMultiCos = -1;

      for (let i = 0; i < results.length; i++) {
        if (currentClass.includes(i)) {
          continue;
        }

        const vectors = currentClass.map((idx) =>
          featureVector(results[idx].features),
        );

        vectors.push(featureVector(results[i].features));

        const similarity = multiCosineSimilarity(vectors);

        if (similarity > bestMultiCos) {
          bestMultiCos = similarity;
          bestCandidate = i;
        }
      }

      currentClass.push(bestCandidate);
      steps.push({
        classItems: [...currentClass],
        similarity: bestMultiCos,
        addedIndex: bestCandidate,
      });
    }

    return steps;
  }

  function calculateMetric(
    data: Uint8ClampedArray,
    imageWidth: number,
    rects: Rect[],
  ) {
    const colors = rects.map((r) => getBlockAverageColor(data, imageWidth, r));

    let avgR = 0;
    let avgG = 0;
    let avgB = 0;

    colors.forEach((c) => {
      avgR += c.r;
      avgG += c.g;
      avgB += c.b;
    });

    avgR /= colors.length;
    avgG /= colors.length;
    avgB /= colors.length;

    let variance = 0;

    colors.forEach((c) => {
      const dr = c.r - avgR;
      const dg = c.g - avgG;
      const db = c.b - avgB;

      variance += Math.sqrt(dr * dr + dg * dg + db * db);
    });

    const varianceMetric = variance / colors.length;

    const luminance = calculateLuminance(avgR, avgG, avgB);

    const metric = kL * luminance + kV * varianceMetric;

    const features = extractFeatures(
      avgR,
      avgG,
      avgB,
      luminance,
      varianceMetric,
    );

    return {
      metric,
      luminance,
      variance: varianceMetric,
      features,
    };
  }

  function getBlockAverageColor(
    data: Uint8ClampedArray,
    imageWidth: number,
    rect: Rect,
  ) {
    const startX = Math.floor(rect.x);
    const startY = Math.floor(rect.y);

    const endX = Math.ceil(rect.x + rect.width);
    const endY = Math.ceil(rect.y + rect.height);

    let r = 0;
    let g = 0;
    let b = 0;

    let count = 0;

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const i = (y * imageWidth + x) * 4;

        r += data[i];
        g += data[i + 1];
        b += data[i + 2];

        count++;
      }
    }

    if (count === 0) {
      return {
        r: 0,
        g: 0,
        b: 0,
      };
    }

    return {
      r: r / count,
      g: g / count,
      b: b / count,
    };
  }

  return (
    <Layout
      sidebar={
        <ImageLoader
          onOpenGallery={handleOpenGallery}
          onOpenProcessed={handleOpenProcessed}
          onOpenHelp={() => setHelpOpen(true)}
        />
      }
      content={
        <div className={styles.pageContent}>
          <div className={styles.workspace}>
            {image && (
              <div className={styles.infoPanel}>
                <div className={styles.depthBlock}>
                  <label>
                    Глубина разбиения:
                    <input
                      className={styles.depthInput}
                      type="number"
                      min={0}
                      max={MAX_DEPTH}
                      value={displayDepth}
                      disabled={!image || isProcessedView}
                      onChange={(e) => applyDepth(Number(e.target.value))}
                    />
                  </label>

                  <div className={styles.depthHint}>
                    Максимальная глубина: {MAX_DEPTH}
                  </div>
                </div>

                <p>
                  Блоков: 4^{displayDepth}
                  {" = "}
                  {displayBlocks}
                </p>

                <div className={styles.metricPanel}>
                  <div className={styles.metricTitle}>Коэффициенты метрики</div>

                  <div className={styles.metricFormula}>
                    M = kL × L + kV × V
                  </div>

                  <div className={styles.metricInputs}>
                    <label>
                      kL:
                      <input
                        disabled={isProcessedView}
                        type="number"
                        step="0.1"
                        value={kL}
                        onChange={(e) => {
                          const value = Number(e.target.value);

                          setKL(value);

                          setCurrentM(value * currentL + kV * currentV);
                        }}
                        className={styles.metricInput}
                      />
                    </label>

                    <label>
                      kV:
                      <input
                        disabled={isProcessedView}
                        type="number"
                        step="0.1"
                        value={kV}
                        onChange={(e) => {
                          const value = Number(e.target.value);

                          setKV(value);

                          setCurrentM(kL * currentL + value * currentV);
                        }}
                        className={styles.metricInput}
                      />
                    </label>
                  </div>

                  <div className={styles.metricExample}>
                    M = {kL}
                    {" × "}
                    {currentL.toFixed(1)}
                    {" + "}
                    {kV}
                    {" × "}
                    {currentV.toFixed(1)}
                    {" = "}
                    {currentM.toFixed(1)}
                  </div>
                </div>
                <div className={styles.controlsSection}>
                  <Controls
                    onReset={handleReset}
                    onChangeMode={setMode}
                    onProcessGallery={processGallery}
                    isProcessing={isProcessing}
                    progress={progress}
                    disabled={!hasImage}
                    isProcessedView={isProcessedView}
                  />
                  {isProcessedStrip && (
                    <Button
                      onClick={() => {
                        if (selectedTree.length === 0) {
                          alert("Для галереи нет дерева");
                          return;
                        }
                        setTreeOpen(true);
                      }}
                    >
                      Показать дерево
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className={styles.canvasRow}>
              <div className={styles.canvasColumn}>
                <h3>Исходное изображение</h3>

                <Canvas image={isProcessedView ? originalImage : image} />
              </div>

              <div className={styles.canvasColumn}>
                <h3>
                  {isProcessedView ? "Обработанная картина" : "Результат"}
                </h3>

                <Canvas
                  image={image}
                  rects={isProcessedView ? undefined : rects}
                  mode={isProcessedView ? undefined : mode}
                />
              </div>
            </div>
          </div>

          <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

          <ImageStrip
            title={stripTitle}
            images={stripImages}
            sortMode={sortMode}
            showSort={isProcessedStrip}
            onChangeSort={setSortMode}
            onSelect={(item) => {
              if (
                item.isProcessed &&
                item.originalSrc &&
                item.depth !== undefined
              ) {
                handleLoadProcessed(
                  item.src,
                  item.originalSrc,
                  item.depth,
                  item.kL,
                  item.kV,
                  item.luminance ?? 0,
                  item.variance ?? 0,
                  item.metric ?? 0,
                );

                return;
              }

              const img = new Image();

              img.src = item.src;

              img.onload = () => handleImageLoad(img);
            }}
          />
          <TreeModal
            open={treeOpen}
            onClose={() => setTreeOpen(false)}
            tree={selectedTree}
            images={stripImages}
          />
        </div>
      }
    />
  );
}

export default App;

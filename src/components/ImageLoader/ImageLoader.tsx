import styles from "./ImageLoader.module.css";
import galleriesData from "../../data/galleriesData.json";
import { useState } from "react";
import Button from "../UI/Button/Button";

import type { Gallery, ProcessedGallery } from "../../core/types";

type GalleryItem = {
  file: string;
  author: string;
  title: string;
  year: string;
};

type GalleryData = {
  name: string;
  path: string;
  items: GalleryItem[];
};

type Props = {
  onLoad: (img: HTMLImageElement) => void;

  onSelectGallery: (gallery: Gallery) => void;

  processedGalleries: ProcessedGallery[];

  onLoadProcessed: (
    processedSrc: string,
    originalSrc: string,
    depth: number,
  ) => void;
};

export default function ImageLoader({
  onLoad,
  onSelectGallery,
  processedGalleries,
  onLoadProcessed,
}: Props) {
  const [open, setOpen] = useState<string | null>(null);

  const [sortMode, setSortMode] = useState<"asc" | "desc">("asc");

  const galleries = galleriesData as Record<string, GalleryData>;

  const loadImage = (src: string) => {
    const img = new Image();

    img.src = src;

    img.onload = () => onLoad(img);
  };

  const sortedProcessed = processedGalleries.map((g) => ({
    ...g,

    images: [...g.images].sort((a, b) =>
      sortMode === "asc" ? a.metric - b.metric : b.metric - a.metric,
    ),
  }));

  return (
    <div className={styles.container}>
      {/* ===== ГАЛЕРЕИ ===== */}

      <div className={styles.section}>
        <h3>Галереи</h3>

        {Object.entries(galleries).map(([key, gallery]) => (
          <div key={key} className={styles.gallery}>
            <Button
              active={open === key}
              onClick={() => {
                setOpen(open === key ? null : key);

                onSelectGallery({
                  id: key,
                  name: gallery.name,
                  path: gallery.path,

                  images: gallery.items.map((i) => i.file),
                });
              }}
            >
              {gallery.name}
            </Button>

            {open === key && (
              <div className={styles.images}>
                {gallery.items.map((item) => (
                  <div key={item.file} className={styles.card}>
                    <img
                      src={gallery.path + item.file}
                      className={styles.image}
                      onClick={() => loadImage(gallery.path + item.file)}
                    />

                    <div className={styles.caption}>
                      <strong>{item.author}</strong>

                      <div>{item.title}</div>

                      <small>{item.year}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ===== ОБРАБОТАННЫЕ ===== */}

      <div className={styles.section}>
        <h3>Обработанные</h3>

        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as "asc" | "desc")}
          className={styles.select}
        >
          <option value="asc">По возрастанию</option>

          <option value="desc">По убыванию</option>
        </select>

        {processedGalleries.length === 0 && (
          <p style={{ opacity: 0.6 }}>Нет обработанных галерей</p>
        )}

        {sortedProcessed.map((g) => (
          <div key={g.id} className={styles.gallery}>
            <h4>
              {g.name} (Глубина: {g.depth})
            </h4>

            <div className={styles.images}>
              {g.images.map((img, i) => (
                <div key={i} className={styles.card}>
                  <img
                    src={img.processedSrc}
                    className={styles.image}
                    alt={`processed-${i}`}
                    onClick={() =>
                      onLoadProcessed(
                        img.processedSrc,
                        img.originalSrc,
                        g.depth,
                      )
                    }
                  />

                  <div className={styles.metric}>
                    Metric: {img.metric.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

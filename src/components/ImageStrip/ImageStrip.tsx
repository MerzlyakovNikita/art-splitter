import styles from "./ImageStrip.module.css";
import { useRef } from "react";
import type { FeatureVector } from "../../core/types";

type ImageItem = {
  src: string;
  title?: string;
  author?: string;
  metric?: number;
  luminance?: number;
  variance?: number;
  isProcessed?: boolean;
  originalSrc?: string;
  depth?: number;
  kL: number;
  kV: number;
  features?: FeatureVector;
};

type Props = {
  title: string;
  images: ImageItem[];
  onSelect: (image: ImageItem) => void;
  sortMode?: "asc" | "desc";
  onChangeSort?: (mode: "asc" | "desc") => void;
  showSort?: boolean;
};

export default function ImageStrip({
  title,
  images,
  onSelect,
  sortMode = "asc",
  onChangeSort,
  showSort = false,
}: Props) {
  const sorted = [...images];

  const stripRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (!stripRef.current) return;

    stripRef.current.scrollLeft += e.deltaY;
  };

  sorted.sort((a, b) => {
    const ma = a.metric ?? 0;
    const mb = b.metric ?? 0;

    return sortMode === "asc" ? ma - mb : mb - ma;
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3>{title}</h3>

        {showSort && (
          <div className={styles.controls}>
            <button
              className={styles.sortButton}
              onClick={() =>
                onChangeSort?.(sortMode === "asc" ? "desc" : "asc")
              }
            >
              {sortMode === "asc" ? "↑ По возрастанию" : "↓ По убыванию"}
            </button>
          </div>
        )}
      </div>

      <div ref={stripRef} className={styles.strip} onWheel={handleWheel}>
        {sorted.map((img, i) => (
          <div key={i} className={styles.card} onClick={() => onSelect(img)}>
            {img.metric !== undefined && (
              <div className={styles.metric}>M = {img.metric.toFixed(1)}</div>
            )}
            <img src={img.src} className={styles.image} />

            <div className={styles.info}>
              {img.author && <div className={styles.author}>{img.author}</div>}

              {img.title && <div className={styles.title}>{img.title}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

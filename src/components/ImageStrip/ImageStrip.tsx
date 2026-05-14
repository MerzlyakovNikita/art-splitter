import styles from "./ImageStrip.module.css";
import { useRef } from "react";
import type { FeatureVector } from "../../core/types";

type ImageItem = {
  id: string;
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
  kW: number;
  kG: number;
  kMColor: number;
  features?: FeatureVector;
};

type Props = {
  title: string;
  images: ImageItem[];
  onSelect: (image: ImageItem) => void;
  sortMode?: "asc" | "desc";
  onChangeSort?: (mode: "asc" | "desc") => void;
  showSort?: boolean;
  uploadButton?: React.ReactNode;
  deleteMode?: boolean;
  onDelete?: (id: string) => void;
};

export default function ImageStrip({
  title,
  images,
  onSelect,
  sortMode = "asc",
  onChangeSort,
  showSort = false,
  uploadButton,
  deleteMode,
  onDelete,
}: Props) {
  const sorted = [...images].sort((a, b) => {
    const ma = a.metric ?? 0;
    const mb = b.metric ?? 0;

    return sortMode === "asc" ? ma - mb : mb - ma;
  });

  const stripRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (!stripRef.current) return;

    stripRef.current.scrollLeft += e.deltaY;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3>{title}</h3>
        {uploadButton}
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
        {sorted.map((img) => (
          <div
            key={img.id}
            className={styles.card}
            onClick={() => onSelect(img)}
          >
            {img.metric !== undefined && (
              <div className={styles.metric}>M = {img.metric.toFixed(1)}</div>
            )}
            {deleteMode && onDelete && (
              <button
                type="button"
                className={styles.deleteImageButton}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete(img.id);
                }}
              >
                ×
              </button>
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

import styles from "./ImageLoader.module.css";
import galleriesData from "../../data/galleriesData.json";
import { useState } from "react";
import Button from "../UI/Button/Button";

type GalleryItem = {
  file: string;
  author: string;
  title: string;
  year: string;
};

type Gallery = {
  name: string;
  path: string;
  items: GalleryItem[];
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

type Props = {
  onLoad: (img: HTMLImageElement) => void;
  onSelectGallery: (gallery: any) => void;
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

  const galleries = galleriesData as Record<string, Gallery>;

  const loadImage = (src: string) => {
    const img = new Image();
    img.src = src;
    img.onload = () => onLoad(img);
  };

  return (
    <div className={styles.container}>
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

      <div className={styles.section}>
        <h3>Обработанные</h3>

        {processedGalleries.length === 0 && (
          <p style={{ opacity: 0.6 }}>Нет обработанных галерей</p>
        )}

        {processedGalleries.map((g) => (
          <div key={g.id} className={styles.gallery}>
            <h4>
              {g.name} (Глубина: {g.depth})
            </h4>

            <div className={styles.images}>
              {g.images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  className={styles.image}
                  alt={`processed-${i}`}
                  onClick={() =>
                    onLoadProcessed(
                      src,
                      g.originalPath + g.originalImages[i],
                      g.depth,
                    )
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

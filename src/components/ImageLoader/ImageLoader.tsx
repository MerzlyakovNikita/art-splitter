import styles from "./ImageLoader.module.css";
import { galleries } from "../../core/galleries";
import { useState } from "react";
import Button from "../UI/Button/Button";

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
  createdAt: number;
};

type Props = {
  onLoad: (img: HTMLImageElement) => void;
  onSelectGallery: (gallery: Gallery) => void;
  processedGalleries: ProcessedGallery[];
};

export default function ImageLoader({
  onLoad,
  onSelectGallery,
  processedGalleries,
}: Props) {
  const [open, setOpen] = useState<string | null>(null);

  const loadImage = (src: string) => {
    const img = new Image();
    img.src = src;
    img.onload = () => onLoad(img);
  };

  return (
    <div className={styles.container}>
      <h3>Изначальные</h3>

      {Object.entries(galleries).map(([key, g]) => {
        const gallery = g as Gallery;

        return (
          <div key={key} className={styles.gallery}>
            <Button
              active={open === key}
              onClick={() => {
                setOpen(open === key ? null : key);
                onSelectGallery(gallery);
              }}
            >
              {gallery.name}
            </Button>

            {open === key && (
              <div className={styles.images}>
                {gallery.images.map((img) => (
                  <img
                    key={img}
                    src={gallery.path + img}
                    className={styles.image}
                    onClick={() => loadImage(gallery.path + img)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

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
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

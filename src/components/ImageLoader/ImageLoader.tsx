import styles from "./ImageLoader.module.css";
import Button from "../UI/Button/Button";
import type { UserGallery } from "../../core/types";

type Props = {
  onOpenGallery: (galleryId: "russian" | "london") => void;
  onOpenProcessed: (galleryId: string) => void;
  onOpenHelp: () => void;
  userGalleries: UserGallery[];
  onOpenUserGallery: (galleryId: string) => void;
  processedUserGalleries: {
    id: string;
    name: string;
  }[];
};

export default function ImageLoader({
  onOpenGallery,
  onOpenProcessed,
  onOpenHelp,
  userGalleries,
  onOpenUserGallery,
  processedUserGalleries,
}: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.section}>
          <h3>Галереи</h3>

          <Button onClick={() => onOpenGallery("russian")}>
            Русский музей
          </Button>

          <Button onClick={() => onOpenGallery("london")}>
            Лондонская галерея
          </Button>
        </div>
        <div className={styles.section}>
          <h3>Пользовательские</h3>

          {userGalleries.map((gallery) => (
            <div key={gallery.id}>
              <Button onClick={() => onOpenUserGallery(gallery.id)}>
                {gallery.name}
              </Button>
            </div>
          ))}
        </div>
        <div className={styles.section}>
          <h3>Обработанные</h3>

          <Button onClick={() => onOpenProcessed("processed-russian")}>
            Обработанный Русский музей
          </Button>

          <Button onClick={() => onOpenProcessed("processed-london")}>
            Обработанная Лондонская галерея
          </Button>

          {processedUserGalleries.map((gallery) => (
            <Button
              key={gallery.id}
              onClick={() =>
                onOpenProcessed(gallery.id as "russian" | "london")
              }
            >
              {gallery.name}
            </Button>
          ))}
        </div>
      </div>
      <div className={styles.helpBlock}>
        <Button onClick={onOpenHelp}>Справка</Button>
      </div>
    </div>
  );
}

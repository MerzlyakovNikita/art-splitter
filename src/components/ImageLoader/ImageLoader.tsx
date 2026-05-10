import styles from "./ImageLoader.module.css";
import Button from "../UI/Button/Button";

type Props = {
  onOpenGallery: (galleryId: "russian" | "london") => void;
  onOpenProcessed: (galleryId: "russian" | "london") => void;
};

export default function ImageLoader({ onOpenGallery, onOpenProcessed }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3>Галереи</h3>

        <Button onClick={() => onOpenGallery("russian")}>Русский музей</Button>

        <Button onClick={() => onOpenGallery("london")}>
          Лондонская галерея
        </Button>
      </div>

      <div className={styles.section}>
        <h3>Обработанные</h3>

        <Button onClick={() => onOpenProcessed("russian")}>
          Обработанный Русский музей
        </Button>

        <Button onClick={() => onOpenProcessed("london")}>
          Обработанная Лондонская галерея
        </Button>
      </div>
    </div>
  );
}

import Button from "../UI/Button/Button";
import styles from "./Controls.module.css";

type Props = {
  onReset: () => void;
  onChangeMode: (mode: "grid" | "color") => void;
  disabled?: boolean;
  onProcessGallery: () => void;
  isProcessing: boolean;
  progress: number;
  isProcessedView: boolean;
};

export default function Controls({
  onReset,
  onChangeMode,
  disabled,
  onProcessGallery,
  isProcessing,
  progress,
  isProcessedView,
}: Props) {
  return (
    <div className={styles.controls}>
      <Button onClick={() => onChangeMode("grid")} disabled={isProcessedView}>
        Сетка
      </Button>
      <Button onClick={() => onChangeMode("color")} disabled={isProcessedView}>
        Средний цвет
      </Button>
      <div className={styles.fullWidth}>
        <Button
          onClick={() => {
            onProcessGallery?.();
          }}
          disabled={isProcessedView}
        >
          Применить ко всей галерее
        </Button>
      </div>
      <div className={styles.fullWidth}>
        <Button onClick={onReset} disabled={disabled || isProcessedView}>
          Сброс
        </Button>
      </div>
      {isProcessing && <div>Обработка: {(progress * 100).toFixed(0)}%</div>}
    </div>
  );
}

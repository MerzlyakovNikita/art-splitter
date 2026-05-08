import Button from "../UI/Button/Button";

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
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <Button onClick={onReset} disabled={disabled || isProcessedView}>
        Сброс
      </Button>
      <Button onClick={() => onChangeMode("grid")} disabled={isProcessedView}>
        Сетка
      </Button>
      <Button onClick={() => onChangeMode("color")} disabled={isProcessedView}>
        Средний цвет
      </Button>
      <Button
        onClick={() => {
          onProcessGallery?.();
        }}
        disabled={isProcessedView}
      >
        Применить ко всей галерее
      </Button>
      {isProcessing && <div>Обработка: {(progress * 100).toFixed(0)}%</div>}
    </div>
  );
}

import Button from "../UI/Button/Button";

type Props = {
  onSplit: () => void;
  onReset: () => void;
  onChangeMode: (mode: "grid" | "color") => void;
  disabled?: boolean;
  onProcessGallery: () => void;
  isProcessing: boolean;
  progress: number;
  isProcessedView: boolean;
};

export default function Controls({
  onSplit,
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
      <Button onClick={onSplit} disabled={disabled || isProcessedView}>
        Разбить изображение
      </Button>
      <Button onClick={onReset} disabled={disabled || isProcessedView}>
        Сброс
      </Button>
      <Button onClick={() => onChangeMode("grid")}>Сетка</Button>
      <Button onClick={() => onChangeMode("color")}>Средний цвет</Button>
      <Button
        onClick={() => {
          console.log("CLICK");
          console.log("TYPE:", typeof onProcessGallery);
          onProcessGallery?.();
        }}
      >
        Применить ко всей галерее
      </Button>
      {isProcessing && <div>Обработка: {(progress * 100).toFixed(0)}%</div>}
    </div>
  );
}

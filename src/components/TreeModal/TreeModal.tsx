import styles from "./TreeModal.module.css";
import TreeGraph from "../TreeGraph/TreeGraph";
import type { TreeStep } from "../../core/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
  tree: TreeStep[];
  images: {
    src: string;
    title?: string;
  }[];
};

export default function TreeModal({
  open,
  onClose,
  onOpenHelp,
  tree,
  images,
}: Props) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>
          ×
        </button>

        <h2>Дерево классов</h2>
        <div className={styles.vectorHint}>
          (Т Д Тп З М)
          {" — "}
          пространство признаков (
          <span className={styles.helpLink} onClick={onOpenHelp}>
            см. справку
          </span>
          )
        </div>

        <TreeGraph tree={tree} images={images} />
      </div>
    </div>
  );
}

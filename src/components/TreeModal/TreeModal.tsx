import styles from "./TreeModal.module.css";
import TreeGraph from "../TreeGraph/TreeGraph";
import type { TreeStep } from "../../core/types";

type Props = {
  open: boolean;
  onClose: () => void;
  tree: TreeStep[];

  images: {
    src: string;
    title?: string;
  }[];
};

export default function TreeModal({ open, onClose, tree, images }: Props) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>
          ×
        </button>

        <h2>Дерево сходства</h2>

        <TreeGraph tree={tree} images={images} />
      </div>
    </div>
  );
}

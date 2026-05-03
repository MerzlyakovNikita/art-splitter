import styles from "./Button.module.css";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
};

export default function Button({ children, onClick, disabled, active }: Props) {
  return (
    <button
      className={`${styles.button} ${active ? styles.buttonActive : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

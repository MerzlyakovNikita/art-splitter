import styles from "./Layout.module.css";

type Props = {
  sidebar: React.ReactNode;
  content: React.ReactNode;
};

export default function Layout({ sidebar, content }: Props) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>{sidebar}</aside>
      <main className={styles.content}>{content}</main>
    </div>
  );
}

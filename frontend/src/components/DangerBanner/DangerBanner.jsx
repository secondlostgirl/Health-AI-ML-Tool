import styles from './DangerBanner.module.css';

export default function DangerBanner({ show, message }) {
  if (!show) return null;

  return (
    <div className={styles.banner} role="alert">
      <span className={styles.icon}>!</span>
      <span className={styles.text}>{message}</span>
    </div>
  );
}

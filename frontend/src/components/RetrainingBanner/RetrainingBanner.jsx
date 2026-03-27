import styles from './RetrainingBanner.module.css';

export default function RetrainingBanner({ isTraining }) {
  if (!isTraining) return null;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <span className={styles.dot} />
      <span className={styles.text}>Retraining model...</span>
    </div>
  );
}

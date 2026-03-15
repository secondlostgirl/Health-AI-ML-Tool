import styles from './DataStats.module.css';

export default function DataStats({ records, features, missingPercent }) {
  const missingClass =
    missingPercent < 5
      ? styles.green
      : missingPercent < 15
        ? styles.yellow
        : styles.red;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <span className={styles.icon}>📋</span>
        <div className={styles.info}>
          <span className={styles.value}>{records.toLocaleString()}</span>
          <span className={styles.label}>Patients Records</span>
        </div>
      </div>
      <div className={styles.card}>
        <span className={styles.icon}>🔢</span>
        <div className={styles.info}>
          <span className={styles.value}>{features}</span>
          <span className={styles.label}>Measurements</span>
        </div>
      </div>
      <div className={styles.card}>
        <span className={styles.icon}>⚠️</span>
        <div className={styles.info}>
          <span className={`${styles.value} ${missingClass}`}>
            {missingPercent.toFixed(1)}%
          </span>
          <span className={styles.label}>Missing Data</span>
        </div>
      </div>
    </div>
  );
}

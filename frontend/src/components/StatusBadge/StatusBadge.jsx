import styles from './StatusBadge.module.css';

export default function StatusBadge({ status }) {
  if (status !== 'complete') return null;

  return (
    <span className={styles.badge}>
      <span className={styles.dot}>●</span>
      STATUS: PIPELINE READY
    </span>
  );
}

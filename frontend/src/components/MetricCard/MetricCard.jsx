import styles from './MetricCard.module.css';

function getColorClass(value) {
  if (value >= 0.8) return styles.green;
  if (value >= 0.5) return styles.amber;
  return styles.red;
}

export default function MetricCard({ label, value, clinicalInterpretation }) {
  const pct = (value * 100).toFixed(1);

  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.value} ${getColorClass(value)}`}>{pct}%</span>
      <span className={styles.interpretation}>{clinicalInterpretation}</span>
    </div>
  );
}

import styles from './ConfusionMatrix.module.css';

const CELL_CONFIG = [
  {
    key: 'tn',
    label: 'True Negatives',
    description: 'Correctly identified as healthy',
    colorClass: 'green',
    row: 0,
    col: 0,
  },
  {
    key: 'fp',
    label: 'False Positives',
    description: 'Healthy patients incorrectly flagged',
    colorClass: 'amber',
    row: 0,
    col: 1,
  },
  {
    key: 'fn',
    label: 'False Negatives',
    description: 'Missed diagnoses',
    colorClass: 'red',
    row: 1,
    col: 0,
  },
  {
    key: 'tp',
    label: 'True Positives',
    description: 'Correctly identified with condition',
    colorClass: 'green',
    row: 1,
    col: 1,
  },
];

export default function ConfusionMatrix({ matrix }) {
  if (!matrix) return null;

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>Confusion Matrix</h3>

      {/* Axis labels */}
      <div className={styles.axisLabels}>
        <span className={styles.axisLabel}>Predicted Negative</span>
        <span className={styles.axisLabel}>Predicted Positive</span>
      </div>

      <div className={styles.grid}>
        {CELL_CONFIG.map((cell) => (
          <div
            key={cell.key}
            className={`${styles.cell} ${styles[cell.colorClass]}`}
          >
            <span className={styles.cellValue}>{matrix[cell.key]}</span>
            <span className={styles.cellLabel}>{cell.label}</span>
            <span className={styles.cellDesc}>{cell.description}</span>
          </div>
        ))}
      </div>

      {/* FN red banner */}
      {matrix.fn > 0 && (
        <div className={styles.fnBanner}>
          <span className={styles.bannerIcon}>!</span>
          Missed diagnoses — {matrix.fn} patients with the condition were not
          detected
        </div>
      )}

      {/* FP info banner */}
      {matrix.fp > 0 && (
        <div className={styles.fpBanner}>
          <span className={styles.bannerIcon}>i</span>
          False alarms — {matrix.fp} healthy patients were incorrectly flagged
        </div>
      )}
    </div>
  );
}

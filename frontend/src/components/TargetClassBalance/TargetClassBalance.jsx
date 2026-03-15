import styles from './TargetClassBalance.module.css';

const COLORS = ['#2ea043', '#3d444d', '#d29922', '#58a6ff'];

export default function TargetClassBalance({
  labels,
  percentages,
  isImbalanced,
  targetLabel,
}) {
  if (!labels || labels.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Target Class Balance</h3>
        {targetLabel && <span className={styles.badge}>{targetLabel}</span>}
      </div>

      <div className={styles.barContainer}>
        {labels.map((label, i) => (
          <div
            key={label}
            className={styles.segment}
            style={{
              width: `${percentages[i]}%`,
              backgroundColor: COLORS[i % COLORS.length],
            }}
          >
            <span className={styles.segmentLabel}>
              {label} ({percentages[i]}%)
            </span>
          </div>
        ))}
      </div>

      {isImbalanced && (
        <div className={styles.warning} role="alert">
          <span className={styles.warningIcon}>⚠</span>
          <div>
            <strong>Imbalance detected</strong>
            <p>
              Only {Math.min(...percentages)}% of patients belong to the minority
              class. This class imbalance will be handled automatically during
              Data Preparation in Step 3.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

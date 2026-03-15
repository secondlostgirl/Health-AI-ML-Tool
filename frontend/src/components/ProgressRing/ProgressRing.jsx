import styles from './ProgressRing.module.css';

const SIZE = 180;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProgressRing({ progress, status, duration }) {
  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.svg}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
      >
        <circle
          className={styles.bgCircle}
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
        />
        <circle
          className={styles.progressCircle}
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
        <text
          x={SIZE / 2}
          y={SIZE / 2 - 8}
          className={styles.progressText}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {progress}%
        </text>
        <text
          x={SIZE / 2}
          y={SIZE / 2 + 16}
          className={styles.progressLabel}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          PROCESSED
        </text>
      </svg>
      <div className={styles.statusText}>
        {status === 'complete' ? 'System Idle: Complete' : status === 'running' ? 'Processing...' : 'Ready to process'}
      </div>
      {duration !== null && duration !== undefined && (
        <div className={styles.duration}>Duration: {duration}s</div>
      )}
    </div>
  );
}

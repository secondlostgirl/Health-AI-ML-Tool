import styles from './ROCCurve.module.css';

const WIDTH = 320;
const HEIGHT = 320;
const PAD = 44;
const PLOT_W = WIDTH - PAD * 2;
const PLOT_H = HEIGHT - PAD * 2;

function scaleX(val) {
  return PAD + val * PLOT_W;
}
function scaleY(val) {
  return HEIGHT - PAD - val * PLOT_H;
}

export default function ROCCurve({ fpr, tpr, auc }) {
  if (!fpr || !tpr) {
    return (
      <div className={styles.wrapper}>
        <h3 className={styles.heading}>ROC Curve</h3>
        <div className={styles.placeholder}>
          Train a model to see the ROC curve.
        </div>
      </div>
    );
  }

  const curvePoints = fpr.map((f, i) => `${scaleX(f)},${scaleY(tpr[i])}`).join(' ');
  const fillPoints = [
    `${scaleX(0)},${scaleY(0)}`,
    ...fpr.map((f, i) => `${scaleX(f)},${scaleY(tpr[i])}`),
    `${scaleX(1)},${scaleY(0)}`,
  ].join(' ');

  // Axis tick values
  const ticks = [0, 0.25, 0.5, 0.75, 1.0];

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>ROC Curve</h3>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={styles.svg}
        aria-label={`ROC Curve with AUC ${auc}`}
      >
        {/* Plot background */}
        <rect
          x={PAD}
          y={PAD}
          width={PLOT_W}
          height={PLOT_H}
          fill="var(--color-bg-primary)"
          stroke="var(--color-border)"
          strokeWidth="1"
        />

        {/* Grid lines */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={scaleX(t)}
              y1={PAD}
              x2={scaleX(t)}
              y2={HEIGHT - PAD}
              stroke="var(--color-border)"
              strokeWidth="0.5"
            />
            <line
              x1={PAD}
              y1={scaleY(t)}
              x2={WIDTH - PAD}
              y2={scaleY(t)}
              stroke="var(--color-border)"
              strokeWidth="0.5"
            />
          </g>
        ))}

        {/* Diagonal reference line */}
        <line
          x1={scaleX(0)}
          y1={scaleY(0)}
          x2={scaleX(1)}
          y2={scaleY(1)}
          stroke="var(--color-text-muted)"
          strokeWidth="1"
          strokeDasharray="6 4"
        />

        {/* Area under curve */}
        <polygon
          points={fillPoints}
          fill="var(--color-accent-green)"
          opacity="0.12"
        />

        {/* ROC curve line */}
        <polyline
          points={curvePoints}
          fill="none"
          stroke="var(--color-accent-green)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* X-axis ticks + labels */}
        {ticks.map((t) => (
          <text
            key={`x-${t}`}
            x={scaleX(t)}
            y={HEIGHT - PAD + 16}
            textAnchor="middle"
            fontSize="10"
            fill="var(--color-text-muted)"
          >
            {t}
          </text>
        ))}

        {/* Y-axis ticks + labels */}
        {ticks.map((t) => (
          <text
            key={`y-${t}`}
            x={PAD - 8}
            y={scaleY(t) + 4}
            textAnchor="end"
            fontSize="10"
            fill="var(--color-text-muted)"
          >
            {t}
          </text>
        ))}

        {/* Axis labels */}
        <text
          x={WIDTH / 2}
          y={HEIGHT - 6}
          textAnchor="middle"
          fontSize="11"
          fill="var(--color-text-secondary)"
          fontWeight="600"
        >
          False Positive Rate
        </text>
        <text
          x={12}
          y={HEIGHT / 2}
          textAnchor="middle"
          fontSize="11"
          fill="var(--color-text-secondary)"
          fontWeight="600"
          transform={`rotate(-90, 12, ${HEIGHT / 2})`}
        >
          True Positive Rate
        </text>

        {/* AUC annotation */}
        <text
          x={WIDTH - PAD - 8}
          y={PAD + 20}
          textAnchor="end"
          fontSize="13"
          fontWeight="700"
          fill="var(--color-accent-green)"
        >
          AUC = {auc.toFixed(3)}
        </text>
      </svg>

      <p className={styles.note}>
        The ROC curve plots the trade-off between detecting true positives
        (sensitivity) and avoiding false positives (1 - specificity). The
        diagonal dashed line represents random guessing (AUC = 0.5). A curve
        further from the diagonal indicates better discrimination.
      </p>
    </div>
  );
}

import { MODEL_DEFINITIONS } from '../../data/modelDefinitions';
import styles from './ComparisonTable.module.css';

function getColorClass(value) {
  if (value >= 0.8) return styles.green;
  if (value >= 0.5) return styles.amber;
  return styles.red;
}

function fmtPct(v) {
  return (v * 100).toFixed(1) + '%';
}

function getModelName(id) {
  const m = MODEL_DEFINITIONS.find((d) => d.id === id);
  return m ? m.name : id;
}

export default function ComparisonTable({ entries, onRemove }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>Model Comparison</h3>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Model</th>
              <th>Accuracy</th>
              <th>Precision</th>
              <th>Sensitivity</th>
              <th>Specificity</th>
              <th>F1</th>
              <th>AUC</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.model}>
                <td className={styles.modelCell}>{getModelName(entry.model)}</td>
                <td>{fmtPct(entry.metrics.accuracy)}</td>
                <td>{fmtPct(entry.metrics.precision)}</td>
                <td className={getColorClass(entry.metrics.recall)}>
                  {fmtPct(entry.metrics.recall)}
                </td>
                <td>{fmtPct(entry.metrics.specificity)}</td>
                <td>{fmtPct(entry.metrics.f1)}</td>
                <td>{fmtPct(entry.metrics.auc)}</td>
                <td>
                  <button
                    className={styles.removeBtn}
                    onClick={() => onRemove(entry.model)}
                    aria-label={`Remove ${getModelName(entry.model)} from comparison`}
                  >
                    x
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

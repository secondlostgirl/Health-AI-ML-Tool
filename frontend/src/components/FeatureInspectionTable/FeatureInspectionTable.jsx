import { useState, useMemo } from 'react';
import styles from './FeatureInspectionTable.module.css';

export default function FeatureInspectionTable({ columnStats }) {
  const [sortBy, setSortBy] = useState('missing');

  const sorted = useMemo(() => {
    if (!columnStats) return [];
    const copy = [...columnStats];
    if (sortBy === 'missing') {
      copy.sort((a, b) => b.missingPercent - a.missingPercent);
    } else if (sortBy === 'name') {
      copy.sort((a, b) => a.name.localeCompare(b.name));
    }
    return copy;
  }, [columnStats, sortBy]);

  if (!sorted.length) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Feature Inspection Table</h3>
        <div className={styles.sortControl}>
          <label className={styles.sortLabel}>Sort by:</label>
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="missing">Missing %</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <table className={styles.table} role="table">
        <thead>
          <tr>
            <th scope="col">MEASUREMENT</th>
            <th scope="col">TYPE</th>
            <th scope="col">MISSING?</th>
            <th scope="col">ACTION NEEDED</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((col) => (
            <tr key={col.name}>
              <td className={styles.nameCell}>{col.name}</td>
              <td>
                <span
                  className={`${styles.typeBadge} ${
                    col.type === 'Numerical'
                      ? styles.numerical
                      : styles.categorical
                  }`}
                >
                  {col.type}
                </span>
              </td>
              <td>
                <div className={styles.missingBar}>
                  <div
                    className={styles.missingFill}
                    style={{
                      width: `${Math.min(col.missingPercent * 5, 100)}%`,
                      backgroundColor:
                        col.missingPercent >= 5
                          ? 'var(--color-text-warning)'
                          : 'var(--color-accent-green)',
                    }}
                  />
                  <span className={styles.missingValue}>
                    {col.missingPercent}%
                  </span>
                </div>
              </td>
              <td>
                <span
                  className={`${styles.actionBadge} ${
                    col.actionNeeded === 'READY'
                      ? styles.ready
                      : styles.fill
                  }`}
                >
                  {col.actionNeeded}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

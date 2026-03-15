import { useState, useMemo } from 'react';
import useDataStore from '../../stores/useDataStore';
import { computeColumnStats } from '../../utils/dataAnalyzer';
import styles from './ColumnMapper.module.css';

export default function ColumnMapper() {
  const csvData = useDataStore((s) => s.csvData);
  const targetColumn = useDataStore((s) => s.targetColumn);
  const setTargetColumn = useDataStore((s) => s.setTargetColumn);
  const mapperOpen = useDataStore((s) => s.mapperOpen);
  const setMapperOpen = useDataStore((s) => s.setMapperOpen);
  const mapperSaved = useDataStore((s) => s.mapperSaved);
  const saveMapper = useDataStore((s) => s.saveMapper);

  const columnStats = useMemo(
    () => (csvData ? computeColumnStats(csvData) : []),
    [csvData]
  );

  const [included, setIncluded] = useState(() => {
    const init = {};
    columnStats.forEach((col) => {
      init[col.name] = true;
    });
    return init;
  });

  if (!csvData) return null;

  const columns = columnStats.map((c) => c.name);

  const handleToggleInclude = (colName) => {
    setIncluded((prev) => ({ ...prev, [colName]: !prev[colName] }));
  };

  const canSave = targetColumn && columns.includes(targetColumn);

  return (
    <div className={styles.wrapper}>
      <div className={styles.targetSection}>
        <label className={styles.label}>TARGET COLUMN</label>
        <select
          className={styles.select}
          value={targetColumn || ''}
          onChange={(e) => setTargetColumn(e.target.value)}
        >
          <option value="">Select target column...</option>
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      <button
        className={styles.mapperBtn}
        onClick={() => setMapperOpen(!mapperOpen)}
      >
        ⚠ Column Mapper &amp; Validate
      </button>

      {mapperSaved && (
        <div className={styles.savedBadge}>✓ Mapping saved</div>
      )}

      {mapperOpen && (
        <div className={styles.mapperPanel}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Type</th>
                <th>Include</th>
              </tr>
            </thead>
            <tbody>
              {columnStats.map((col) => (
                <tr key={col.name}>
                  <td className={styles.colName}>{col.name}</td>
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
                    <input
                      type="checkbox"
                      checked={included[col.name] !== false}
                      onChange={() => handleToggleInclude(col.name)}
                      aria-label={`Include ${col.name}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className={`${styles.saveBtn} ${!canSave ? styles.disabled : ''}`}
            onClick={canSave ? saveMapper : undefined}
            disabled={!canSave}
          >
            Save Mapping
          </button>
        </div>
      )}
    </div>
  );
}

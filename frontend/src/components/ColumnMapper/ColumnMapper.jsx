import { useState, useMemo } from 'react';
import useDataStore from '../../stores/useDataStore';
import { computeColumnStats } from '../../utils/dataAnalyzer';
import { saveColumnMapping } from '../../api';
import { getSessionId } from '../../api/client';
import styles from './ColumnMapper.module.css';

export default function ColumnMapper() {
  const csvData = useDataStore((s) => s.csvData);
  const targetColumn = useDataStore((s) => s.targetColumn);
  const setTargetColumn = useDataStore((s) => s.setTargetColumn);
  const mapperOpen = useDataStore((s) => s.mapperOpen);
  const setMapperOpen = useDataStore((s) => s.setMapperOpen);
  const mapperSaved = useDataStore((s) => s.mapperSaved);
  const saveMapperLocal = useDataStore((s) => s.saveMapper);
  const uploadLoading = useDataStore((s) => s.uploadLoading);
  const mappingLoading = useDataStore((s) => s.mappingLoading);
  const mappingError = useDataStore((s) => s.mappingError);
  const setMappingLoading = useDataStore((s) => s.setMappingLoading);
  const setMappingError = useDataStore((s) => s.setMappingError);

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

  // Include categorical columns AND numeric columns with ≤10 unique values
  // (binary targets like 0/1 are classified as Numerical but are valid targets)
  const targetEligibleColumns = useMemo(() => {
    if (!csvData || columnStats.length === 0) return [];
    return columnStats
      .filter((col) => {
        if (col.type === 'Categorical') return true;
        const unique = new Set(csvData.map((r) => r[col.name]));
        return unique.size <= 10;
      })
      .map((c) => c.name);
  }, [columnStats, csvData]);

  const handleToggleInclude = (colName) => {
    setIncluded((prev) => ({ ...prev, [colName]: !prev[colName] }));
  };

  const canSave = targetColumn && columns.includes(targetColumn) && !uploadLoading && !mappingLoading;

  const handleSave = async () => {
    if (!canSave) return;

    const featureColumns = columns.filter(
      (col) => included[col] !== false && col !== targetColumn
    );
    const dropColumns = columns.filter(
      (col) => included[col] === false
    );

    // If backend session exists, save via API
    if (getSessionId()) {
      setMappingLoading(true);
      setMappingError(null);

      const { error } = await saveColumnMapping(targetColumn, featureColumns, dropColumns);

      setMappingLoading(false);

      if (error) {
        setMappingError(error);
        return;
      }
    }

    // Local save (gates Step 3)
    saveMapperLocal();
  };

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
          {targetEligibleColumns.map((col) => (
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

      {mappingError && (
        <div className={styles.error || styles.savedBadge} style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          {mappingError}
        </div>
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
            onClick={canSave ? handleSave : undefined}
            disabled={!canSave}
          >
            {mappingLoading ? 'Saving...' : 'Save Mapping'}
          </button>
        </div>
      )}
    </div>
  );
}

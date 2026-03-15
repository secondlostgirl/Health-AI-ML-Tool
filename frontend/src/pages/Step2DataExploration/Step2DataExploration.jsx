import { useEffect, useMemo } from 'react';
import useAppStore from '../../stores/useAppStore';
import useDataStore from '../../stores/useDataStore';
import { getDefaultDataset } from '../../data/defaultDatasets';
import { computeStats, computeColumnStats, computeClassBalance } from '../../utils/dataAnalyzer';
import CSVUploader from '../../components/CSVUploader/CSVUploader';
import ColumnMapper from '../../components/ColumnMapper/ColumnMapper';
import DataStats from '../../components/DataStats/DataStats';
import TargetClassBalance from '../../components/TargetClassBalance/TargetClassBalance';
import FeatureInspectionTable from '../../components/FeatureInspectionTable/FeatureInspectionTable';
import styles from './Step2DataExploration.module.css';

export default function Step2DataExploration() {
  const selectedDomainId = useAppStore((s) => s.selectedDomainId);
  const csvData = useDataStore((s) => s.csvData);
  const targetColumn = useDataStore((s) => s.targetColumn);
  const useDefaultDatasetAction = useDataStore((s) => s.useDefaultDataset);
  const setTargetColumn = useDataStore((s) => s.setTargetColumn);

  // Load default dataset on mount if no data loaded
  useEffect(() => {
    if (!csvData) {
      const dataset = getDefaultDataset(selectedDomainId);
      if (dataset) {
        useDefaultDatasetAction(dataset.rows);
        setTargetColumn(dataset.meta.target);
      }
    }
  }, [selectedDomainId]);

  const stats = useMemo(
    () => (csvData ? computeStats(csvData) : null),
    [csvData]
  );

  const columnStats = useMemo(
    () => (csvData ? computeColumnStats(csvData) : []),
    [csvData]
  );

  const classBalance = useMemo(
    () => (csvData && targetColumn ? computeClassBalance(csvData, targetColumn) : null),
    [csvData, targetColumn]
  );

  const dataset = getDefaultDataset(selectedDomainId);
  const targetLabel = dataset?.meta?.targetLabel || '';

  return (
    <div className={styles.layout}>
      <div className={styles.leftPanel}>
        <CSVUploader />
        <ColumnMapper />
        {stats && (
          <DataStats
            records={stats.records}
            features={stats.features}
            missingPercent={stats.missingPercent}
          />
        )}
      </div>

      <div className={styles.rightPanel}>
        {classBalance && (
          <TargetClassBalance
            labels={classBalance.labels}
            percentages={classBalance.percentages}
            isImbalanced={classBalance.isImbalanced}
            targetLabel={targetLabel}
          />
        )}
        {columnStats.length > 0 && (
          <FeatureInspectionTable columnStats={columnStats} />
        )}
        <p className={styles.hint}>
          <span className={styles.hintIcon}>ℹ</span>
          Review the distribution and missing values before advancing to the
          preprocessing stage.
        </p>
      </div>
    </div>
  );
}

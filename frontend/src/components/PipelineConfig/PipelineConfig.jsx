import useDataStore from '../../stores/useDataStore';
import styles from './PipelineConfig.module.css';

export default function PipelineConfig({ onApply }) {
  const config = useDataStore((s) => s.pipelineConfig);
  const setPipelineConfig = useDataStore((s) => s.setPipelineConfig);
  const pipelineStatus = useDataStore((s) => s.pipelineStatus);

  const isRunning = pipelineStatus === 'running';

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Pipeline Configuration</h3>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="imputation">
          Missing Value Imputation
        </label>
        <select
          id="imputation"
          className={styles.select}
          value={config.imputation}
          onChange={(e) => setPipelineConfig('imputation', e.target.value)}
          disabled={isRunning}
        >
          <option value="mean">Mean</option>
          <option value="median">Median</option>
          <option value="mode">Mode</option>
          <option value="knn">KNN Imputer</option>
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="scaling">
          Feature Scaling
        </label>
        <select
          id="scaling"
          className={styles.select}
          value={config.scaling}
          onChange={(e) => setPipelineConfig('scaling', e.target.value)}
          disabled={isRunning}
        >
          <option value="standard">StandardScaler</option>
          <option value="minmax">MinMaxScaler</option>
          <option value="robust">RobustScaler</option>
          <option value="none">None</option>
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="outlier">
          Outlier Handling
        </label>
        <select
          id="outlier"
          className={styles.select}
          value={config.outlierHandling}
          onChange={(e) => setPipelineConfig('outlierHandling', e.target.value)}
          disabled={isRunning}
        >
          <option value="clip">Clip</option>
          <option value="remove">Remove</option>
          <option value="winsorize">Winsorize</option>
          <option value="none">None</option>
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="featureSelection">
          Feature Selection
        </label>
        <select
          id="featureSelection"
          className={styles.select}
          value={config.featureSelection}
          onChange={(e) => setPipelineConfig('featureSelection', e.target.value)}
          disabled={isRunning}
        >
          <option value="all">All Features</option>
          <option value="correlation">Correlation Filter</option>
          <option value="variance">Variance Threshold</option>
          <option value="mutual_info">Mutual Information</option>
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="split">
          Train / Test Split: {config.trainTestSplit}% / {100 - config.trainTestSplit}%
        </label>
        <input
          id="split"
          type="range"
          min="50"
          max="90"
          step="5"
          value={config.trainTestSplit}
          onChange={(e) =>
            setPipelineConfig('trainTestSplit', Number(e.target.value))
          }
          className={styles.slider}
          disabled={isRunning}
        />
        <div className={styles.sliderLabels}>
          <span>50%</span>
          <span>90%</span>
        </div>
      </div>

      <button
        className={`${styles.applyBtn} ${isRunning ? styles.disabled : ''}`}
        onClick={isRunning ? undefined : onApply}
        disabled={isRunning}
      >
        {isRunning ? 'Processing...' : 'Apply Pipeline'}
      </button>
    </div>
  );
}

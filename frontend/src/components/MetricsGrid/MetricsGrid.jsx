import { METRIC_DEFINITIONS } from '../../data/modelDefinitions';
import MetricCard from '../MetricCard/MetricCard';
import styles from './MetricsGrid.module.css';

export default function MetricsGrid({ metrics }) {
  return (
    <div className={styles.grid}>
      {METRIC_DEFINITIONS.map((def) => (
        <MetricCard
          key={def.key}
          label={def.label}
          value={metrics[def.key]}
          clinicalInterpretation={def.clinicalInterpretation}
        />
      ))}
    </div>
  );
}

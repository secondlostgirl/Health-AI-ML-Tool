import useAppStore from '../../stores/useAppStore';
import useModelStore from '../../stores/useModelStore';
import { MODEL_DEFINITIONS } from '../../data/modelDefinitions';
import MetricsGrid from '../../components/MetricsGrid/MetricsGrid';
import ConfusionMatrix from '../../components/ConfusionMatrix/ConfusionMatrix';
import ROCCurve from '../../components/ROCCurve/ROCCurve';
import DangerBanner from '../../components/DangerBanner/DangerBanner';
import ComparisonTable from '../../components/ComparisonTable/ComparisonTable';
import styles from './Step5Results.module.css';

export default function Step5Results() {
  const setStep = useAppStore((s) => s.setStep);

  const trainingStatus = useModelStore((s) => s.trainingStatus);
  const trainingResults = useModelStore((s) => s.trainingResults);
  const comparisonList = useModelStore((s) => s.comparisonList);
  const addToComparison = useModelStore((s) => s.addToComparison);
  const removeFromComparison = useModelStore((s) => s.removeFromComparison);

  // Gate: model must be trained
  if (trainingStatus !== 'complete' || !trainingResults) {
    return (
      <div className={styles.blocked}>
        <div className={styles.blockedCard}>
          <span className={styles.blockedIcon}>🔒</span>
          <h2>Step 5 is locked</h2>
          <p>
            Train a model in Step 4 before viewing results and performance
            metrics.
          </p>
          <button className={styles.goBackBtn} onClick={() => setStep(4)}>
            &larr; Go Back to Step 4
          </button>
        </div>
      </div>
    );
  }

  const { metrics, confusionMatrix, rocCurve, model } = trainingResults;
  const modelDef = MODEL_DEFINITIONS.find((m) => m.id === model);
  const modelName = modelDef ? modelDef.fullName : model;
  const showDanger = metrics.recall < 0.5;

  const alreadyCompared = comparisonList.some((e) => e.model === model);

  const handleCompare = () => {
    addToComparison({
      model,
      params: trainingResults.params,
      metrics,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <div>
          <h2 className={styles.title}>Results</h2>
          <p className={styles.subtitle}>
            Performance metrics for {modelName}
          </p>
        </div>
        <button
          className={styles.compareBtn}
          onClick={handleCompare}
        >
          {alreadyCompared ? 'Update in Comparison' : '+ Compare'}
        </button>
      </div>

      <DangerBanner
        show={showDanger}
        message={`Low Sensitivity Alert: Only ${(metrics.recall * 100).toFixed(1)}% of patients with the condition are being detected. This means a high rate of missed diagnoses.`}
      />

      <div className={styles.layout}>
        <div className={styles.leftPanel}>
          <MetricsGrid metrics={metrics} />
          <ConfusionMatrix matrix={confusionMatrix} />
        </div>

        <div className={styles.rightPanel}>
          <ROCCurve
            fpr={rocCurve?.fpr}
            tpr={rocCurve?.tpr}
            auc={rocCurve?.auc ?? metrics.auc}
          />
          <ComparisonTable
            entries={comparisonList}
            onRemove={removeFromComparison}
          />
        </div>
      </div>
    </div>
  );
}

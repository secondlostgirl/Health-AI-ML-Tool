import { useCallback, useMemo, useEffect } from 'react';
import useAppStore from '../../stores/useAppStore';
import useDataStore from '../../stores/useDataStore';
import useModelStore from '../../stores/useModelStore';
import { MODEL_DEFINITIONS } from '../../data/modelDefinitions';
import { domains } from '../../data/domains';
import { trainModel } from '../../api';
import { generateMockResults } from '../../utils/mockTrainingResults';
import { debounce } from '../../utils/debounce';
import ModelTabBar from '../../components/ModelTabBar/ModelTabBar';
import ModelParameterPanel from '../../components/ModelParameterPanel/ModelParameterPanel';
import RetrainingBanner from '../../components/RetrainingBanner/RetrainingBanner';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import styles from './Step4ModelParameters.module.css';

export default function Step4ModelParameters() {
  const selectedDomainId = useAppStore((s) => s.selectedDomainId);
  const setStep = useAppStore((s) => s.setStep);
  const pipelineStatus = useDataStore((s) => s.pipelineStatus);

  const selectedModel = useModelStore((s) => s.selectedModel);
  const modelParams = useModelStore((s) => s.modelParams);
  const autoRetrain = useModelStore((s) => s.autoRetrain);
  const trainingStatus = useModelStore((s) => s.trainingStatus);
  const trainingError = useModelStore((s) => s.trainingError);
  const setSelectedModel = useModelStore((s) => s.setSelectedModel);
  const setModelParam = useModelStore((s) => s.setModelParam);
  const setAutoRetrain = useModelStore((s) => s.setAutoRetrain);
  const setTrainingStatus = useModelStore((s) => s.setTrainingStatus);
  const setTrainingError = useModelStore((s) => s.setTrainingError);
  const setTrainingResults = useModelStore((s) => s.setTrainingResults);

  const domain = domains.find((d) => d.id === selectedDomainId) || domains[0];
  const modelDef = MODEL_DEFINITIONS.find((m) => m.id === selectedModel);
  const currentParams = modelParams[selectedModel];

  const handleTrain = useCallback(async () => {
    setTrainingStatus('training');
    setTrainingError(null);

    const { data, error } = await trainModel(selectedModel, currentParams);

    if (error) {
      const isNetworkError = error === 'Backend is not reachable.'
        || error.includes('not yet supported by the backend');
      if (isNetworkError) {
        // Fall back to mock results for network errors or unsupported models
        const mock = generateMockResults(selectedModel, currentParams);
        setTrainingResults(mock);
        setTrainingStatus('complete');
      } else {
        // Backend validation error — show it, block progression
        setTrainingError(error);
        setTrainingStatus('idle');
      }
    } else {
      setTrainingResults(data);
      setTrainingStatus('complete');
    }
  }, [selectedModel, currentParams]);

  const debouncedTrain = useMemo(
    () => debounce(handleTrain, 300),
    [handleTrain]
  );

  useEffect(() => {
    return () => debouncedTrain.cancel();
  }, [debouncedTrain]);

  const handleParamChange = useCallback(
    (key, value) => {
      setModelParam(selectedModel, key, value);
      if (autoRetrain) {
        debouncedTrain();
      }
    },
    [selectedModel, autoRetrain, debouncedTrain]
  );

  // Gate: pipeline must be complete
  if (pipelineStatus !== 'complete') {
    return (
      <div className={styles.blocked}>
        <div className={styles.blockedCard}>
          <span className={styles.blockedIcon}>🔒</span>
          <h2>Step 4 is locked</h2>
          <p>
            Complete the Data Preparation pipeline in Step 3 before selecting
            and training a model.
          </p>
          <button className={styles.goBackBtn} onClick={() => setStep(3)}>
            &larr; Go Back to Step 3
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <div>
          <h2 className={styles.title}>Model &amp; Parameters</h2>
          <p className={styles.subtitle}>
            Select a classifier and tune hyperparameters for {domain.name}
          </p>
        </div>
        <StatusBadge status={trainingStatus === 'training' ? 'running' : trainingStatus} />
      </div>

      <RetrainingBanner isTraining={trainingStatus === 'training'} />

      <div className={styles.layout}>
        <div className={styles.leftPanel}>
          <ModelTabBar
            selectedModel={selectedModel}
            onSelect={setSelectedModel}
          />

          <ModelParameterPanel
            modelId={selectedModel}
            values={currentParams}
            onChange={handleParamChange}
            disabled={trainingStatus === 'training'}
          />

          <div className={styles.controls}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={autoRetrain}
                onChange={(e) => setAutoRetrain(e.target.checked)}
                className={styles.toggleInput}
              />
              <span className={styles.toggleText}>Auto-retrain on change</span>
            </label>

            <button
              className={styles.trainBtn}
              onClick={handleTrain}
              disabled={trainingStatus === 'training'}
            >
              {trainingStatus === 'complete' ? 'Retrain Model' : 'Train Model'}
            </button>
          </div>

          {trainingError && (
            <p className={styles.errorMsg}>{trainingError}</p>
          )}
        </div>

        <div className={styles.rightPanel}>
          {modelDef && (
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>{modelDef.fullName}</h3>
              <p className={styles.infoDesc}>{modelDef.description}</p>
            </div>
          )}

          {trainingStatus === 'complete' && (
            <div className={styles.summaryCard}>
              <h3 className={styles.infoTitle}>Current Configuration</h3>
              <div className={styles.summaryList}>
                {modelDef?.params.map((p) => (
                  <div key={p.key} className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>{p.label}</span>
                    <span className={styles.summaryValue}>
                      {p.isLog
                        ? Number(Math.pow(10, currentParams[p.key]).toExponential(1))
                        : p.type === 'dropdown'
                          ? p.options.find((o) => o.value === currentParams[p.key])?.label || currentParams[p.key]
                          : currentParams[p.key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

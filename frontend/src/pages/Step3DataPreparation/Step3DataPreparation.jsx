import { useCallback } from 'react';
import useAppStore from '../../stores/useAppStore';
import useDataStore from '../../stores/useDataStore';
import { domains } from '../../data/domains';
import { runDataPreparation } from '../../api';
import { getSessionId } from '../../api/client';
import { runPipeline } from '../../utils/pipelineSimulator';
import PipelineConfig from '../../components/PipelineConfig/PipelineConfig';
import ProgressRing from '../../components/ProgressRing/ProgressRing';
import TerminalLog from '../../components/TerminalLog/TerminalLog';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import styles from './Step3DataPreparation.module.css';

export default function Step3DataPreparation() {
  const selectedDomainId = useAppStore((s) => s.selectedDomainId);
  const setStep = useAppStore((s) => s.setStep);
  const mapperSaved = useDataStore((s) => s.mapperSaved);
  const csvData = useDataStore((s) => s.csvData);
  const pipelineConfig = useDataStore((s) => s.pipelineConfig);
  const pipelineStatus = useDataStore((s) => s.pipelineStatus);
  const pipelineProgress = useDataStore((s) => s.pipelineProgress);
  const pipelineLogs = useDataStore((s) => s.pipelineLogs);
  const pipelineDuration = useDataStore((s) => s.pipelineDuration);
  const setPipelineStatus = useDataStore((s) => s.setPipelineStatus);
  const setPipelineProgress = useDataStore((s) => s.setPipelineProgress);
  const addPipelineLog = useDataStore((s) => s.addPipelineLog);
  const setPipelineDuration = useDataStore((s) => s.setPipelineDuration);
  const resetPipeline = useDataStore((s) => s.resetPipeline);
  const setPrepResult = useDataStore((s) => s.setPrepResult);
  const prepResult = useDataStore((s) => s.prepResult);

  const domain = domains.find((d) => d.id === selectedDomainId) || domains[0];

  const handleApply = useCallback(async () => {
    if (!csvData) return;
    resetPipeline();
    setPipelineStatus('running');
    const start = performance.now();

    // Try backend first if session exists
    if (getSessionId()) {
      addPipelineLog('Sending data preparation request to backend...');
      setPipelineProgress(25);

      const { data, error } = await runDataPreparation(pipelineConfig);

      if (error) {
        const isNetworkError = error === 'Backend is not reachable.';
        if (isNetworkError) {
          addPipelineLog('Backend unavailable. Falling back to local simulation...');
          await runPipeline(
            pipelineConfig,
            csvData,
            (progress) => setPipelineProgress(progress),
            (log) => addPipelineLog(log)
          );
        } else {
          // Backend validation error — show it, block progression
          addPipelineLog(`Error: ${error}`);
          setPipelineProgress(0);
          const elapsed = ((performance.now() - start) / 1000).toFixed(1);
          setPipelineDuration(elapsed);
          setPipelineStatus('idle');
          return;
        }
      } else {
        setPipelineProgress(50);
        addPipelineLog(`Missing values handled: ${data.missing_handled} cells`);
        setPipelineProgress(65);
        addPipelineLog(`Normalisation applied: ${data.normalisation_applied}`);
        addPipelineLog(`SMOTE applied: ${data.smote_applied ? 'Yes' : 'No'}`);
        setPipelineProgress(80);
        addPipelineLog(`Training rows: ${data.train_rows}, Test rows: ${data.test_rows}`);
        addPipelineLog(`Features used: ${data.features_used.length}`);
        setPipelineProgress(100);
        addPipelineLog(data.message);
        setPrepResult(data);
      }
    } else {
      // No backend session — use local simulator
      await runPipeline(
        pipelineConfig,
        csvData,
        (progress) => setPipelineProgress(progress),
        (log) => addPipelineLog(log)
      );
    }

    const elapsed = ((performance.now() - start) / 1000).toFixed(1);
    setPipelineDuration(elapsed);
    setPipelineStatus('complete');
  }, [csvData, pipelineConfig]);

  if (!mapperSaved) {
    return (
      <div className={styles.blocked}>
        <div className={styles.blockedCard}>
          <span className={styles.blockedIcon}>🔒</span>
          <h2>Step 3 is locked</h2>
          <p>
            Complete the Column Mapper &amp; Validate step in Data Exploration before
            proceeding to Data Preparation.
          </p>
          <button className={styles.goBackBtn} onClick={() => setStep(2)}>
            &larr; Go Back to Step 2
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <div>
          <h2 className={styles.title}>Data Preparation Engine</h2>
          <p className={styles.subtitle}>
            Automated cleaning, imputing, and scaling pipeline for{' '}
            {domain.name} datasets
          </p>
        </div>
        <StatusBadge status={pipelineStatus} />
      </div>

      <div className={styles.layout}>
        <div className={styles.leftPanel}>
          <ProgressRing
            progress={pipelineProgress}
            status={pipelineStatus}
            duration={pipelineDuration}
          />
          <PipelineConfig onApply={handleApply} />
        </div>

        <div className={styles.rightPanel}>
          <TerminalLog logs={pipelineLogs} />
        </div>
      </div>

      {pipelineStatus === 'complete' && (
        <p className={styles.completeInfo}>
          <span className={styles.infoIcon}>ℹ</span>
          Data Preparation Engine completed processing{' '}
          {prepResult
            ? (prepResult.train_rows + prepResult.test_rows).toLocaleString()
            : csvData?.length?.toLocaleString() || 0}{' '}
          records
          {prepResult && (
            <> ({prepResult.train_rows.toLocaleString()} train / {prepResult.test_rows.toLocaleString()} test)</>
          )}
          . Final validation passed.
        </p>
      )}
    </div>
  );
}

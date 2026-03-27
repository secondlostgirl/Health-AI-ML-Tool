import useAppStore from '../../stores/useAppStore';
import useDataStore from '../../stores/useDataStore';
import useModelStore from '../../stores/useModelStore';
import styles from './Footer.module.css';

const stepLabels = {
  1: 'Process to step 2: Data Exploration',
  2: 'Proceed to Step 3: Data Preparation',
  3: 'Proceed to Step 4: Model & Parameters',
  4: 'Proceed to Step 5: Results',
  5: 'Proceed to Step 6: Explainability',
};

export default function Footer() {
  const currentStep = useAppStore((s) => s.currentStep);
  const nextStep = useAppStore((s) => s.nextStep);
  const prevStep = useAppStore((s) => s.prevStep);
  const mapperSaved = useDataStore((s) => s.mapperSaved);
  const pipelineStatus = useDataStore((s) => s.pipelineStatus);
  const trainingStatus = useModelStore((s) => s.trainingStatus);

  const isStep2NextBlocked = currentStep === 2 && !mapperSaved;
  const isStep3NextBlocked = currentStep === 3 && pipelineStatus !== 'complete';
  const isStep4NextBlocked = currentStep === 4 && trainingStatus !== 'complete';
  const isStep5NextBlocked = currentStep === 5;
  const isNextDisabled =
    isStep2NextBlocked ||
    isStep3NextBlocked ||
    isStep4NextBlocked ||
    isStep5NextBlocked ||
    currentStep > 5;

  const label = stepLabels[currentStep] || `Proceed to Step ${currentStep + 1}`;

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {currentStep > 1 && (
          <button className={styles.backBtn} onClick={prevStep}>
            &larr; Back
          </button>
        )}
        <div className={styles.spacer} />
        <div className={styles.nextWrapper}>
          {isStep2NextBlocked && (
            <span className={styles.tooltip}>
              Save Column Mapper in Step 2 first
            </span>
          )}
          {isStep3NextBlocked && (
            <span className={styles.tooltip}>
              Complete the pipeline before proceeding
            </span>
          )}
          {isStep4NextBlocked && (
            <span className={styles.tooltip}>
              Train a model before viewing results
            </span>
          )}
          {isStep5NextBlocked && (
            <span className={styles.tooltip}>Coming soon</span>
          )}
          <button
            className={`${styles.nextBtn} ${isNextDisabled ? styles.disabled : ''}`}
            onClick={isNextDisabled ? undefined : nextStep}
            disabled={isNextDisabled}
            aria-label={label}
          >
            {label} &rarr;
          </button>
        </div>
      </div>
    </footer>
  );
}

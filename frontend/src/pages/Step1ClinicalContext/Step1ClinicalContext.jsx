import { domains } from '../../data/domains';
import useAppStore from '../../stores/useAppStore';
import MLJourneyTable from '../../components/MLJourneyTable/MLJourneyTable';
import styles from './Step1ClinicalContext.module.css';

export default function Step1ClinicalContext() {
  const selectedDomainId = useAppStore((s) => s.selectedDomainId);
  const domain = domains.find((d) => d.id === selectedDomainId) || domains[0];

  return (
    <div className={styles.layout}>
      <div className={styles.leftPanel}>
        <div className={styles.scenarioCard}>
          <div className={styles.scenarioHeader}>
            <span className={styles.scenarioIcon}>🩺</span>
            <div>
              <h2 className={styles.scenarioTitle}>Clinical Scenario</h2>
              <span className={styles.focusLabel}>{domain.focusLabel}</span>
            </div>
          </div>

          <blockquote className={styles.problemBlock}>
            &ldquo;PROBLEM: {domain.scenario}&rdquo;
          </blockquote>

          <div className={styles.tipCard}>
            <div className={styles.tipHeader}>
              <span className={styles.tipDot}>●</span>
              <span className={styles.tipLabel}>EDUCATIONAL TIP</span>
            </div>
            <p className={styles.tipText}>{domain.tip}</p>
          </div>

          <div className={styles.disclaimer}>
            <span className={styles.disclaimerIcon}>☑</span>
            <p>
              <strong>Remember:</strong> {domain.disclaimer}
            </p>
          </div>

          <div className={styles.imagePlaceholder}>
            <div className={styles.imageInner}>
              <span className={styles.imageIcon}>📊</span>
              <span className={styles.imageAlt}>{domain.imageAlt}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <MLJourneyTable currentStep={1} />
      </div>
    </div>
  );
}

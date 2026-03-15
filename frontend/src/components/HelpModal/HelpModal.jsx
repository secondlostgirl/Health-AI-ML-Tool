import useAppStore from '../../stores/useAppStore';
import styles from './HelpModal.module.css';

export default function HelpModal() {
  const toggleHelp = useAppStore((s) => s.toggleHelp);

  return (
    <div className={styles.overlay} onClick={toggleHelp}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>How to Use HEALTH-AI</h2>
          <button className={styles.closeBtn} onClick={toggleHelp} aria-label="Close help">
            &times;
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3>Step 1: Clinical Context</h3>
            <p>Select a healthcare domain to explore. Each domain presents a unique clinical scenario where machine learning can assist in decision-making.</p>
          </div>
          <div className={styles.section}>
            <h3>Step 2: Data Exploration</h3>
            <p>Load the default dataset or upload your own CSV file. Explore the data structure, check for missing values, and map your columns to the expected format.</p>
          </div>
          <div className={styles.section}>
            <h3>Step 3: Data Preparation</h3>
            <p>Configure the data preprocessing pipeline: choose imputation methods, scaling techniques, and train/test split ratio. The pipeline will clean and prepare your data for model training.</p>
          </div>
          <div className={styles.section}>
            <h3>Steps 4-7</h3>
            <p>Coming soon: Model selection, results analysis, explainability reports, and ethics &amp; bias evaluation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

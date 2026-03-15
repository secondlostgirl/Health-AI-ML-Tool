import useAppStore from '../../stores/useAppStore';
import useDataStore from '../../stores/useDataStore';
import styles from './Header.module.css';

export default function Header() {
  const toggleHelp = useAppStore((s) => s.toggleHelp);
  const resetApp = useAppStore((s) => s.reset);
  const resetData = useDataStore((s) => s.resetAll);

  const handleReset = () => {
    resetApp();
    resetData();
  };

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>+</span>
        </div>
        <div className={styles.title}>
          <span className={styles.titleMain}>HEALTH-AI</span>
          <span className={styles.titleSub}>ML Learning Tool</span>
        </div>
      </div>
      <div className={styles.actions}>
        <button
          className={styles.helpBtn}
          onClick={toggleHelp}
          aria-label="Open help"
        >
          Help
        </button>
        <button
          className={styles.resetBtn}
          onClick={handleReset}
          aria-label="Reset application"
        >
          Reset
        </button>
      </div>
    </header>
  );
}

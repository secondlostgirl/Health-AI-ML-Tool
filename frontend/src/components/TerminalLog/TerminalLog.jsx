import { useRef, useEffect } from 'react';
import styles from './TerminalLog.module.css';

export default function TerminalLog({ logs }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleBar}>
        <span className={styles.dot} style={{ background: '#ff5f57' }} />
        <span className={styles.dot} style={{ background: '#febc2e' }} />
        <span className={styles.dot} style={{ background: '#28c840' }} />
      </div>
      <div className={styles.content} ref={scrollRef}>
        {logs.length === 0 && (
          <p className={styles.placeholder}>
            Configure the pipeline and click Apply to begin processing...
          </p>
        )}
        {logs.map((log, i) => (
          <div key={i} className={styles.logLine}>
            <span className={styles.done}>✓ [DONE]</span>
            <span className={styles.logText}>{log}</span>
          </div>
        ))}
      </div>
      <div className={styles.footer}>
        <span className={styles.footerIcon}>💻</span>
        <span className={styles.footerText}>
          BACKEND: PYTHON/FASTAPI · SCIKIT-LEARN &amp; PANDAS
        </span>
        <span
          className={`${styles.statusDot} ${
            logs.length > 0 ? styles.active : ''
          }`}
        />
      </div>
    </div>
  );
}

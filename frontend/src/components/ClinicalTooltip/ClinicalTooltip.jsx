import { useState } from 'react';
import styles from './ClinicalTooltip.module.css';

export default function ClinicalTooltip({ text, id }) {
  const [visible, setVisible] = useState(false);

  return (
    <span className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        aria-describedby={visible ? id : undefined}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        i
      </button>
      {visible && (
        <span id={id} role="tooltip" className={styles.tooltip}>
          {text}
        </span>
      )}
    </span>
  );
}

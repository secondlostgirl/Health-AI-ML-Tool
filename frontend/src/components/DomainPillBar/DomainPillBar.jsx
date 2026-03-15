import { domains } from '../../data/domains';
import useAppStore from '../../stores/useAppStore';
import useDataStore from '../../stores/useDataStore';
import styles from './DomainPillBar.module.css';

export default function DomainPillBar() {
  const selectedDomainId = useAppStore((s) => s.selectedDomainId);
  const setDomain = useAppStore((s) => s.setDomain);
  const resetData = useDataStore((s) => s.resetAll);

  const handleSelect = (id) => {
    if (id !== selectedDomainId) {
      setDomain(id);
      resetData();
    }
  };

  return (
    <div className={styles.wrapper} role="tablist" aria-label="Healthcare domains">
      <div className={styles.scrollContainer}>
        {domains.map((domain) => (
          <button
            key={domain.id}
            role="tab"
            aria-selected={selectedDomainId === domain.id}
            className={`${styles.pill} ${selectedDomainId === domain.id ? styles.active : ''}`}
            onClick={() => handleSelect(domain.id)}
          >
            {domain.name}
          </button>
        ))}
      </div>
    </div>
  );
}

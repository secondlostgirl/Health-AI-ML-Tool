import { MODEL_DEFINITIONS } from '../../data/modelDefinitions';
import styles from './ModelTabBar.module.css';

export default function ModelTabBar({ selectedModel, onSelect }) {
  return (
    <div className={styles.tabBar} role="tablist" aria-label="Select ML model">
      {MODEL_DEFINITIONS.map((model) => {
        const isActive = model.id === selectedModel;
        return (
          <button
            key={model.id}
            role="tab"
            aria-selected={isActive}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={() => onSelect(model.id)}
          >
            {model.name}
          </button>
        );
      })}
    </div>
  );
}

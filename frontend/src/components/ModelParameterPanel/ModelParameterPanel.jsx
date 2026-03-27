import { MODEL_DEFINITIONS } from '../../data/modelDefinitions';
import ParameterSlider from '../ParameterSlider/ParameterSlider';
import ParameterDropdown from '../ParameterDropdown/ParameterDropdown';
import styles from './ModelParameterPanel.module.css';

export default function ModelParameterPanel({
  modelId,
  values,
  onChange,
  disabled,
}) {
  const model = MODEL_DEFINITIONS.find((m) => m.id === modelId);
  if (!model) return null;

  return (
    <div className={styles.panel}>
      <h3 className={styles.heading}>{model.fullName} Parameters</h3>
      <div className={styles.params}>
        {model.params.map((param) => {
          if (param.type === 'slider') {
            return (
              <ParameterSlider
                key={param.key}
                id={`${modelId}-${param.key}`}
                label={param.label}
                min={param.min}
                max={param.max}
                step={param.step}
                value={values[param.key]}
                onChange={(val) => onChange(param.key, val)}
                disabled={disabled}
                clinicalTooltip={param.clinicalTooltip}
                isLog={param.isLog}
              />
            );
          }
          return (
            <ParameterDropdown
              key={param.key}
              id={`${modelId}-${param.key}`}
              label={param.label}
              options={param.options}
              value={values[param.key]}
              onChange={(val) => onChange(param.key, val)}
              disabled={disabled}
              clinicalTooltip={param.clinicalTooltip}
            />
          );
        })}
      </div>
    </div>
  );
}

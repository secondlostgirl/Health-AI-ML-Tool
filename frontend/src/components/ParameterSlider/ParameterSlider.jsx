import ClinicalTooltip from '../ClinicalTooltip/ClinicalTooltip';
import styles from './ParameterSlider.module.css';

export default function ParameterSlider({
  id,
  label,
  min,
  max,
  step,
  value,
  onChange,
  disabled,
  clinicalTooltip,
  isLog,
}) {
  const displayValue = isLog ? `${Math.pow(10, value).toExponential(1)}` : value;

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <span className={styles.value}>{displayValue}</span>
        {clinicalTooltip && (
          <ClinicalTooltip text={clinicalTooltip} id={`tip-${id}`} />
        )}
      </div>
      <input
        id={id}
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
      />
      <div className={styles.range}>
        <span>{isLog ? Math.pow(10, min).toExponential(0) : min}</span>
        <span>{isLog ? Math.pow(10, max).toExponential(0) : max}</span>
      </div>
    </div>
  );
}

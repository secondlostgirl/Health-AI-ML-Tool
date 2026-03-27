import ClinicalTooltip from '../ClinicalTooltip/ClinicalTooltip';
import styles from './ParameterDropdown.module.css';

export default function ParameterDropdown({
  id,
  label,
  options,
  value,
  onChange,
  disabled,
  clinicalTooltip,
}) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {clinicalTooltip && (
          <ClinicalTooltip text={clinicalTooltip} id={`tip-${id}`} />
        )}
      </div>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

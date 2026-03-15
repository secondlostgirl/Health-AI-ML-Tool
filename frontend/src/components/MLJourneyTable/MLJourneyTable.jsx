import { mlJourney } from '../../data/mlJourneyTable';
import styles from './MLJourneyTable.module.css';

export default function MLJourneyTable({ currentStep }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>ML Learning Journey</h2>
        <span className={styles.badge}>7 MODULES</span>
      </div>
      <table className={styles.table} role="table">
        <thead>
          <tr>
            <th scope="col">Step</th>
            <th scope="col">What You Do</th>
            <th scope="col">Plain English Meaning</th>
          </tr>
        </thead>
        <tbody>
          {mlJourney.map((row) => (
            <tr
              key={row.step}
              className={row.step === currentStep ? styles.activeRow : ''}
            >
              <td className={styles.stepCell}>
                <span className={styles.stepNumber}>{row.step}. {row.name}</span>
              </td>
              <td className={styles.whatCell}>{row.whatYouDo}</td>
              <td className={styles.meaningCell}>{row.plainEnglish}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.footnote}>
        * Modules are unlocked sequentially. Complete the current task to move forward.
      </p>
    </div>
  );
}

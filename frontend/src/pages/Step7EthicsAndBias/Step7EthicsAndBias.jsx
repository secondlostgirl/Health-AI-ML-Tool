import { useState, useEffect, useCallback } from 'react';
import useAppStore from '../../stores/useAppStore';
import useModelStore from '../../stores/useModelStore';
import { getBiasAnalysis, getPopulationComparison, generateCertificate } from '../../api/step7Api';
import styles from './Step7EthicsAndBias.module.css';

// ── EU AI Act Checklist items ─────────────────────────────────────────────────
const CHECKLIST_ITEMS = [
  'Clinical purpose is clearly defined',
  'Training data sources are documented',
  'A human clinician reviews all predictions',
  'Model accuracy is regularly audited',
  'Demographic fairness has been assessed',
  'Model limitations are communicated to end users',
  'A data governance policy is in place',
  'Model performance is monitored post-deployment',
];

// ── AI Failure Case Studies ───────────────────────────────────────────────────
const CASE_STUDIES = [
  {
    type: 'failure',
    title: 'IBM Watson for Oncology',
    year: 2018,
    summary:
      'Watson recommended unsafe and incorrect cancer treatment plans at multiple hospitals. Internal training used synthetic cases created by a small group of physicians rather than real patient data, producing recommendations that conflicted with standard oncology guidelines.',
    lesson: 'Synthetic training data without real-world validation creates dangerous blind spots in clinical AI systems.',
  },
  {
    type: 'nearmiss',
    title: 'Sepsis Prediction Near-Miss',
    year: 2020,
    summary:
      'A commercial sepsis alert algorithm deployed across US hospitals showed significantly lower sensitivity for Black patients than for white patients (26% vs 41% detection rate), caused by a proxy outcome that embedded existing care disparities into the training signal.',
    lesson: 'Proxy outcome variables can silently encode systemic disparities. Always stratify validation by demographic group.',
  },
  {
    type: 'prevention',
    title: 'FDA-Cleared Diabetic Retinopathy AI',
    year: 2018,
    summary:
      "IDx-DR became the FDA's first autonomous AI diagnostic device. The team prospectively validated the model across 10 primary care sites with diverse populations, and built in a mandatory human escalation pathway for all ungradeable images — preventing potential missed diagnoses.",
    lesson: 'Prospective multi-site validation, demographic audits, and mandatory human escalation turn AI into a safe clinical tool.',
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function BiasBanner({ biasDetected }) {
  if (!biasDetected) return null;
  return (
    <div className={styles.biasBanner}>
      <span className={styles.biasBannerIcon}>⚠</span>
      <div>
        <strong>Bias Detected:</strong> One or more demographic subgroups show a sensitivity
        more than 10 percentage points below the overall model sensitivity. Review the
        subgroup table below and consider retraining with a more balanced dataset.
      </div>
    </div>
  );
}

function SubgroupTable({ overallSensitivity, subgroups }) {
  if (!subgroups || subgroups.length === 0) {
    return (
      <p className={styles.emptyNote}>
        No subgroup data available. Run bias analysis above.
      </p>
    );
  }

  const getSensColor = (sensitivity, overall) => {
    const gap = overall - sensitivity;
    if (gap > 0.10) return styles.sensitivityRed;
    if (gap > 0.05) return styles.sensitivityAmber;
    return styles.sensitivityGreen;
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.subgroupTable}>
        <thead>
          <tr>
            <th>Subgroup</th>
            <th>N</th>
            <th>Sensitivity</th>
            <th>Specificity</th>
            <th>Gap vs Overall</th>
            <th>Fairness</th>
          </tr>
        </thead>
        <tbody>
          <tr className={styles.overallRow}>
            <td><strong>Overall</strong></td>
            <td>—</td>
            <td><strong>{(overallSensitivity * 100).toFixed(1)}%</strong></td>
            <td>—</td>
            <td>—</td>
            <td><span className={styles.flagOK}>OK</span></td>
          </tr>
          {subgroups.map((sg) => (
            <tr key={sg.name}>
              <td>{sg.name}</td>
              <td>{sg.n}</td>
              <td className={getSensColor(sg.sensitivity, overallSensitivity)}>
                {(sg.sensitivity * 100).toFixed(1)}%
              </td>
              <td>{(sg.specificity * 100).toFixed(1)}%</td>
              <td className={sg.gap > 0 ? styles.gapNeg : styles.gapPos}>
                {sg.gap > 0 ? `−${(sg.gap * 100).toFixed(1)} pp` : `+${(Math.abs(sg.gap) * 100).toFixed(1)} pp`}
              </td>
              <td>
                {sg.fairness_flag === 'OK' && <span className={styles.flagOK}>OK</span>}
                {sg.fairness_flag === 'Review' && <span className={styles.flagReview}>Review</span>}
                {sg.fairness_flag === '⚠' && <span className={styles.flagWarn}>⚠</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PopulationChart({ categories }) {
  if (!categories || categories.length === 0) return null;
  const hasWarning = categories.some((c) => c.warn);

  return (
    <div>
      {hasWarning && (
        <div className={styles.amberWarning}>
          <strong>⚠ Data Gap Detected:</strong> One or more demographic groups in the training set
          differ by more than 15 percentage points from the real-world reference population.
          The model may underperform for underrepresented groups.
        </div>
      )}
      <div className={styles.popChartList}>
        {categories.map((cat) => (
          <div key={cat.label} className={styles.popChartRow}>
            <span className={`${styles.popCatLabel} ${cat.warn ? styles.warnLabel : ''}`}>
              {cat.label}
              {cat.warn && ' ⚠'}
            </span>
            <div className={styles.popBarsGroup}>
              <div className={styles.popBarRow}>
                <span className={styles.popBarTag}>Training</span>
                <div className={styles.popBarTrack}>
                  <div
                    className={`${styles.popBar} ${styles.popBarTraining} ${cat.warn ? styles.popBarWarn : ''}`}
                    style={{ width: `${Math.min(100, cat.training_pct)}%` }}
                  />
                </div>
                <span className={styles.popBarVal}>{cat.training_pct}%</span>
              </div>
              <div className={styles.popBarRow}>
                <span className={styles.popBarTag}>Population</span>
                <div className={styles.popBarTrack}>
                  <div
                    className={`${styles.popBar} ${styles.popBarReference}`}
                    style={{ width: `${Math.min(100, cat.population_pct)}%` }}
                  />
                </div>
                <span className={styles.popBarVal}>{cat.population_pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Checklist({ checked, onToggle }) {
  const total = CHECKLIST_ITEMS.length;
  const done = checked.filter(Boolean).length;
  const pct = Math.round((done / total) * 100);

  return (
    <div>
      <div className={styles.checklistProgress}>
        <span className={styles.checklistProgressLabel}>{done}/{total} complete</span>
        <div className={styles.progressTrack}>
          <div className={styles.progressBar} style={{ width: `${pct}%` }} />
        </div>
        <span className={styles.checklistProgressPct}>{pct}%</span>
      </div>
      <div className={styles.checklistItems}>
        {CHECKLIST_ITEMS.map((item, i) => (
          <label key={i} className={styles.checklistItem} onClick={() => onToggle(i)}>
            <span className={`${styles.checkbox} ${checked[i] ? styles.checkboxChecked : ''}`}>
              {checked[i] ? '✓' : ''}
            </span>
            <span className={`${styles.checklistText} ${checked[i] ? styles.checklistTextChecked : ''}`}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CaseStudyCard({ study }) {
  const typeStyles = {
    failure: styles.cardFailure,
    nearmiss: styles.cardNearMiss,
    prevention: styles.cardPrevention,
  };
  const typeLabels = {
    failure: { label: 'Failure Case', color: styles.tagFailure },
    nearmiss: { label: 'Near-Miss', color: styles.tagNearMiss },
    prevention: { label: 'Prevention Success', color: styles.tagPrevention },
  };

  return (
    <div className={`${styles.caseCard} ${typeStyles[study.type]}`}>
      <div className={styles.caseHeader}>
        <span className={`${styles.caseTag} ${typeLabels[study.type].color}`}>
          {typeLabels[study.type].label}
        </span>
        <span className={styles.caseYear}>{study.year}</span>
      </div>
      <h4 className={styles.caseTitle}>{study.title}</h4>
      <p className={styles.caseSummary}>{study.summary}</p>
      <div className={styles.caseLessonBox}>
        <strong className={styles.caseLessonLabel}>Key Lesson:</strong>
        <p className={styles.caseLesson}>{study.lesson}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Step7EthicsAndBias() {
  const selectedDomainId = useAppStore((s) => s.selectedDomainId);
  const trainingStatus = useModelStore((s) => s.trainingStatus);
  const trainingResults = useModelStore((s) => s.trainingResults);

  const [biasData, setBiasData] = useState(null);
  const [biasLoading, setBiasLoading] = useState(false);
  const [biasError, setBiasError] = useState(null);

  const [popData, setPopData] = useState(null);
  const [popLoading, setPopLoading] = useState(false);

  const [checklist, setChecklist] = useState([
    true, true, false, false, false, false, false, false,
  ]);

  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState(null);

  // All hooks must be declared before any conditional return (React rules of hooks).
  const isTrained = trainingStatus === 'complete' && !!trainingResults;

  const loadBias = useCallback(async () => {
    setBiasLoading(true);
    setBiasError(null);
    const { data, error } = await getBiasAnalysis();
    setBiasLoading(false);
    if (error) setBiasError(error);
    else setBiasData(data);
  }, []);

  const loadPop = useCallback(async () => {
    setPopLoading(true);
    const { data } = await getPopulationComparison();
    setPopLoading(false);
    if (data) setPopData(data);
  }, []);

  useEffect(() => {
    if (isTrained) {
      loadBias();
      loadPop();
    }
  }, [isTrained]);

  // Gate: model must be trained (after all hooks)
  if (!isTrained) {
    return (
      <div className={styles.blocked}>
        <div className={styles.blockedCard}>
          <span className={styles.blockedIcon}>🔒</span>
          <h2>Step 7 is locked</h2>
          <p>Train a model in Step 4 before the Ethics &amp; Bias audit.</p>
        </div>
      </div>
    );
  }

  const handleToggle = (idx) => {
    // First 2 items are pre-checked and remain toggleable
    setChecklist((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const handleDownloadCert = async () => {
    setCertLoading(true);
    setCertError(null);
    const modelName = trainingResults?.model
      ? { knn: 'knn', svm: 'svm', dt: 'decision_tree', rf: 'random_forest', lr: 'logistic_regression', nb: 'naive_bayes' }[trainingResults.model] || trainingResults.model
      : '';
    const { blob, error } = await generateCertificate(checklist, selectedDomainId, modelName);
    setCertLoading(false);
    if (error) {
      setCertError(error);
    } else if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health_ai_certificate_${selectedDomainId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerArea}>
        <div>
          <h2 className={styles.title}>Ethics &amp; Bias</h2>
          <p className={styles.subtitle}>Fairness audit and compliance checklist</p>
        </div>
        <button
          className={styles.certBtn}
          onClick={handleDownloadCert}
          disabled={certLoading || !checklist.every(Boolean)}
          title={!checklist.every(Boolean) ? 'Complete all 8 checklist items to unlock the certificate' : ''}
        >
          {certLoading ? 'Generating…' : `Download Certificate (PDF)${!checklist.every(Boolean) ? ' 🔒' : ''}`}
        </button>
      </div>

      {certError && (
        <div className={styles.errorBanner}>
          <strong>Certificate error:</strong> {certError}
        </div>
      )}

      {/* Bias Detection Banner */}
      {biasData && <BiasBanner biasDetected={biasData.bias_detected} />}

      {/* Subgroup Table */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Subgroup Fairness Analysis</h3>
          <button className={styles.refreshBtn} onClick={loadBias} disabled={biasLoading}>
            {biasLoading ? 'Running…' : '⚖ Run Fairness Check'}
          </button>
        </div>
        <p className={styles.sectionDesc}>
          Sensitivity colour-coded: <span className={styles.greenDot} /> ≤5 pp gap (OK)
          &nbsp; <span className={styles.amberDot} /> 5–10 pp gap (Review)
          &nbsp; <span className={styles.redDot} /> &gt;10 pp gap (⚠ Bias)
        </p>
        {biasLoading && <div className={styles.loading}>Computing subgroup metrics…</div>}
        {biasError && (
          <div className={styles.errorBanner}>
            <strong>Error:</strong> {biasError}
          </div>
        )}
        {biasData && !biasLoading && (
          <SubgroupTable
            overallSensitivity={biasData.overall_sensitivity}
            subgroups={biasData.subgroups}
          />
        )}
      </div>

      {/* Training Data vs Population Chart */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Training Data vs Real Population</h3>
        <p className={styles.sectionDesc}>
          Compares the demographic composition of the training set with published
          real-world reference populations. An amber warning flags gaps &gt;15 percentage
          points that may cause the model to underperform for underrepresented groups.
        </p>
        {popLoading && <div className={styles.loading}>Loading population data…</div>}
        {popData && !popLoading && <PopulationChart categories={popData.categories} />}
      </div>

      {/* EU AI Act Checklist */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>EU AI Act Compliance Checklist</h3>
        <p className={styles.sectionDesc}>
          Eight high-risk AI requirements from the EU AI Act (2024). Items 1 and 2 are
          pre-checked — tick the remaining items as your team completes each requirement
          before clinical deployment.
        </p>
        <Checklist checked={checklist} onToggle={handleToggle} />
      </div>

      {/* AI Failure Case Studies */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>AI Failure Case Studies</h3>
        <p className={styles.sectionDesc}>
          Real-world examples of what happens when clinical AI systems are deployed
          without adequate validation, fairness audits, or human oversight.
        </p>
        <div className={styles.caseStudiesGrid}>
          {CASE_STUDIES.map((study) => (
            <CaseStudyCard key={study.title} study={study} />
          ))}
        </div>
      </div>
    </div>
  );
}

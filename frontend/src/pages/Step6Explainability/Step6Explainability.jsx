import { useState, useEffect, useCallback, useRef } from 'react';
import useAppStore from '../../stores/useAppStore';
import useModelStore from '../../stores/useModelStore';
import { getFeatureImportance, predictPatient, computeWhatIf } from '../../api/step6Api';
import styles from './Step6Explainability.module.css';

// ── Frontend sense-check lookup (instant, no API call needed) ─────────────────
const SENSE_CHECK = {
  'cardiology': 'LVEF (%), NT-proBNP and Troponin Levels are the top predictors here. Low Left Ventricular Ejection Fraction and high NT-proBNP/Troponin are direct biomarkers of cardiac muscle damage and pump failure.',
  'radiology': 'Lesion Size/Volume, Margin Sharpness and Contrast Enhancement Rate lead the model. Irregular margins and rapid contrast enhancement on scans strongly correlate with malignant angiogenesis and tumour aggression.',
  'nephrology': 'Serum Creatinine, eGFR and Proteinuria are the strongest predictors. Declining GFR and protein leakage are the primary, most reliable biochemical markers of acute kidney injury and progression to ESRD.',
  'oncology': 'TNM Stage, Histological Grade and Metastasis Indicator dominate the model. Tumour staging and cellular grade are the most universally validated predictors of survival rates, recurrence risk, and treatment response.',
  'neurology': 'Cognitive Score (MMSE), Brain Atrophy Volume and Amyloid/Tau Biomarkers are the top features. Structural brain changes and specific protein accumulations are the core drivers of neurodegenerative decline and dementia progression.',
  'endocrinology': 'TSH Levels, Free T4 and Cortisol Levels lead the predictions. Severe hormone dysregulation directly impacts systemic metabolic stability, predicting crises like thyroid storms or adrenal insufficiency.',
  'hepatology': 'AST/ALT Ratio, Serum Bilirubin and MELD Score are the strongest predictors. Liver enzyme ratios and bilirubin levels directly quantify hepatocellular injury and the liver\'s remaining detoxifying capacity.',
  'cardiology-stroke': 'AFib History, CHA₂DS₂-VASc Score and Left Atrial Enlargement are the top features. Atrial Fibrillation causes blood pooling in the heart\'s atria, creating cardiogenic clots that travel to the brain, risking ischaemic stroke.',
  'mental-health': 'PHQ-9 (Depression Score), Previous Crisis Episodes and Medication Adherence dominate. Severe symptom severity scores and a history of non-adherence are the strongest predictors of acute psychiatric relapse or crisis.',
  'diabetes': 'HbA1c Levels, Fasting Blood Glucose and Neuropathy Presence are the top predictors. Long-term elevated HbA1c mechanically damages microvasculature, leading directly to irreversible complications like neuropathy and retinopathy.',
  'pulmonology': 'FEV1/FVC Ratio, O₂ Saturation (SpO₂) and Smoking Pack-Years lead the model. Reduced expiratory volume and chronic hypoxia indicate irreversible airway obstruction, strongly predicting COPD exacerbations.',
  'sepsis-icu': 'Serum Lactate, SOFA Score and Procalcitonin are the strongest predictors. Elevated lactate indicates severe tissue hypoperfusion, while a rising SOFA score reflects imminent multi-organ failure.',
  'fetal-health': 'Fetal Heart Rate Baseline, Late Decelerations and Uterine Contraction Rate dominate. Prolonged decelerations in heart rate during contractions indicate fetal oxygen deprivation and acute distress requiring intervention.',
  'dermatology': 'Lesion Asymmetry, Colour Variegation and Border Irregularity are the top features. Morphological asymmetry and uneven pigmentation (the ABCD rule) are the hallmark clinical signs of malignant melanocytes.',
  'stroke': 'NIHSS Score at Admission, Time to Thrombolysis and Infarct Volume lead the model. Initial neurological deficit severity (NIHSS) and the time elapsed before intervention heavily dictate permanent brain damage and recovery.',
  'gastroenterology': 'Fecal Calprotectin, CRP Levels and Haemoglobin Drops are the strongest predictors. Calprotectin is a highly specific marker for intestinal inflammation (IBD), while dropping haemoglobin indicates active gastrointestinal bleeding.',
  'orthopedics': 'Joint Space Narrowing, Bone Mineral Density and Pain Severity Score dominate the model. Mechanical degradation of cartilage and low bone density directly predict joint failure, fracture risk, and the need for arthroplasty.',
  'ophthalmology': 'Intraocular Pressure (IOP), Cup-to-Disc Ratio and Macular Thickness are the top features. Sustained high intraocular pressure and optic nerve cupping are the fundamental mechanical causes of irreversible visual field loss in glaucoma.',
  'hematology': 'Blast Cell Count, Platelet Count and Haemoglobin Levels lead the predictions. The presence of immature blast cells and severe cytopenias (low platelets/Hb) indicate severe bone marrow failure or haematologic malignancy.',
  'infectious-disease': 'Viral/Bacterial Load, WBC Count and CRP/ESR are the strongest predictors. High pathogen loads coupled with extreme immune responses (WBC and inflammatory markers) correlate directly with systemic infectious severity.',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SenseCheckBanner({ text }) {
  if (!text) return null;
  return (
    <div className={styles.senseCheckBanner}>
      <span className={styles.senseCheckIcon}>🩺</span>
      <div>
        <strong className={styles.senseCheckTitle}>Clinical Sense-Check</strong>
        <p className={styles.senseCheckText}>{text}</p>
      </div>
    </div>
  );
}

function CautionBanner() {
  return (
    <div className={styles.cautionBanner}>
      <span className={styles.cautionIcon}>⚠</span>
      <div>
        <strong>Associations, not causes.</strong>
        {' '}These statistical associations identify patterns in training data. They do not
        imply causation and cannot replace clinical judgement. Always verify predictions
        with a qualified clinician before acting on results.
      </div>
    </div>
  );
}

function WhatIfBanner({ whatIfData, topFeatureDisplay }) {
  if (!whatIfData) return null;
  const { original_probability, new_probability, delta, direction, feature_display } = whatIfData;
  const isHigher = direction === 'higher_risk';
  const isLower = direction === 'lower_risk';
  const deltaAbs = Math.abs(delta * 100).toFixed(1);
  const origPct = (original_probability * 100).toFixed(1);
  const newPct = (new_probability * 100).toFixed(1);

  if (direction === 'unchanged') {
    return (
      <div className={styles.whatIfBanner}>
        <span className={styles.whatIfIcon}>💡</span>
        <div>
          <strong>What-If Analysis:</strong> Increasing <em>{feature_display}</em> by one standard
          deviation has no meaningful effect on this patient's predicted probability ({origPct}% → {newPct}%).
        </div>
      </div>
    );
  }

  return (
    <div className={styles.whatIfBanner}>
      <span className={styles.whatIfIcon}>💡</span>
      <div>
        <strong>What-If Analysis:</strong> If <em>{feature_display}</em> increased by one standard
        deviation, the predicted probability would shift from{' '}
        <strong>{origPct}%</strong> to{' '}
        <strong className={isHigher ? styles.riskText : styles.safeText}>{newPct}%</strong>
        {' '}({isHigher ? '+' : ''}{(delta * 100).toFixed(1)} percentage points —{' '}
        {isHigher ? 'higher risk' : 'lower risk'}).
      </div>
    </div>
  );
}

function FeatureImportanceChart({ features }) {
  if (!features || features.length === 0) return null;
  const maxImportance = features[0]?.importance ?? 1;

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.cardTitle}>Feature Importance</h3>
      <p className={styles.cardSubtitle}>
        Relative contribution of each clinical variable to the model's predictions (0.00–1.00).
        Sorted from most to least influential.
      </p>
      <div className={styles.featureList}>
        {features.map((feat, i) => {
          const barPct = maxImportance > 0 ? (feat.importance / maxImportance) * 100 : 0;
          return (
            <div key={feat.feature} className={styles.featureRow}>
              <span className={styles.featureRank}>{i + 1}</span>
              <span className={styles.featureName}>{feat.display_name}</span>
              <div className={styles.featureBarTrack}>
                <div
                  className={styles.featureBar}
                  style={{ width: `${barPct}%` }}
                />
              </div>
              <span className={styles.featureValue}>{feat.importance.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WaterfallChart({ contributions }) {
  if (!contributions || contributions.length === 0) return null;

  const maxAbs = Math.max(...contributions.map((c) => Math.abs(c.contribution))) || 1;

  return (
    <div className={styles.waterfallList}>
      {contributions.map((c) => {
        const isRisk = c.direction === 'risk';
        // Each half is 50% of track. Bar fills up to 100% of its half.
        const halfPct = Math.min(100, (Math.abs(c.contribution) / maxAbs) * 100);
        return (
          <div key={c.feature} className={styles.waterfallRow}>
            <span className={styles.waterfallLabel}>{c.display_name}</span>
            <div className={styles.waterfallBarTrack}>
              {/* Left half — safe (green, right-aligned) */}
              <div className={styles.waterfallHalfLeft}>
                {!isRisk && (
                  <div
                    className={styles.waterfallBarSafe}
                    style={{ width: `${halfPct}%` }}
                  />
                )}
              </div>
              {/* Centre divider */}
              <div className={styles.waterfallDivider} />
              {/* Right half — risk (red, left-aligned) */}
              <div className={styles.waterfallHalfRight}>
                {isRisk && (
                  <div
                    className={styles.waterfallBarRisk}
                    style={{ width: `${halfPct}%` }}
                  />
                )}
              </div>
            </div>
            <span className={`${styles.waterfallDirection} ${isRisk ? styles.riskText : styles.safeText}`}>
              {isRisk ? '↑ Increases risk' : '↓ Decreases risk'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Step6Explainability() {
  const setStep = useAppStore((s) => s.setStep);
  const selectedDomainId = useAppStore((s) => s.selectedDomainId);
  const trainingStatus = useModelStore((s) => s.trainingStatus);
  const trainingResults = useModelStore((s) => s.trainingResults);

  const [importanceData, setImportanceData] = useState(null);
  const [importanceLoading, setImportanceLoading] = useState(false);
  const [importanceError, setImportanceError] = useState(null);

  const [selectedPatient, setSelectedPatient] = useState(0);
  const [patientData, setPatientData] = useState(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState(null);

  const [whatIfData, setWhatIfData] = useState(null);
  const [whatIfLoading, setWhatIfLoading] = useState(false);

  // All hooks must be declared before any conditional return (React rules of hooks).
  const isTrained = trainingStatus === 'complete' && !!trainingResults;
  const retryTimerRef = useRef(null);

  const loadFeatureImportance = useCallback(async () => {
    if (!isTrained) return;
    setImportanceLoading(true);
    setImportanceError(null);
    const { data, error } = await getFeatureImportance(selectedDomainId, 5);
    setImportanceLoading(false);
    if (error) {
      setImportanceError(error);
    } else {
      setImportanceData(data);
    }
  }, [selectedDomainId, isTrained]);

  // Auto-retry when backend is cold-starting (Render free tier)
  useEffect(() => {
    if (importanceError === 'Backend is not reachable.') {
      retryTimerRef.current = setTimeout(() => loadFeatureImportance(), 5000);
    }
    return () => clearTimeout(retryTimerRef.current);
  }, [importanceError, loadFeatureImportance]);

  const loadPatient = useCallback(async (idx) => {
    setPatientLoading(true);
    setPatientError(null);
    setWhatIfData(null);
    const { data, error } = await predictPatient(idx);
    setPatientLoading(false);
    if (error) {
      setPatientError(error);
    } else {
      setPatientData(data);
      if (data?.top_feature) {
        setWhatIfLoading(true);
        const { data: wiData } = await computeWhatIf(idx, data.top_feature, 1.0);
        setWhatIfLoading(false);
        if (wiData) setWhatIfData(wiData);
      }
    }
  }, []);

  useEffect(() => {
    if (isTrained) loadFeatureImportance();
  }, [loadFeatureImportance, isTrained]);

  useEffect(() => {
    if (importanceData) {
      loadPatient(selectedPatient);
    }
  }, [importanceData]);

  const handlePatientChange = (idx) => {
    setSelectedPatient(idx);
    loadPatient(idx);
  };

  const patientLabels = ['Patient A', 'Patient B', 'Patient C'];
  const patients = patientData?.patients ?? [];

  // Gate: model must be trained (after all hooks)
  if (!isTrained) {
    return (
      <div className={styles.blocked}>
        <div className={styles.blockedCard}>
          <span className={styles.blockedIcon}>🔒</span>
          <h2>Step 6 is locked</h2>
          <p>Train a model in Step 4 before exploring explainability.</p>
          <button className={styles.goBackBtn} onClick={() => setStep(4)}>
            &larr; Go Back to Step 4
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerArea}>
        <div>
          <h2 className={styles.title}>Explainability</h2>
          <p className={styles.subtitle}>Why did the model make this prediction?</p>
        </div>
      </div>

      {/* Clinical Sense-Check Banner — reads from frontend lookup, instant on domain change */}
      <SenseCheckBanner text={SENSE_CHECK[selectedDomainId] || ''} />

      {/* Feature Importance Chart */}
      {importanceLoading && (
        <div className={styles.loading}>Computing feature importance…</div>
      )}
      {importanceError && (
        <div className={styles.errorBanner}>
          {importanceError === 'Backend is not reachable.'
            ? '⏳ Backend is starting up — retrying automatically in 5 seconds…'
            : <><strong>Error:</strong> {importanceError}</>}
          <button className={styles.retryBtn} onClick={loadFeatureImportance}>Retry now</button>
        </div>
      )}
      {importanceData && !importanceLoading && (
        <FeatureImportanceChart features={importanceData.features} />
      )}

      {/* Amber Caution Banner */}
      <CautionBanner />

      {/* Patient Selector + Waterfall */}
      <div className={styles.chartCard}>
        <h3 className={styles.cardTitle}>Patient-Level Explanation</h3>
        <p className={styles.cardSubtitle}>
          Select a representative test patient to see which features drove their prediction.
          Red bars increase risk; green bars decrease it.
        </p>

        {/* Selector */}
        <div className={styles.patientSelectorRow}>
          <label className={styles.selectorLabel}>Select patient:</label>
          <div className={styles.patientBtns}>
            {patientLabels.map((label, idx) => {
              const p = patients[idx];
              return (
                <button
                  key={idx}
                  className={`${styles.patientBtn} ${selectedPatient === idx ? styles.patientBtnActive : ''}`}
                  onClick={() => handlePatientChange(idx)}
                  disabled={patientLoading}
                >
                  <span className={styles.patientBtnLabel}>{label}</span>
                  {p && (
                    <span className={styles.patientBtnInfo}>
                      {p.prediction} ({(p.probability * 100).toFixed(0)}%)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Patient prediction summary */}
        {patientLoading && <div className={styles.loading}>Loading patient data…</div>}
        {patientError && (
          <div className={styles.errorBanner}>
            <strong>Error:</strong> {patientError}
          </div>
        )}

        {patientData && !patientLoading && (
          <>
            <div className={styles.predictionSummary}>
              <div className={styles.predictionBox}>
                <span className={styles.predLabel}>Prediction</span>
                <span className={styles.predValue}>{patientData.prediction}</span>
              </div>
              <div className={styles.predictionBox}>
                <span className={styles.predLabel}>Confidence</span>
                <span className={styles.predValue}>
                  {(patientData.probability * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <WaterfallChart contributions={patientData.contributions} />
          </>
        )}
      </div>

      {/* What-If Banner */}
      {whatIfLoading && <div className={styles.loading}>Computing what-if analysis…</div>}
      {whatIfData && <WhatIfBanner whatIfData={whatIfData} />}
    </div>
  );
}

function generateRows(columns, targetCol, targetValues, targetDistribution, count) {
  const rows = [];
  for (let i = 0; i < count; i++) {
    const row = {};
    for (const col of columns) {
      if (col.name === targetCol) {
        const rand = Math.random();
        let cumulative = 0;
        for (let t = 0; t < targetValues.length; t++) {
          cumulative += targetDistribution[t];
          if (rand <= cumulative) {
            row[col.name] = targetValues[t];
            break;
          }
        }
      } else if (col.type === 'numerical') {
        const base = col.min + Math.random() * (col.max - col.min);
        row[col.name] = Math.round(base * 10) / 10;
        if (col.missingRate && Math.random() < col.missingRate) {
          row[col.name] = null;
        }
      } else {
        const vals = col.values;
        row[col.name] = vals[Math.floor(Math.random() * vals.length)];
      }
    }
    rows.push(row);
  }
  return rows;
}

const cardiologyColumns = [
  { name: 'Age', type: 'numerical', min: 30, max: 90 },
  { name: 'Sex', type: 'categorical', values: ['Male', 'Female'] },
  { name: 'Ejection_Fraction', type: 'numerical', min: 15, max: 70 },
  { name: 'Serum_Creatinine', type: 'numerical', min: 0.5, max: 9.4, missingRate: 0.068 },
  { name: 'Serum_Sodium', type: 'numerical', min: 113, max: 148 },
  { name: 'BMI', type: 'numerical', min: 18.5, max: 42, missingRate: 0.021 },
  { name: 'Blood_Pressure', type: 'numerical', min: 90, max: 200 },
  { name: 'Cholesterol', type: 'numerical', min: 120, max: 350 },
  { name: 'Smoking', type: 'categorical', values: ['Yes', 'No'] },
  { name: 'Diabetes', type: 'categorical', values: ['Yes', 'No'] },
  { name: 'Anaemia', type: 'categorical', values: ['Yes', 'No'] },
  { name: 'Readmitted', type: 'target' },
];

const domainConfigs = {
  cardiology: {
    columns: cardiologyColumns,
    target: 'Readmitted',
    targetValues: ['Yes', 'No'],
    targetDistribution: [0.33, 0.67],
    count: 304,
    targetLabel: 'Readmitted within 30 days',
  },
  radiology: {
    columns: [
      { name: 'Patient_Age', type: 'numerical', min: 1, max: 95 },
      { name: 'Sex', type: 'categorical', values: ['Male', 'Female'] },
      { name: 'Image_Quality_Score', type: 'numerical', min: 1, max: 10 },
      { name: 'Lung_Opacity', type: 'numerical', min: 0, max: 1 },
      { name: 'Heart_Size_Ratio', type: 'numerical', min: 0.3, max: 0.7, missingRate: 0.04 },
      { name: 'Pleural_Effusion', type: 'categorical', values: ['Yes', 'No'] },
      { name: 'Nodule_Count', type: 'numerical', min: 0, max: 5 },
      { name: 'Abnormal', type: 'target' },
    ],
    target: 'Abnormal',
    targetValues: ['Yes', 'No'],
    targetDistribution: [0.4, 0.6],
    count: 280,
    targetLabel: 'Abnormal finding detected',
  },
  nephrology: {
    columns: [
      { name: 'Age', type: 'numerical', min: 18, max: 90 },
      { name: 'Sex', type: 'categorical', values: ['Male', 'Female'] },
      { name: 'eGFR', type: 'numerical', min: 5, max: 120 },
      { name: 'Creatinine', type: 'numerical', min: 0.5, max: 12, missingRate: 0.05 },
      { name: 'BUN', type: 'numerical', min: 5, max: 80 },
      { name: 'Proteinuria', type: 'numerical', min: 0, max: 5 },
      { name: 'Blood_Pressure', type: 'numerical', min: 90, max: 200 },
      { name: 'Diabetes', type: 'categorical', values: ['Yes', 'No'] },
      { name: 'CKD_Progression', type: 'target' },
    ],
    target: 'CKD_Progression',
    targetValues: ['Yes', 'No'],
    targetDistribution: [0.35, 0.65],
    count: 250,
    targetLabel: 'CKD progressed to end-stage',
  },
  oncology: {
    columns: [
      { name: 'Radius_Mean', type: 'numerical', min: 6, max: 28 },
      { name: 'Texture_Mean', type: 'numerical', min: 9, max: 40 },
      { name: 'Perimeter_Mean', type: 'numerical', min: 40, max: 190 },
      { name: 'Area_Mean', type: 'numerical', min: 140, max: 2500 },
      { name: 'Smoothness_Mean', type: 'numerical', min: 0.05, max: 0.16 },
      { name: 'Compactness_Mean', type: 'numerical', min: 0.02, max: 0.35, missingRate: 0.03 },
      { name: 'Symmetry_Mean', type: 'numerical', min: 0.1, max: 0.3 },
      { name: 'Diagnosis', type: 'target' },
    ],
    target: 'Diagnosis',
    targetValues: ['Malignant', 'Benign'],
    targetDistribution: [0.37, 0.63],
    count: 569,
    targetLabel: 'Tumour diagnosis',
  },
  neurology: {
    columns: [
      { name: 'Age', type: 'numerical', min: 5, max: 85 },
      { name: 'Sex', type: 'categorical', values: ['Male', 'Female'] },
      { name: 'Delta_Power', type: 'numerical', min: 0, max: 100 },
      { name: 'Theta_Power', type: 'numerical', min: 0, max: 80 },
      { name: 'Alpha_Power', type: 'numerical', min: 0, max: 60 },
      { name: 'Beta_Power', type: 'numerical', min: 0, max: 50, missingRate: 0.02 },
      { name: 'Signal_Entropy', type: 'numerical', min: 0, max: 2 },
      { name: 'Seizure', type: 'target' },
    ],
    target: 'Seizure',
    targetValues: ['Yes', 'No'],
    targetDistribution: [0.2, 0.8],
    count: 500,
    targetLabel: 'Seizure detected',
  },
  endocrinology: {
    columns: [
      { name: 'Age', type: 'numerical', min: 18, max: 80 },
      { name: 'Sex', type: 'categorical', values: ['Male', 'Female'] },
      { name: 'TSH', type: 'numerical', min: 0.01, max: 20 },
      { name: 'T3', type: 'numerical', min: 0.5, max: 5, missingRate: 0.04 },
      { name: 'T4', type: 'numerical', min: 2, max: 15 },
      { name: 'Goitre', type: 'categorical', values: ['Yes', 'No'] },
      { name: 'Thyroid_Class', type: 'target' },
    ],
    target: 'Thyroid_Class',
    targetValues: ['Hypothyroid', 'Hyperthyroid', 'Euthyroid'],
    targetDistribution: [0.3, 0.2, 0.5],
    count: 300,
    targetLabel: 'Thyroid classification',
  },
  hepatology: {
    columns: [
      { name: 'Age', type: 'numerical', min: 18, max: 85 },
      { name: 'Sex', type: 'categorical', values: ['Male', 'Female'] },
      { name: 'ALT', type: 'numerical', min: 5, max: 300 },
      { name: 'AST', type: 'numerical', min: 5, max: 250, missingRate: 0.03 },
      { name: 'Bilirubin', type: 'numerical', min: 0.1, max: 8 },
      { name: 'Albumin', type: 'numerical', min: 1.5, max: 5.5 },
      { name: 'Alkaline_Phosphatase', type: 'numerical', min: 30, max: 600 },
      { name: 'Liver_Disease', type: 'target' },
    ],
    target: 'Liver_Disease',
    targetValues: ['Yes', 'No'],
    targetDistribution: [0.42, 0.58],
    count: 350,
    targetLabel: 'Liver disease present',
  },
  'cardiology-stroke': {
    columns: [
      { name: 'Age', type: 'numerical', min: 30, max: 90 },
      { name: 'Sex', type: 'categorical', values: ['Male', 'Female'] },
      { name: 'Hypertension', type: 'categorical', values: ['Yes', 'No'] },
      { name: 'Atrial_Fibrillation', type: 'categorical', values: ['Yes', 'No'] },
      { name: 'BMI', type: 'numerical', min: 18, max: 45, missingRate: 0.05 },
      { name: 'Glucose', type: 'numerical', min: 60, max: 300 },
      { name: 'Smoking', type: 'categorical', values: ['Current', 'Former', 'Never'] },
      { name: 'Stroke', type: 'target' },
    ],
    target: 'Stroke',
    targetValues: ['Yes', 'No'],
    targetDistribution: [0.25, 0.75],
    count: 400,
    targetLabel: 'Stroke occurrence',
  },
  'mental-health': {
    columns: [
      { name: 'Age', type: 'numerical', min: 18, max: 75 },
      { name: 'Sex', type: 'categorical', values: ['Male', 'Female'] },
      { name: 'PHQ9_Score', type: 'numerical', min: 0, max: 27 },
      { name: 'GAD7_Score', type: 'numerical', min: 0, max: 21 },
      { name: 'Sleep_Hours', type: 'numerical', min: 2, max: 12, missingRate: 0.06 },
      { name: 'Social_Activity', type: 'categorical', values: ['High', 'Medium', 'Low'] },
      { name: 'Exercise_Freq', type: 'categorical', values: ['Daily', 'Weekly', 'Rarely', 'Never'] },
      { name: 'Depression_Level', type: 'target' },
    ],
    target: 'Depression_Level',
    targetValues: ['Severe', 'Moderate', 'Mild'],
    targetDistribution: [0.2, 0.35, 0.45],
    count: 320,
    targetLabel: 'Depression severity level',
  },
  diabetes: {
    columns: [
      { name: 'Pregnancies', type: 'numerical', min: 0, max: 15 },
      { name: 'Glucose', type: 'numerical', min: 44, max: 199 },
      { name: 'Blood_Pressure', type: 'numerical', min: 24, max: 122, missingRate: 0.05 },
      { name: 'Skin_Thickness', type: 'numerical', min: 7, max: 60 },
      { name: 'Insulin', type: 'numerical', min: 14, max: 846, missingRate: 0.07 },
      { name: 'BMI', type: 'numerical', min: 18, max: 67 },
      { name: 'Age', type: 'numerical', min: 21, max: 81 },
      { name: 'Diabetic', type: 'target' },
    ],
    target: 'Diabetic',
    targetValues: ['Yes', 'No'],
    targetDistribution: [0.35, 0.65],
    count: 768,
    targetLabel: 'Diabetes diagnosis',
  },
  pulmonology: {
    columns: [
      { name: 'Age', type: 'numerical', min: 20, max: 85 },
      { name: 'Sex', type: 'categorical', values: ['Male', 'Female'] },
      { name: 'FEV1', type: 'numerical', min: 0.5, max: 5, missingRate: 0.03 },
      { name: 'FVC', type: 'numerical', min: 1, max: 6 },
      { name: 'FEV1_FVC_Ratio', type: 'numerical', min: 0.3, max: 1 },
      { name: 'Smoking_Pack_Years', type: 'numerical', min: 0, max: 60 },
      { name: 'Dyspnoea_Grade', type: 'categorical', values: ['0', '1', '2', '3', '4'] },
      { name: 'Lung_Disease', type: 'target' },
    ],
    target: 'Lung_Disease',
    targetValues: ['COPD', 'Asthma', 'Normal'],
    targetDistribution: [0.35, 0.25, 0.4],
    count: 310,
    targetLabel: 'Lung disease classification',
  },
  'sepsis-icu': {
    columns: [
      { name: 'Age', type: 'numerical', min: 18, max: 95 },
      { name: 'Heart_Rate', type: 'numerical', min: 40, max: 180 },
      { name: 'Resp_Rate', type: 'numerical', min: 8, max: 45 },
      { name: 'Temperature', type: 'numerical', min: 35, max: 41, missingRate: 0.04 },
      { name: 'WBC_Count', type: 'numerical', min: 1, max: 30 },
      { name: 'Lactate', type: 'numerical', min: 0.5, max: 12, missingRate: 0.08 },
      { name: 'MAP', type: 'numerical', min: 40, max: 130 },
      { name: 'Sepsis', type: 'target' },
    ],
    target: 'Sepsis',
    targetValues: ['Yes', 'No'],
    targetDistribution: [0.3, 0.7],
    count: 420,
    targetLabel: 'Sepsis onset predicted',
  },
  'fetal-health': {
    columns: [
      { name: 'Baseline_FHR', type: 'numerical', min: 100, max: 180 },
      { name: 'Accelerations', type: 'numerical', min: 0, max: 0.02 },
      { name: 'Uterine_Contractions', type: 'numerical', min: 0, max: 0.015 },
      { name: 'Light_Decelerations', type: 'numerical', min: 0, max: 0.015 },
      { name: 'Prolonged_Decelerations', type: 'numerical', min: 0, max: 0.005, missingRate: 0.02 },
      { name: 'Short_Term_Variability', type: 'numerical', min: 0.2, max: 7 },
      { name: 'Mean_STV', type: 'numerical', min: 0, max: 7 },
      { name: 'Fetal_Health', type: 'target' },
    ],
    target: 'Fetal_Health',
    targetValues: ['Normal', 'Suspect', 'Pathological'],
    targetDistribution: [0.78, 0.14, 0.08],
    count: 2126,
    targetLabel: 'Fetal health classification',
  },
  dermatology: {
    columns: [
      { name: 'Age', type: 'numerical', min: 10, max: 90 },
      { name: 'Sex', type: 'categorical', values: ['Male', 'Female'] },
      { name: 'Asymmetry', type: 'numerical', min: 0, max: 2 },
      { name: 'Border_Irregularity', type: 'numerical', min: 0, max: 8 },
      { name: 'Colour_Variation', type: 'numerical', min: 1, max: 6, missingRate: 0.03 },
      { name: 'Diameter_mm', type: 'numerical', min: 1, max: 20 },
      { name: 'Lesion_Type', type: 'target' },
    ],
    target: 'Lesion_Type',
    targetValues: ['Melanoma', 'Benign'],
    targetDistribution: [0.3, 0.7],
    count: 340,
    targetLabel: 'Lesion classification',
  },
  stroke: {
    columns: [
      { name: 'Age', type: 'numerical', min: 40, max: 90 },
      { name: 'Sex', type: 'categorical', values: ['Male', 'Female'] },
      { name: 'Systolic_BP', type: 'numerical', min: 90, max: 200 },
      { name: 'Diastolic_BP', type: 'numerical', min: 60, max: 120, missingRate: 0.04 },
      { name: 'Total_Cholesterol', type: 'numerical', min: 120, max: 350 },
      { name: 'Smoker', type: 'categorical', values: ['Yes', 'No'] },
      { name: 'Diabetic', type: 'categorical', values: ['Yes', 'No'] },
      { name: 'Stroke_Risk', type: 'target' },
    ],
    target: 'Stroke_Risk',
    targetValues: ['High', 'Low'],
    targetDistribution: [0.28, 0.72],
    count: 380,
    targetLabel: 'Framingham stroke risk',
  },
  gastroenterology: {
    columns: [
      { name: 'Age', type: 'numerical', min: 15, max: 80 },
      { name: 'Sex', type: 'categorical', values: ['Male', 'Female'] },
      { name: 'CRP', type: 'numerical', min: 0, max: 150, missingRate: 0.05 },
      { name: 'Calprotectin', type: 'numerical', min: 0, max: 2000 },
      { name: 'Hemoglobin', type: 'numerical', min: 7, max: 18 },
      { name: 'Albumin', type: 'numerical', min: 1.5, max: 5.5 },
      { name: 'Medication_Adherence', type: 'categorical', values: ['High', 'Medium', 'Low'] },
      { name: 'IBD_Flare', type: 'target' },
    ],
    target: 'IBD_Flare',
    targetValues: ['Yes', 'No'],
    targetDistribution: [0.38, 0.62],
    count: 270,
    targetLabel: 'IBD flare-up predicted',
  },
  orthopedics: {
    columns: [
      { name: 'Age', type: 'numerical', min: 45, max: 85 },
      { name: 'Sex', type: 'categorical', values: ['Male', 'Female'] },
      { name: 'BMI', type: 'numerical', min: 18, max: 45 },
      { name: 'Pre_Op_Pain_Score', type: 'numerical', min: 0, max: 10 },
      { name: 'Comorbidity_Count', type: 'numerical', min: 0, max: 6, missingRate: 0.03 },
      { name: 'Pre_Op_ROM', type: 'numerical', min: 40, max: 120 },
      { name: 'ASA_Grade', type: 'categorical', values: ['I', 'II', 'III', 'IV'] },
      { name: 'Recovery_Outcome', type: 'target' },
    ],
    target: 'Recovery_Outcome',
    targetValues: ['Good', 'Poor'],
    targetDistribution: [0.7, 0.3],
    count: 290,
    targetLabel: 'Post-operative recovery',
  },
  ophthalmology: {
    columns: [
      { name: 'Age', type: 'numerical', min: 25, max: 80 },
      { name: 'Sex', type: 'categorical', values: ['Male', 'Female'] },
      { name: 'Diabetes_Duration_Years', type: 'numerical', min: 1, max: 30 },
      { name: 'HbA1c', type: 'numerical', min: 5, max: 14, missingRate: 0.04 },
      { name: 'Microaneurysm_Count', type: 'numerical', min: 0, max: 20 },
      { name: 'Exudate_Area', type: 'numerical', min: 0, max: 100 },
      { name: 'Retinopathy_Grade', type: 'target' },
    ],
    target: 'Retinopathy_Grade',
    targetValues: ['None', 'Mild', 'Moderate', 'Severe'],
    targetDistribution: [0.4, 0.25, 0.2, 0.15],
    count: 350,
    targetLabel: 'Diabetic retinopathy severity',
  },
  hematology: {
    columns: [
      { name: 'Age', type: 'numerical', min: 5, max: 85 },
      { name: 'Sex', type: 'categorical', values: ['Male', 'Female'] },
      { name: 'Hemoglobin', type: 'numerical', min: 4, max: 18 },
      { name: 'MCV', type: 'numerical', min: 50, max: 120 },
      { name: 'MCH', type: 'numerical', min: 15, max: 40, missingRate: 0.03 },
      { name: 'RDW', type: 'numerical', min: 10, max: 25 },
      { name: 'Ferritin', type: 'numerical', min: 5, max: 500, missingRate: 0.06 },
      { name: 'Anaemia_Type', type: 'target' },
    ],
    target: 'Anaemia_Type',
    targetValues: ['Iron_Def', 'B12_Def', 'Chronic', 'Normal'],
    targetDistribution: [0.3, 0.15, 0.2, 0.35],
    count: 330,
    targetLabel: 'Anaemia classification',
  },
  'infectious-disease': {
    columns: [
      { name: 'Age', type: 'numerical', min: 1, max: 95 },
      { name: 'Sex', type: 'categorical', values: ['Male', 'Female'] },
      { name: 'Organism', type: 'categorical', values: ['E.coli', 'S.aureus', 'K.pneumoniae', 'P.aeruginosa'] },
      { name: 'Prior_Antibiotics', type: 'numerical', min: 0, max: 5 },
      { name: 'Hospital_Days', type: 'numerical', min: 0, max: 60, missingRate: 0.04 },
      { name: 'ICU_Admission', type: 'categorical', values: ['Yes', 'No'] },
      { name: 'Resistant', type: 'target' },
    ],
    target: 'Resistant',
    targetValues: ['Resistant', 'Susceptible'],
    targetDistribution: [0.32, 0.68],
    count: 380,
    targetLabel: 'Antibiotic resistance',
  },
};

// Seed-based pseudo-random to get consistent data across page loads
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateSeededRows(config, seed) {
  const rand = seededRandom(seed);
  const rows = [];
  for (let i = 0; i < config.count; i++) {
    const row = {};
    for (const col of config.columns) {
      if (col.name === config.target) {
        const r = rand();
        let cumulative = 0;
        for (let t = 0; t < config.targetValues.length; t++) {
          cumulative += config.targetDistribution[t];
          if (r <= cumulative) {
            row[col.name] = config.targetValues[t];
            break;
          }
        }
        if (row[col.name] === undefined) {
          row[col.name] = config.targetValues[config.targetValues.length - 1];
        }
      } else if (col.type === 'numerical') {
        const base = col.min + rand() * (col.max - col.min);
        row[col.name] = Math.round(base * 10) / 10;
        if (col.missingRate && rand() < col.missingRate) {
          row[col.name] = null;
        }
      } else if (col.type === 'categorical') {
        row[col.name] = col.values[Math.floor(rand() * col.values.length)];
      }
    }
    rows.push(row);
  }
  return rows;
}

const datasetCache = {};

export function getDefaultDataset(domainId) {
  if (datasetCache[domainId]) return datasetCache[domainId];

  const config = domainConfigs[domainId];
  if (!config) return null;

  let seed = 0;
  for (let i = 0; i < domainId.length; i++) {
    seed += domainId.charCodeAt(i) * (i + 1);
  }

  const rows = generateSeededRows(config, seed + 12345);
  const result = {
    rows,
    meta: {
      name: domainId,
      records: rows.length,
      features: config.columns.length - 1,
      target: config.target,
      targetLabel: config.targetLabel,
    },
  };

  datasetCache[domainId] = result;
  return result;
}

export { domainConfigs };

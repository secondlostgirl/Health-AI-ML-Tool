export const domains = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    focusLabel: 'CARDIOLOGY FOCUS',
    scenario:
      'Predicting the 30-day readmission risk for heart failure patients following their initial discharge. How can machine learning help identify high-risk individuals before they leave the hospital?',
    tip: 'Understanding clinical context is the foundation of any healthcare AI model. It defines the \'Ground Truth\' and ensures the model solves a relevant medical problem.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Cardiac monitoring ECG waveform',
    defaultTarget: 'Readmitted',
  },
  {
    id: 'radiology',
    name: 'Radiology',
    focusLabel: 'RADIOLOGY FOCUS',
    scenario:
      'Classifying chest X-ray findings as normal or abnormal to assist radiologists in prioritising urgent cases. Can ML reduce reporting delays and flag critical findings earlier?',
    tip: 'Radiology AI models must be trained on diverse imaging datasets to avoid bias toward specific scanner types or patient demographics.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Chest X-ray radiological scan',
    defaultTarget: 'Abnormal',
  },
  {
    id: 'nephrology',
    name: 'Nephrology',
    focusLabel: 'NEPHROLOGY FOCUS',
    scenario:
      'Predicting the progression of chronic kidney disease (CKD) to end-stage renal failure within 5 years using laboratory markers and patient demographics. Can early ML-based detection improve patient outcomes?',
    tip: 'Kidney function markers like eGFR and creatinine are time-sensitive. ML models must account for longitudinal trends, not just single measurements.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Kidney function diagnostic chart',
    defaultTarget: 'CKD_Progression',
  },
  {
    id: 'oncology',
    name: 'Oncology',
    focusLabel: 'ONCOLOGY FOCUS',
    scenario:
      'Predicting whether a breast tumour is malignant or benign based on fine-needle aspirate (FNA) cell measurements. How can ML assist in early cancer screening and reduce unnecessary biopsies?',
    tip: 'Cancer classification models require careful feature engineering. Cell morphology metrics like radius, texture, and symmetry are often the most discriminative features.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Cancer cell microscopy analysis',
    defaultTarget: 'Diagnosis',
  },
  {
    id: 'neurology',
    name: 'Neurology',
    focusLabel: 'NEUROLOGY FOCUS',
    scenario:
      'Classifying EEG signals to detect epileptic seizure activity versus normal brain patterns. Can machine learning enable real-time seizure detection for ICU patients?',
    tip: 'Neurological signal data is highly dimensional and noisy. Feature extraction from EEG signals (frequency bands, entropy measures) is critical for model performance.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'EEG brain signal waveform',
    defaultTarget: 'Seizure',
  },
  {
    id: 'endocrinology',
    name: 'Endocrinology',
    focusLabel: 'ENDOCRINOLOGY FOCUS',
    scenario:
      'Predicting thyroid disease classification (hypothyroid, hyperthyroid, or euthyroid) using hormone panel results and patient symptoms. Can ML streamline endocrine diagnostics?',
    tip: 'Hormone levels interact in complex feedback loops (e.g., TSH-T3-T4 axis). ML models can capture non-linear relationships that simple reference ranges miss.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Thyroid hormone level analysis',
    defaultTarget: 'Thyroid_Class',
  },
  {
    id: 'hepatology',
    name: 'Hepatology',
    focusLabel: 'HEPATOLOGY FOCUS',
    scenario:
      'Predicting liver disease progression using blood markers (ALT, AST, bilirubin, albumin) and patient risk factors. Can ML identify at-risk patients before irreversible liver damage occurs?',
    tip: 'Liver function tests have overlapping ranges across different diseases. ML models benefit from combining multiple biomarkers to improve diagnostic specificity.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Liver function test results',
    defaultTarget: 'Liver_Disease',
  },
  {
    id: 'cardiology-stroke',
    name: 'Cardiology (Stroke)',
    focusLabel: 'CARDIOLOGY (STROKE) FOCUS',
    scenario:
      'Predicting stroke occurrence based on cardiovascular risk factors including hypertension, atrial fibrillation, BMI, and glucose levels. Can ML provide early warning for stroke prevention?',
    tip: 'Stroke prediction models must balance sensitivity and specificity carefully — missing a true positive (stroke) has severe consequences, but too many false positives lead to unnecessary interventions.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Brain CT scan showing stroke regions',
    defaultTarget: 'Stroke',
  },
  {
    id: 'mental-health',
    name: 'Mental Health',
    focusLabel: 'MENTAL HEALTH FOCUS',
    scenario:
      'Predicting depression severity levels using patient-reported outcome measures, sleep patterns, and behavioural indicators. Can ML support mental health screening in primary care?',
    tip: 'Mental health data is inherently subjective and culturally influenced. Models must be validated across diverse populations to avoid encoding societal biases.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Mental health assessment questionnaire',
    defaultTarget: 'Depression_Level',
  },
  {
    id: 'diabetes',
    name: 'Diabetes',
    focusLabel: 'DIABETES FOCUS',
    scenario:
      'Predicting the onset of Type 2 diabetes within 5 years using glucose tolerance test results, BMI, insulin levels, and family history. Can ML enable earlier lifestyle interventions?',
    tip: 'The Pima Indians Diabetes Dataset is a classic ML benchmark. However, real-world diabetes prediction requires more diverse training data to generalise across populations.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Blood glucose monitoring chart',
    defaultTarget: 'Diabetic',
  },
  {
    id: 'pulmonology',
    name: 'Pulmonology',
    focusLabel: 'PULMONOLOGY FOCUS',
    scenario:
      'Classifying lung disease patterns (COPD, asthma, pneumonia) from spirometry readings and patient demographics. Can ML assist in differential diagnosis of respiratory conditions?',
    tip: 'Pulmonary function tests (PFTs) produce time-series data. Key derived metrics like FEV1/FVC ratio are clinically validated features that ML models should include.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Spirometry lung function graph',
    defaultTarget: 'Lung_Disease',
  },
  {
    id: 'sepsis-icu',
    name: 'Sepsis/ICU',
    focusLabel: 'SEPSIS/ICU FOCUS',
    scenario:
      'Predicting sepsis onset in ICU patients 6 hours before clinical manifestation using vital signs, lab values, and nursing assessments. Can ML provide an early warning system for critical care?',
    tip: 'Sepsis prediction is a time-critical task where every hour of delayed treatment increases mortality by 7-8%. ML models must optimise for early detection over accuracy.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'ICU patient vital signs monitor',
    defaultTarget: 'Sepsis',
  },
  {
    id: 'fetal-health',
    name: 'Fetal Health',
    focusLabel: 'FETAL HEALTH FOCUS',
    scenario:
      'Classifying fetal health status (normal, suspect, pathological) from cardiotocography (CTG) measurements during labour. Can ML assist obstetricians in real-time fetal monitoring?',
    tip: 'CTG interpretation has high inter-observer variability among clinicians. ML can provide consistent, objective assessment to support clinical decision-making.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Cardiotocography fetal heart rate trace',
    defaultTarget: 'Fetal_Health',
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    focusLabel: 'DERMATOLOGY FOCUS',
    scenario:
      'Classifying skin lesion types (melanoma, benign naevus, basal cell carcinoma) using dermoscopic feature measurements. Can ML improve early detection of skin cancer in primary care settings?',
    tip: 'Skin lesion classification is heavily influenced by skin tone. Models trained predominantly on lighter skin tones may underperform on darker skin — a critical equity concern.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Dermoscopy skin lesion analysis',
    defaultTarget: 'Lesion_Type',
  },
  {
    id: 'stroke',
    name: 'Stroke',
    focusLabel: 'STROKE FOCUS',
    scenario:
      'Predicting stroke risk using the Framingham risk factors including age, blood pressure, cholesterol, smoking status, and diabetes. Can ML improve upon traditional risk scoring methods?',
    tip: 'Traditional stroke risk calculators (CHADS-VASc) use simple point systems. ML models can capture complex interactions between risk factors that linear scores miss.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Stroke risk factor assessment',
    defaultTarget: 'Stroke_Risk',
  },
  {
    id: 'gastroenterology',
    name: 'Gastroenterology',
    focusLabel: 'GASTROENTEROLOGY FOCUS',
    scenario:
      'Predicting inflammatory bowel disease (IBD) flare-ups using biomarker trends, medication adherence, and dietary patterns. Can ML help patients and clinicians anticipate disease activity?',
    tip: 'GI disease prediction benefits from temporal modelling — tracking how biomarkers change over time is often more predictive than single-point measurements.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Gastrointestinal endoscopy view',
    defaultTarget: 'IBD_Flare',
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    focusLabel: 'ORTHOPEDICS FOCUS',
    scenario:
      'Predicting post-operative recovery outcomes for total knee replacement based on pre-surgical fitness, comorbidities, and patient demographics. Can ML personalise rehabilitation plans?',
    tip: 'Orthopaedic outcome prediction must consider patient-reported outcomes (PROs) alongside clinical measures. Patient satisfaction and functional recovery are equally important endpoints.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Knee joint X-ray analysis',
    defaultTarget: 'Recovery_Outcome',
  },
  {
    id: 'ophthalmology',
    name: 'Ophthalmology',
    focusLabel: 'OPHTHALMOLOGY FOCUS',
    scenario:
      'Detecting diabetic retinopathy severity from retinal fundus image features. Can ML enable mass screening programmes in areas with limited access to ophthalmologists?',
    tip: 'Retinal imaging AI is one of the most successful clinical ML applications. The IDx-DR system was the first FDA-approved autonomous AI diagnostic device.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Retinal fundus photograph',
    defaultTarget: 'Retinopathy_Grade',
  },
  {
    id: 'hematology',
    name: 'Hematology',
    focusLabel: 'HEMATOLOGY FOCUS',
    scenario:
      'Classifying anaemia types (iron deficiency, B12 deficiency, thalassemia, chronic disease) using complete blood count (CBC) parameters. Can ML reduce the time to diagnosis for complex blood disorders?',
    tip: 'CBC parameters like MCV, MCH, and RDW form distinct patterns for different anaemia types. ML models can identify these multi-dimensional patterns more reliably than manual rules.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Blood cell morphology analysis',
    defaultTarget: 'Anaemia_Type',
  },
  {
    id: 'infectious-disease',
    name: 'Infectious Disease',
    focusLabel: 'INFECTIOUS DISEASE FOCUS',
    scenario:
      'Predicting antibiotic resistance patterns from patient culture results and local epidemiological data. Can ML guide empiric antibiotic selection to combat antimicrobial resistance?',
    tip: 'Antimicrobial resistance (AMR) is a global health crisis. ML models that predict resistance patterns can help clinicians choose effective antibiotics faster, reducing treatment failures.',
    disclaimer:
      'A human doctor or nurse must always review the model\'s suggestions. This tool helps you learn — it does not make clinical decisions.',
    imageAlt: 'Antibiotic susceptibility testing plate',
    defaultTarget: 'Resistant',
  },
];

/**
 * Valid CSV content strings for testing the CSVUploader component.
 * Each string can be used to create a File object for upload simulation.
 */

// 1. Standard CSV: 5 columns, 15 rows with headers
export const standardCsv = [
  'Age,Sex,BP,Cholesterol,Target',
  '45,Male,130,220,Yes',
  '62,Female,145,260,No',
  '53,Male,128,200,Yes',
  '70,Female,160,310,No',
  '38,Male,118,190,Yes',
  '55,Female,135,240,No',
  '48,Male,142,230,Yes',
  '67,Female,155,280,No',
  '41,Male,125,210,Yes',
  '59,Female,138,250,No',
  '73,Male,165,295,Yes',
  '36,Female,115,185,No',
  '50,Male,132,225,Yes',
  '64,Female,150,270,No',
  '44,Male,127,205,Yes',
].join('\n');

// 2. CSV with ~10% missing values: 15 rows, 5 columns (some cells empty)
export const csvWithMissing = [
  'Age,Sex,BP,Cholesterol,Target',
  '45,Male,130,220,Yes',
  '62,,145,260,No',
  '53,Male,,200,Yes',
  '70,Female,160,,No',
  '38,Male,118,190,',
  '55,Female,135,240,No',
  '48,,142,230,Yes',
  '67,Female,155,280,No',
  '41,Male,,210,Yes',
  '59,Female,138,,No',
  '73,Male,165,295,Yes',
  '36,Female,115,185,No',
  '50,Male,132,225,Yes',
  '64,Female,150,270,No',
  '44,Male,127,205,Yes',
].join('\n');

// 3. Mixed numeric and categorical columns: 15 rows
export const mixedTypesCsv = [
  'PatientID,Age,Gender,BloodType,Glucose,Smoker,Outcome',
  'P001,45,Male,A+,105.3,Yes,Positive',
  'P002,62,Female,B-,98.7,No,Negative',
  'P003,53,Male,O+,112.1,Yes,Positive',
  'P004,70,Female,AB+,88.4,No,Negative',
  'P005,38,Male,A-,130.2,Yes,Positive',
  'P006,55,Female,B+,95.6,No,Negative',
  'P007,48,Male,O-,108.9,Yes,Positive',
  'P008,67,Female,A+,91.3,No,Negative',
  'P009,41,Male,AB-,119.7,Yes,Positive',
  'P010,59,Female,B+,84.2,No,Negative',
  'P011,73,Male,O+,142.5,Yes,Positive',
  'P012,36,Female,A+,76.8,No,Negative',
  'P013,50,Male,B-,101.4,Yes,Positive',
  'P014,64,Female,AB+,93.1,No,Negative',
  'P015,44,Male,O+,110.6,Yes,Positive',
].join('\n');

// 4. Large CSV: 500 rows, 4 columns
function generateLargeCsv() {
  const lines = ['ID,Value1,Value2,Category'];
  for (let i = 1; i <= 500; i++) {
    const v1 = (Math.sin(i) * 50 + 100).toFixed(1);
    const v2 = (Math.cos(i) * 30 + 60).toFixed(1);
    const cat = i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low';
    lines.push(`${i},${v1},${v2},${cat}`);
  }
  return lines.join('\n');
}
export const largeCsv = generateLargeCsv();

// 5. CSV with quoted fields containing commas: 15 rows
export const quotedFieldsCsv = [
  'Name,Diagnosis,Notes,Score,Outcome',
  '"Smith, John",Hypertension,"Blood pressure elevated, needs monitoring",85,Yes',
  '"Doe, Jane",Diabetes,"Type 2, on metformin",72,No',
  '"Brown, Alex","Heart Failure, Class II","Ejection fraction low, stable",65,Yes',
  '"Wilson, Mary",Arrhythmia,"Atrial fibrillation, rate controlled",78,No',
  '"Taylor, Bob","CKD, Stage 3","eGFR declining, monitor closely",55,Yes',
  '"Anderson, Sue",Asthma,"Mild persistent, using inhaler",90,No',
  '"Thomas, Jim",COPD,"Moderate, on bronchodilators",60,Yes',
  '"Jackson, Ann",Anemia,"Iron deficiency, supplementing",68,No',
  '"White, Dan","Stroke, Ischemic","Right MCA territory, recovering",45,Yes',
  '"Harris, Eve",Migraine,"Chronic, with aura",82,No',
  '"Martin, Roy",Epilepsy,"Well controlled on medication",75,Yes',
  '"Garcia, Lily","Pneumonia, Community","Responding to antibiotics, improving",58,No',
  '"Clark, Sam",Sepsis,"Resolved, was in ICU for 5 days",40,Yes',
  '"Lewis, Kate","DVT, Left Leg","On anticoagulation therapy, stable",70,No',
  '"Walker, Tom",Hepatitis,"Type B, chronic carrier",62,Yes',
].join('\n');

/**
 * Invalid file content strings for testing the CSVUploader component.
 * These should all be rejected with appropriate error messages.
 */

// 1. Non-CSV content: random text, not in CSV format (intended filename: "data.txt")
export const nonCsvContent = `This is not a CSV file at all.
It contains random text with no structure.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco.`;

export const nonCsvFileName = 'data.txt';

// 2. Empty file content: 0 bytes
export const emptyContent = '';

// 3. Headers only with only 3 data rows (less than 10 required)
export const headersOnlyCsv = [
  'Age,Sex,BP,Cholesterol,Target',
  '45,Male,130,220,Yes',
  '62,Female,145,260,No',
  '53,Male,128,200,Yes',
].join('\n');

// 4. Oversized file description: a 15MB file (we mock the File size property)
export const oversizedDescription = 'This represents a CSV file that exceeds the 10MB size limit (15MB).';

// Content for the oversized file mock (the actual content does not matter,
// we override the size property on the File object)
export const oversizedContent = 'Age,Sex,BP\n45,Male,130\n62,Female,145';
export const oversizedSize = 15 * 1024 * 1024; // 15MB in bytes

// 5. Malformed CSV: inconsistent column counts per row
export const malformedCsv = [
  'Age,Sex,BP,Cholesterol,Target',
  '45,Male,130,220,Yes',
  '62,Female',
  '53,Male,128',
  '70,Female,160,310,No,ExtraCol,AnotherExtra',
  '38',
  '55,Female,135,240,No',
  '48,Male,142',
  '67',
  '41,Male,125,210,Yes,Extra',
  '59,Female',
  '73,Male,165,295,Yes',
  '36',
  '50,Male,132',
  '64,Female,150,270,No,Extra,More,Cols',
  '44,Male,127,205,Yes',
].join('\n');

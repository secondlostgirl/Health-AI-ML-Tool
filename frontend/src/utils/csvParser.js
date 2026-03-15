import Papa from 'papaparse';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_ROWS = 10;
const MIN_COLS = 2;

export function validateCSVFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const validTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'text/plain',
    '',
  ];
  const hasCSVExtension = file.name?.toLowerCase().endsWith('.csv');

  if (!hasCSVExtension && !validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid CSV file. The selected file is not in CSV format.',
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'The file is empty. Please upload a CSV file with data.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the 10MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
    };
  }

  return { valid: true, error: null };
}

export function validateCSVContent(parsed) {
  if (!parsed || !parsed.data || parsed.data.length === 0) {
    return { valid: false, error: 'The file contains no data.' };
  }

  if (!parsed.meta?.fields || parsed.meta.fields.length < MIN_COLS) {
    return {
      valid: false,
      error: `The file must contain at least ${MIN_COLS} columns. Found ${parsed.meta?.fields?.length || 0}.`,
    };
  }

  if (parsed.data.length < MIN_ROWS) {
    return {
      valid: false,
      error: `The file must contain at least ${MIN_ROWS} data rows. Found ${parsed.data.length}.`,
    };
  }

  if (parsed.errors && parsed.errors.length > parsed.data.length * 0.1) {
    return {
      valid: false,
      error: 'The file has formatting errors. Please check that all rows have the same number of columns.',
    };
  }

  return { valid: true, error: null };
}

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        resolve(results);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

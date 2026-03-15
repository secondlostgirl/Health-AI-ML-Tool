import { useRef } from 'react';
import useAppStore from '../../stores/useAppStore';
import useDataStore from '../../stores/useDataStore';
import { getDefaultDataset } from '../../data/defaultDatasets';
import { validateCSVFile, validateCSVContent, parseCSV } from '../../utils/csvParser';
import styles from './CSVUploader.module.css';

export default function CSVUploader() {
  const fileInputRef = useRef(null);
  const selectedDomainId = useAppStore((s) => s.selectedDomainId);
  const setCsvData = useDataStore((s) => s.setCsvData);
  const setCsvError = useDataStore((s) => s.setCsvError);
  const useDefaultDatasetAction = useDataStore((s) => s.useDefaultDataset);
  const csvError = useDataStore((s) => s.csvError);
  const csvFileName = useDataStore((s) => s.csvFileName);
  const dataSource = useDataStore((s) => s.dataSource);

  const handleDefault = () => {
    const dataset = getDefaultDataset(selectedDomainId);
    if (dataset) {
      useDefaultDatasetAction(dataset.rows);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileValidation = validateCSVFile(file);
    if (!fileValidation.valid) {
      setCsvError(fileValidation.error);
      e.target.value = '';
      return;
    }

    try {
      const parsed = await parseCSV(file);
      const contentValidation = validateCSVContent(parsed);
      if (!contentValidation.valid) {
        setCsvError(contentValidation.error);
        e.target.value = '';
        return;
      }
      setCsvData(parsed.data, file.name);
    } catch {
      setCsvError('Failed to parse the CSV file. Please check the file format.');
    }

    e.target.value = '';
  };

  return (
    <div className={styles.wrapper}>
      <label className={styles.sectionLabel}>CONFIGURATION</label>

      <button className={styles.defaultBtn} onClick={handleDefault}>
        Use Default Dataset
      </button>

      <button className={styles.uploadBtn} onClick={handleUploadClick}>
        Upload Your CSV
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className={styles.hiddenInput}
        data-testid="csv-file-input"
      />

      {csvError && (
        <div className={styles.error} role="alert">
          {csvError}
        </div>
      )}

      {dataSource === 'uploaded' && csvFileName && (
        <div className={styles.fileInfo}>
          Using: {csvFileName}
        </div>
      )}

      {dataSource === 'default' && (
        <div className={styles.fileInfo}>
          Using: Default dataset
        </div>
      )}
    </div>
  );
}

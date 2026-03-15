import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import CSVUploader from '../../components/CSVUploader/CSVUploader';
import useAppStore from '../../stores/useAppStore';
import useDataStore from '../../stores/useDataStore';

import { standardCsv, csvWithMissing, mixedTypesCsv, largeCsv, quotedFieldsCsv } from '../mocks/validCsvFiles';
import {
  nonCsvContent, nonCsvFileName,
  emptyContent,
  headersOnlyCsv,
  oversizedContent, oversizedSize,
  malformedCsv,
} from '../mocks/invalidCsvFiles';

/**
 * Helper: create a File object from a string content.
 * Optionally override the file size via Object.defineProperty.
 */
function createCsvFile(content, name = 'test.csv', overrideSize = null) {
  const file = new File([content], name, { type: 'text/csv' });
  if (overrideSize !== null) {
    Object.defineProperty(file, 'size', { value: overrideSize, writable: false });
  }
  return file;
}

describe('CSVUploader', () => {
  beforeEach(() => {
    useAppStore.setState({
      currentStep: 2,
      selectedDomainId: 'cardiology',
      showHelp: false,
    });
    useDataStore.setState({
      dataSource: 'default',
      csvData: null,
      csvFileName: null,
      csvError: null,
      targetColumn: null,
      columnMappings: {},
      mapperSaved: false,
      mapperOpen: false,
      pipelineConfig: {
        imputation: 'median',
        scaling: 'standard',
        outlierHandling: 'clip',
        featureSelection: 'all',
        trainTestSplit: 80,
      },
      pipelineStatus: 'idle',
      pipelineProgress: 0,
      pipelineLogs: [],
      pipelineDuration: null,
    });
  });

  // ===================== VALID CSV TESTS =====================

  it('accepts a standard CSV with 15 rows and 5 columns', async () => {
    const user = userEvent.setup();
    render(<CSVUploader />);

    const input = screen.getByTestId('csv-file-input');
    const file = createCsvFile(standardCsv, 'standard.csv');
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      const state = useDataStore.getState();
      expect(state.csvData).not.toBeNull();
      expect(state.csvFileName).toBe('standard.csv');
    });
  });

  it('accepts a CSV with missing values (~10% empty cells)', async () => {
    const user = userEvent.setup();
    render(<CSVUploader />);

    const input = screen.getByTestId('csv-file-input');
    const file = createCsvFile(csvWithMissing, 'missing.csv');
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      const state = useDataStore.getState();
      expect(state.csvData).not.toBeNull();
      expect(state.csvFileName).toBe('missing.csv');
    });
  });

  it('accepts a CSV with mixed numeric and categorical columns', async () => {
    const user = userEvent.setup();
    render(<CSVUploader />);

    const input = screen.getByTestId('csv-file-input');
    const file = createCsvFile(mixedTypesCsv, 'mixed.csv');
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      const state = useDataStore.getState();
      expect(state.csvData).not.toBeNull();
      expect(state.csvFileName).toBe('mixed.csv');
    });
  });

  it('accepts a large CSV with 500 rows', async () => {
    const user = userEvent.setup();
    render(<CSVUploader />);

    const input = screen.getByTestId('csv-file-input');
    const file = createCsvFile(largeCsv, 'large.csv');
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      const state = useDataStore.getState();
      expect(state.csvData).not.toBeNull();
      expect(state.csvData.length).toBe(500);
      expect(state.csvFileName).toBe('large.csv');
    });
  });

  it('accepts a CSV with quoted fields containing commas', async () => {
    const user = userEvent.setup();
    render(<CSVUploader />);

    const input = screen.getByTestId('csv-file-input');
    const file = createCsvFile(quotedFieldsCsv, 'quoted.csv');
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      const state = useDataStore.getState();
      expect(state.csvData).not.toBeNull();
      expect(state.csvFileName).toBe('quoted.csv');
    });
  });

  // ===================== INVALID FILE TESTS =====================

  it('shows error for non-CSV file', async () => {
    render(<CSVUploader />);

    const input = screen.getByTestId('csv-file-input');
    const file = new File([nonCsvContent], nonCsvFileName, { type: 'application/json' });

    // Use fireEvent.change to bypass the accept attribute filtering
    // that userEvent.upload enforces (which would silently reject non-.csv files)
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toContain('Please upload a valid CSV file');
    });
  });

  it('shows error for empty file', async () => {
    const user = userEvent.setup();
    render(<CSVUploader />);

    const input = screen.getByTestId('csv-file-input');
    const file = new File([emptyContent], 'empty.csv', { type: 'text/csv' });
    // Override size to 0 to ensure it's detected as empty
    Object.defineProperty(file, 'size', { value: 0, writable: false });
    await user.upload(input, file);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toContain('The file is empty');
    });
  });

  it('shows error for CSV with fewer than 10 data rows', async () => {
    const user = userEvent.setup();
    render(<CSVUploader />);

    const input = screen.getByTestId('csv-file-input');
    const file = createCsvFile(headersOnlyCsv, 'headers-only.csv');
    await user.upload(input, file);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert.textContent.toLowerCase()).toContain('at least 10 data rows');
    });
  });

  it('shows error for file exceeding 10MB size limit', async () => {
    const user = userEvent.setup();
    render(<CSVUploader />);

    const input = screen.getByTestId('csv-file-input');
    const file = createCsvFile(oversizedContent, 'oversized.csv', oversizedSize);
    await user.upload(input, file);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert.textContent.toLowerCase()).toContain('exceeds');
    });
  });

  it('shows error for malformed CSV with inconsistent columns', async () => {
    const user = userEvent.setup();
    render(<CSVUploader />);

    const input = screen.getByTestId('csv-file-input');
    const file = createCsvFile(malformedCsv, 'malformed.csv');
    await user.upload(input, file);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert.textContent.toLowerCase()).toContain('formatting errors');
    });
  });
});

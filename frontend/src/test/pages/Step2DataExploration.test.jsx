import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import useAppStore from '../../stores/useAppStore';
import useDataStore from '../../stores/useDataStore';

// Mock the API modules used by child components
vi.mock('../../api', () => ({
  uploadCsv: vi.fn(() => Promise.resolve({ data: null, error: null })),
  saveColumnMapping: vi.fn(() => Promise.resolve({ data: null, error: null })),
  fetchPrepOptions: vi.fn(() => Promise.resolve({ data: null, error: 'mocked' })),
}));
vi.mock('../../api/client', () => ({
  getSessionId: vi.fn(() => null),
  setSessionId: vi.fn(),
  clearSessionId: vi.fn(),
}));

import Step2DataExploration from '../../pages/Step2DataExploration/Step2DataExploration';

describe('Step2DataExploration', () => {
  beforeEach(() => {
    useAppStore.setState({
      currentStep: 2,
      selectedDomainId: 'cardiology',
      showHelp: false,
      clinicalContext: null,
      contextLoading: false,
      contextError: null,
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
        imputation: 'mean',
        scaling: 'minmax',
        trainTestSplit: 80,
        smote: false,
      },
      pipelineStatus: 'idle',
      pipelineProgress: 0,
      pipelineLogs: [],
      pipelineDuration: null,
      uploadLoading: false,
      uploadError: null,
      backendSummary: null,
      mappingLoading: false,
      mappingError: null,
      prepLoading: false,
      prepError: null,
      prepResult: null,
      prepOptions: null,
    });
  });

  it('loads default dataset on mount when csvData is null', async () => {
    render(<Step2DataExploration />);

    await waitFor(() => {
      const state = useDataStore.getState();
      expect(state.csvData).not.toBeNull();
      expect(state.csvData.length).toBeGreaterThan(0);
    });
  });

  it('sets the target column from the default dataset metadata', async () => {
    render(<Step2DataExploration />);

    await waitFor(() => {
      const state = useDataStore.getState();
      expect(state.targetColumn).toBe('Readmitted');
    });
  });

  it('renders DataStats cards after loading default data', async () => {
    render(<Step2DataExploration />);

    await waitFor(() => {
      expect(screen.getByText('Patients Records')).toBeInTheDocument();
      expect(screen.getByText('Measurements')).toBeInTheDocument();
      expect(screen.getByText('Missing Data')).toBeInTheDocument();
    });
  });

  it('renders the hint text', async () => {
    render(<Step2DataExploration />);

    await waitFor(() => {
      expect(
        screen.getByText(/review the distribution and missing values/i)
      ).toBeInTheDocument();
    });
  });

  it('does not reload default dataset if csvData is already present', async () => {
    // Pre-populate csvData
    const existingData = [
      { A: 1, B: 2, Target: 'Yes' },
      { A: 3, B: 4, Target: 'No' },
    ];
    useDataStore.setState({
      csvData: existingData,
      targetColumn: 'Target',
    });

    render(<Step2DataExploration />);

    // The csvData should remain the same (not overwritten by default dataset)
    await waitFor(() => {
      const state = useDataStore.getState();
      expect(state.csvData).toBe(existingData);
      expect(state.csvData).toHaveLength(2);
    });
  });
});

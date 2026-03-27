import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import useAppStore from '../../stores/useAppStore';
import useDataStore from '../../stores/useDataStore';

// Mock API and client modules
vi.mock('../../api', () => ({
  runDataPreparation: vi.fn(() => Promise.resolve({ data: null, error: 'mocked' })),
  fetchPrepOptions: vi.fn(() => Promise.resolve({ data: null, error: 'mocked' })),
}));
vi.mock('../../api/client', () => ({
  getSessionId: vi.fn(() => null),
  setSessionId: vi.fn(),
  clearSessionId: vi.fn(),
}));

import Step3DataPreparation from '../../pages/Step3DataPreparation/Step3DataPreparation';

describe('Step3DataPreparation', () => {
  beforeEach(() => {
    useAppStore.setState({
      currentStep: 3,
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

  it('shows locked state when mapperSaved is false', () => {
    render(<Step3DataPreparation />);
    expect(screen.getByText('Step 3 is locked')).toBeInTheDocument();
    expect(
      screen.getByText(/complete the column mapper/i)
    ).toBeInTheDocument();
  });

  it('shows "Go Back to Step 2" button in locked state', async () => {
    const user = userEvent.setup();
    render(<Step3DataPreparation />);

    const goBackBtn = screen.getByRole('button', { name: /go back to step 2/i });
    expect(goBackBtn).toBeInTheDocument();

    await user.click(goBackBtn);
    expect(useAppStore.getState().currentStep).toBe(2);
  });

  it('shows the Data Preparation Engine when mapperSaved is true', () => {
    useDataStore.setState({ mapperSaved: true });
    render(<Step3DataPreparation />);

    expect(screen.getByText('Data Preparation Engine')).toBeInTheDocument();
    expect(
      screen.getByText(/automated cleaning, imputing, and scaling pipeline for cardiology datasets/i)
    ).toBeInTheDocument();
  });

  it('renders ProgressRing, PipelineConfig, and TerminalLog when unlocked', () => {
    useDataStore.setState({ mapperSaved: true });
    render(<Step3DataPreparation />);

    // ProgressRing shows "Ready to process" by default
    expect(screen.getByText('Ready to process')).toBeInTheDocument();
    // ProgressRing shows 0%
    expect(screen.getByText('0%')).toBeInTheDocument();
    // TerminalLog shows placeholder
    expect(
      screen.getByText(/configure the pipeline and click apply to begin processing/i)
    ).toBeInTheDocument();
    // PipelineConfig shows title
    expect(screen.getByText('Pipeline Configuration')).toBeInTheDocument();
  });

  it('does not show completion info when pipeline is idle', () => {
    useDataStore.setState({ mapperSaved: true });
    render(<Step3DataPreparation />);

    expect(screen.queryByText(/final validation passed/i)).not.toBeInTheDocument();
  });
});

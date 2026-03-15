import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../../App';
import useAppStore from '../../stores/useAppStore';
import useDataStore from '../../stores/useDataStore';

describe('Step gating — Column Mapper gates Step 3', () => {
  beforeEach(() => {
    useAppStore.setState({
      currentStep: 1,
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

  it('Step 3 footer button is disabled when on Step 2 and mapperSaved is false', () => {
    useAppStore.setState({ currentStep: 2 });
    useDataStore.setState({ mapperSaved: false });

    render(<App />);

    // The footer next button for Step 2 should be disabled when mapperSaved is false
    const nextBtn = screen.getByRole('button', { name: /proceed to step 3/i });
    expect(nextBtn).toBeDisabled();
  });

  it('Step 3 footer button becomes enabled when mapperSaved is true', () => {
    // Provide csvData so that Step2DataExploration's useEffect does not
    // reload the default dataset (which resets mapperSaved to false).
    const mockData = [
      { Age: 45, Sex: 'Male', BP: 130, Target: 'Yes' },
      { Age: 62, Sex: 'Female', BP: 145, Target: 'No' },
    ];

    useAppStore.setState({ currentStep: 2 });
    useDataStore.setState({ mapperSaved: true, csvData: mockData, targetColumn: 'Target' });

    render(<App />);

    const nextBtn = screen.getByRole('button', { name: /proceed to step 3/i });
    expect(nextBtn).not.toBeDisabled();
  });

  it('navigating to Step 3 with mapperSaved false shows blocked message', () => {
    useAppStore.setState({ currentStep: 3 });
    useDataStore.setState({ mapperSaved: false });

    render(<App />);

    // Step3DataPreparation renders a "Step 3 is locked" message when mapperSaved is false
    expect(screen.getByText(/step 3 is locked/i)).toBeInTheDocument();
  });

  it('navigating to Step 3 with mapperSaved true shows pipeline content', () => {
    useAppStore.setState({ currentStep: 3 });
    useDataStore.setState({ mapperSaved: true });

    render(<App />);

    // When mapperSaved is true, the pipeline configuration UI should render
    expect(screen.getByText(/data preparation engine/i)).toBeInTheDocument();
    expect(screen.getByText(/pipeline configuration/i)).toBeInTheDocument();
  });
});

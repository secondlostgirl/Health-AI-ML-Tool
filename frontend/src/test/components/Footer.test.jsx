import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import Footer from '../../components/Footer/Footer';
import useAppStore from '../../stores/useAppStore';
import useDataStore from '../../stores/useDataStore';

describe('Footer', () => {
  beforeEach(() => {
    useAppStore.setState({
      currentStep: 1,
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

  it('hides the Back button on step 1', () => {
    render(<Footer />);
    expect(screen.queryByText(/back/i)).not.toBeInTheDocument();
  });

  it('shows the Back button on step 2 and navigates back when clicked', async () => {
    const user = userEvent.setup();
    useAppStore.setState({ currentStep: 2 });

    render(<Footer />);
    const backBtn = screen.getByText(/back/i);
    expect(backBtn).toBeInTheDocument();

    await user.click(backBtn);
    expect(useAppStore.getState().currentStep).toBe(1);
  });

  it('displays correct step label for step 1', () => {
    render(<Footer />);
    expect(
      screen.getByRole('button', { name: /process to step 2: data exploration/i })
    ).toBeInTheDocument();
  });

  it('disables Next on step 2 when mapperSaved is false and shows tooltip', () => {
    useAppStore.setState({ currentStep: 2 });
    useDataStore.setState({ mapperSaved: false });

    render(<Footer />);
    const nextBtn = screen.getByRole('button', { name: /proceed to step 3/i });
    expect(nextBtn).toBeDisabled();
    expect(screen.getByText(/save column mapper in step 2 first/i)).toBeInTheDocument();
  });

  it('enables Next on step 2 when mapperSaved is true and advances step', async () => {
    const user = userEvent.setup();
    useAppStore.setState({ currentStep: 2 });
    useDataStore.setState({ mapperSaved: true });

    render(<Footer />);
    const nextBtn = screen.getByRole('button', { name: /proceed to step 3/i });
    expect(nextBtn).not.toBeDisabled();

    await user.click(nextBtn);
    expect(useAppStore.getState().currentStep).toBe(3);
  });
});

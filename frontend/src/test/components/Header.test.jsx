import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import Header from '../../components/Header/Header';
import useAppStore from '../../stores/useAppStore';
import useDataStore from '../../stores/useDataStore';

describe('Header', () => {
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

  it('renders the brand name HEALTH-AI and subtitle', () => {
    render(<Header />);
    expect(screen.getByText('HEALTH-AI')).toBeInTheDocument();
    expect(screen.getByText('ML Learning Tool')).toBeInTheDocument();
  });

  it('renders Help and Reset buttons', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: /open help/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset application/i })).toBeInTheDocument();
  });

  it('clicking Help toggles the showHelp state', async () => {
    const user = userEvent.setup();
    render(<Header />);

    expect(useAppStore.getState().showHelp).toBe(false);

    await user.click(screen.getByRole('button', { name: /open help/i }));
    expect(useAppStore.getState().showHelp).toBe(true);

    await user.click(screen.getByRole('button', { name: /open help/i }));
    expect(useAppStore.getState().showHelp).toBe(false);
  });

  it('clicking Reset resets both app and data stores', async () => {
    const user = userEvent.setup();

    // Set some non-default state
    useAppStore.setState({ currentStep: 3, selectedDomainId: 'oncology' });
    useDataStore.setState({ mapperSaved: true, pipelineStatus: 'complete' });

    render(<Header />);
    await user.click(screen.getByRole('button', { name: /reset application/i }));

    expect(useAppStore.getState().currentStep).toBe(1);
    expect(useAppStore.getState().selectedDomainId).toBe('cardiology');
    expect(useDataStore.getState().mapperSaved).toBe(false);
    expect(useDataStore.getState().pipelineStatus).toBe('idle');
  });

  it('renders the logo icon with "+" text', () => {
    render(<Header />);
    expect(screen.getByText('+')).toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PipelineConfig from '../../components/PipelineConfig/PipelineConfig';
import useDataStore from '../../stores/useDataStore';
import useAppStore from '../../stores/useAppStore';

describe('PipelineConfig', () => {
  let onApplyMock;

  beforeEach(() => {
    onApplyMock = vi.fn();

    useAppStore.setState({
      currentStep: 3,
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
      mapperSaved: true,
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

  it('renders imputation dropdown with 4 options, default is median', () => {
    render(<PipelineConfig onApply={onApplyMock} />);

    const imputationSelect = screen.getByLabelText(/missing value imputation/i);
    expect(imputationSelect.value).toBe('median');

    const options = Array.from(imputationSelect.querySelectorAll('option'));
    expect(options).toHaveLength(4);

    const values = options.map((o) => o.value);
    expect(values).toContain('mean');
    expect(values).toContain('median');
    expect(values).toContain('mode');
    expect(values).toContain('knn');
  });

  it('renders scaling dropdown with 4 options, default is standard', () => {
    render(<PipelineConfig onApply={onApplyMock} />);

    const scalingSelect = screen.getByLabelText(/feature scaling/i);
    expect(scalingSelect.value).toBe('standard');

    const options = Array.from(scalingSelect.querySelectorAll('option'));
    expect(options).toHaveLength(4);

    const values = options.map((o) => o.value);
    expect(values).toContain('standard');
    expect(values).toContain('minmax');
    expect(values).toContain('robust');
    expect(values).toContain('none');
  });

  it('renders outlier handling dropdown with 4 options, default is clip', () => {
    render(<PipelineConfig onApply={onApplyMock} />);

    const outlierSelect = screen.getByLabelText(/outlier handling/i);
    expect(outlierSelect.value).toBe('clip');

    const options = Array.from(outlierSelect.querySelectorAll('option'));
    expect(options).toHaveLength(4);

    const values = options.map((o) => o.value);
    expect(values).toContain('clip');
    expect(values).toContain('remove');
    expect(values).toContain('winsorize');
    expect(values).toContain('none');
  });

  it('renders feature selection dropdown with 4 options, default is all', () => {
    render(<PipelineConfig onApply={onApplyMock} />);

    const featureSelect = screen.getByLabelText(/feature selection/i);
    expect(featureSelect.value).toBe('all');

    const options = Array.from(featureSelect.querySelectorAll('option'));
    expect(options).toHaveLength(4);

    const values = options.map((o) => o.value);
    expect(values).toContain('all');
    expect(values).toContain('correlation');
    expect(values).toContain('variance');
    expect(values).toContain('mutual_info');
  });

  it('renders train/test slider with value 80, changing to 70 updates', async () => {
    render(<PipelineConfig onApply={onApplyMock} />);

    const slider = screen.getByRole('slider');
    expect(slider.value).toBe('80');

    // Change the slider value by firing a change event
    fireEvent.change(slider, { target: { value: '70' } });

    expect(useDataStore.getState().pipelineConfig.trainTestSplit).toBe(70);
  });

  it('apply button triggers the onApply callback', async () => {
    const user = userEvent.setup();
    render(<PipelineConfig onApply={onApplyMock} />);

    const applyBtn = screen.getByRole('button', { name: /apply pipeline/i });
    await user.click(applyBtn);

    expect(onApplyMock).toHaveBeenCalledTimes(1);
  });

  it('controls are disabled during running state', () => {
    useDataStore.setState({
      pipelineStatus: 'running',
    });

    render(<PipelineConfig onApply={onApplyMock} />);

    const imputationSelect = screen.getByLabelText(/missing value imputation/i);
    const scalingSelect = screen.getByLabelText(/feature scaling/i);
    const outlierSelect = screen.getByLabelText(/outlier handling/i);
    const featureSelect = screen.getByLabelText(/feature selection/i);
    const slider = screen.getByRole('slider');
    const applyBtn = screen.getByRole('button', { name: /processing/i });

    expect(imputationSelect).toBeDisabled();
    expect(scalingSelect).toBeDisabled();
    expect(outlierSelect).toBeDisabled();
    expect(featureSelect).toBeDisabled();
    expect(slider).toBeDisabled();
    expect(applyBtn).toBeDisabled();
  });
});

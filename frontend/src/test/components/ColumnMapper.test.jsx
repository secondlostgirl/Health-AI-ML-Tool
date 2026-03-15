import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import ColumnMapper from '../../components/ColumnMapper/ColumnMapper';
import useDataStore from '../../stores/useDataStore';
import useAppStore from '../../stores/useAppStore';

// Mock CSV data that simulates what PapaParse would produce
const mockCsvData = [
  { Age: 45, Sex: 'Male', BP: 130, Cholesterol: 220, Target: 'Yes' },
  { Age: 62, Sex: 'Female', BP: 145, Cholesterol: 260, Target: 'No' },
  { Age: 53, Sex: 'Male', BP: 128, Cholesterol: 200, Target: 'Yes' },
  { Age: 70, Sex: 'Female', BP: 160, Cholesterol: 310, Target: 'No' },
  { Age: 38, Sex: 'Male', BP: 118, Cholesterol: 190, Target: 'Yes' },
  { Age: 55, Sex: 'Female', BP: 135, Cholesterol: 240, Target: 'No' },
  { Age: 48, Sex: 'Male', BP: 142, Cholesterol: 230, Target: 'Yes' },
  { Age: 67, Sex: 'Female', BP: 155, Cholesterol: 280, Target: 'No' },
  { Age: 41, Sex: 'Male', BP: 125, Cholesterol: 210, Target: 'Yes' },
  { Age: 59, Sex: 'Female', BP: 138, Cholesterol: 250, Target: 'No' },
  { Age: 73, Sex: 'Male', BP: 165, Cholesterol: 295, Target: 'Yes' },
  { Age: 36, Sex: 'Female', BP: 115, Cholesterol: 185, Target: 'No' },
  { Age: 50, Sex: 'Male', BP: 132, Cholesterol: 225, Target: 'Yes' },
  { Age: 64, Sex: 'Female', BP: 150, Cholesterol: 270, Target: 'No' },
  { Age: 44, Sex: 'Male', BP: 127, Cholesterol: 205, Target: 'Yes' },
];

const columnNames = ['Age', 'Sex', 'BP', 'Cholesterol', 'Target'];

describe('ColumnMapper', () => {
  beforeEach(() => {
    useAppStore.setState({
      currentStep: 2,
      selectedDomainId: 'cardiology',
      showHelp: false,
    });
    useDataStore.setState({
      dataSource: 'uploaded',
      csvData: mockCsvData,
      csvFileName: 'test.csv',
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

  it('renders column names from the data', () => {
    render(<ColumnMapper />);

    // The target column dropdown should list all columns as options
    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option'));
    // First option is the placeholder "Select target column..."
    const optionTexts = options.map((o) => o.textContent);

    for (const col of columnNames) {
      expect(optionTexts).toContain(col);
    }
  });

  it('target column dropdown works', async () => {
    const user = userEvent.setup();
    render(<ColumnMapper />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'Target');

    expect(select.value).toBe('Target');
    expect(useDataStore.getState().targetColumn).toBe('Target');
  });

  it('save button is disabled without target column selected', () => {
    // Open the mapper panel first
    useDataStore.setState({ mapperOpen: true });
    render(<ColumnMapper />);

    const saveBtn = screen.getByRole('button', { name: /save mapping/i });
    expect(saveBtn).toBeDisabled();
  });

  it('save button enables after selecting a target column', async () => {
    const user = userEvent.setup();
    useDataStore.setState({ mapperOpen: true });
    render(<ColumnMapper />);

    // Select a target column
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'Target');

    const saveBtn = screen.getByRole('button', { name: /save mapping/i });
    expect(saveBtn).not.toBeDisabled();
  });

  it('clicking save sets mapperSaved to true', async () => {
    const user = userEvent.setup();
    useDataStore.setState({ mapperOpen: true, targetColumn: 'Target' });
    render(<ColumnMapper />);

    const saveBtn = screen.getByRole('button', { name: /save mapping/i });
    await user.click(saveBtn);

    expect(useDataStore.getState().mapperSaved).toBe(true);
  });

  it('after save, shows "Mapping saved" badge', async () => {
    const user = userEvent.setup();
    useDataStore.setState({ mapperOpen: true, targetColumn: 'Target' });
    render(<ColumnMapper />);

    const saveBtn = screen.getByRole('button', { name: /save mapping/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/mapping saved/i)).toBeInTheDocument();
    });
  });
});

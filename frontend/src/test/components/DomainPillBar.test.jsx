import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import DomainPillBar from '../../components/DomainPillBar/DomainPillBar';
import useAppStore from '../../stores/useAppStore';
import useDataStore from '../../stores/useDataStore';

describe('DomainPillBar', () => {
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

  it('renders exactly 20 pills', () => {
    render(<DomainPillBar />);

    const pills = screen.getAllByRole('tab');
    expect(pills).toHaveLength(20);
  });

  it('each pill has a unique non-empty text', () => {
    render(<DomainPillBar />);

    const pills = screen.getAllByRole('tab');
    const texts = pills.map((pill) => pill.textContent.trim());

    // All texts should be non-empty
    for (const text of texts) {
      expect(text.length).toBeGreaterThan(0);
    }

    // All texts should be unique
    const uniqueTexts = new Set(texts);
    expect(uniqueTexts.size).toBe(20);
  });

  it('clicking a pill updates the store selectedDomainId', async () => {
    const user = userEvent.setup();
    render(<DomainPillBar />);

    const pills = screen.getAllByRole('tab');
    // Find the Radiology pill
    const radiologyPill = pills.find((p) => p.textContent.trim() === 'Radiology');
    expect(radiologyPill).toBeDefined();

    await user.click(radiologyPill);

    expect(useAppStore.getState().selectedDomainId).toBe('radiology');
  });

  it('default selection is cardiology', () => {
    render(<DomainPillBar />);

    const pills = screen.getAllByRole('tab');
    const cardiologyPill = pills.find((p) => p.textContent.trim() === 'Cardiology');
    expect(cardiologyPill).toBeDefined();
    expect(cardiologyPill).toHaveAttribute('aria-selected', 'true');
  });
});

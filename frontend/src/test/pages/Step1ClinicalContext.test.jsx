import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import Step1ClinicalContext from '../../pages/Step1ClinicalContext/Step1ClinicalContext';
import useAppStore from '../../stores/useAppStore';
import useDataStore from '../../stores/useDataStore';
import { domains } from '../../data/domains';

describe('Step1ClinicalContext — all 20 domains', () => {
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

  // Verify all 20 domains exist
  it('has exactly 20 domains defined', () => {
    expect(domains).toHaveLength(20);
  });

  // For each domain, verify the scenario text renders correctly
  domains.forEach((domain) => {
    it(`renders non-empty scenario text for ${domain.name} (${domain.id})`, () => {
      useAppStore.setState({ selectedDomainId: domain.id });
      const { unmount } = render(<Step1ClinicalContext />);

      // The scenario text is rendered inside a blockquote with "PROBLEM: ..."
      // We check that the domain's scenario text appears in the document
      const scenarioText = screen.getByText((content) => {
        return content.includes(domain.scenario.substring(0, 40));
      });
      expect(scenarioText).toBeInTheDocument();
      expect(domain.scenario.length).toBeGreaterThan(0);

      unmount();
    });
  });

  it('each domain has unique scenario text', () => {
    const scenarios = domains.map((d) => d.scenario);
    const uniqueScenarios = new Set(scenarios);
    expect(uniqueScenarios.size).toBe(20);
  });
});

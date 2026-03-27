import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import Stepper from '../../components/Stepper/Stepper';
import useAppStore from '../../stores/useAppStore';

describe('Stepper', () => {
  beforeEach(() => {
    useAppStore.setState({
      currentStep: 1,
      selectedDomainId: 'cardiology',
      showHelp: false,
      clinicalContext: null,
      contextLoading: false,
      contextError: null,
    });
  });

  it('renders all 7 step names', () => {
    render(<Stepper />);
    expect(screen.getByText(/1\. Clinical Context/)).toBeInTheDocument();
    expect(screen.getByText(/2\. Data Exploration/)).toBeInTheDocument();
    expect(screen.getByText(/3\. Data Preparation/)).toBeInTheDocument();
    expect(screen.getByText(/4\. Model & Parameters/)).toBeInTheDocument();
    expect(screen.getByText(/5\. Results/)).toBeInTheDocument();
    expect(screen.getByText(/6\. Explainability/)).toBeInTheDocument();
    expect(screen.getByText(/7\. Ethics & Bias/)).toBeInTheDocument();
  });

  it('marks step 1 as active when currentStep is 1', () => {
    render(<Stepper />);
    const nav = screen.getByRole('navigation', { name: /workflow steps/i });
    const activeStep = nav.querySelector('[aria-current="step"]');
    expect(activeStep).toBeInTheDocument();
    expect(activeStep.textContent).toContain('1. Clinical Context');
  });

  it('marks previous steps as completed with checkmark when on step 3', () => {
    useAppStore.setState({ currentStep: 3 });
    render(<Stepper />);

    const nav = screen.getByRole('navigation', { name: /workflow steps/i });
    // Steps 1 and 2 should show checkmarks
    const checkmarks = screen.getAllByText('\u2713');
    expect(checkmarks).toHaveLength(2);

    // Step 3 should be active
    const activeStep = nav.querySelector('[aria-current="step"]');
    expect(activeStep.textContent).toContain('3. Data Preparation');
  });

  it('shows step number for future steps instead of checkmark', () => {
    useAppStore.setState({ currentStep: 1 });
    render(<Stepper />);

    // Steps 2-7 should show their numbers, not checkmarks
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    // No checkmarks should be present
    expect(screen.queryByText('\u2713')).not.toBeInTheDocument();
  });

  it('renders subtitles for each step', () => {
    render(<Stepper />);
    expect(screen.getByText('Use case & goals')).toBeInTheDocument();
    expect(screen.getByText('Upload & understand')).toBeInTheDocument();
    expect(screen.getByText('Clean & Split data')).toBeInTheDocument();
    expect(screen.getByText('Select & Tune')).toBeInTheDocument();
    expect(screen.getByText('Metric & Matrix')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressRing from '../../components/ProgressRing/ProgressRing';

describe('ProgressRing', () => {
  it('renders the progress percentage text', () => {
    render(<ProgressRing progress={75} status="running" duration={null} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders "PROCESSED" label', () => {
    render(<ProgressRing progress={0} status="idle" duration={null} />);
    expect(screen.getByText('PROCESSED')).toBeInTheDocument();
  });

  it('shows "Ready to process" for idle status', () => {
    render(<ProgressRing progress={0} status="idle" duration={null} />);
    expect(screen.getByText('Ready to process')).toBeInTheDocument();
  });

  it('shows "Processing..." for running status', () => {
    render(<ProgressRing progress={50} status="running" duration={null} />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('shows "System Idle: Complete" for complete status', () => {
    render(<ProgressRing progress={100} status="complete" duration={2.5} />);
    expect(screen.getByText('System Idle: Complete')).toBeInTheDocument();
  });

  it('shows duration when provided', () => {
    render(<ProgressRing progress={100} status="complete" duration={3.2} />);
    expect(screen.getByText('Duration: 3.2s')).toBeInTheDocument();
  });

  it('does not show duration when null', () => {
    render(<ProgressRing progress={100} status="complete" duration={null} />);
    expect(screen.queryByText(/duration/i)).not.toBeInTheDocument();
  });
});

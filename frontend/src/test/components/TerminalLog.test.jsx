import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TerminalLog from '../../components/TerminalLog/TerminalLog';

describe('TerminalLog', () => {
  it('shows placeholder text when logs are empty', () => {
    render(<TerminalLog logs={[]} />);
    expect(
      screen.getByText(/configure the pipeline and click apply to begin processing/i)
    ).toBeInTheDocument();
  });

  it('hides placeholder when logs are present', () => {
    render(<TerminalLog logs={['Step completed']} />);
    expect(
      screen.queryByText(/configure the pipeline and click apply to begin processing/i)
    ).not.toBeInTheDocument();
  });

  it('renders each log entry with the done prefix', () => {
    const logs = [
      'Cleaning dataset & handling outliers.',
      'Imputing missing values using Mean.',
    ];
    render(<TerminalLog logs={logs} />);

    const doneMarkers = screen.getAllByText(/\[DONE\]/);
    expect(doneMarkers).toHaveLength(2);
    expect(screen.getByText('Cleaning dataset & handling outliers.')).toBeInTheDocument();
    expect(screen.getByText('Imputing missing values using Mean.')).toBeInTheDocument();
  });

  it('renders the footer with backend info', () => {
    render(<TerminalLog logs={[]} />);
    expect(
      screen.getByText(/BACKEND: PYTHON\/FASTAPI/i)
    ).toBeInTheDocument();
  });

  it('renders multiple log entries in order', () => {
    const logs = ['Step 1 done', 'Step 2 done', 'Step 3 done'];
    const { container } = render(<TerminalLog logs={logs} />);

    const logLines = container.querySelectorAll('[class*="logLine"]');
    expect(logLines).toHaveLength(3);
    expect(logLines[0].textContent).toContain('Step 1 done');
    expect(logLines[2].textContent).toContain('Step 3 done');
  });
});

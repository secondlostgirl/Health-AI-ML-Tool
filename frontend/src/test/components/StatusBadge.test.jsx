import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBadge from '../../components/StatusBadge/StatusBadge';

describe('StatusBadge', () => {
  it('returns null when status is "idle"', () => {
    const { container } = render(<StatusBadge status="idle" />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when status is "running"', () => {
    const { container } = render(<StatusBadge status="running" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders badge when status is "complete"', () => {
    render(<StatusBadge status="complete" />);
    expect(screen.getByText(/STATUS: PIPELINE READY/)).toBeInTheDocument();
  });

  it('renders the status dot indicator', () => {
    render(<StatusBadge status="complete" />);
    expect(screen.getByText('●')).toBeInTheDocument();
  });

  it('returns null for any non-complete status string', () => {
    const { container } = render(<StatusBadge status="error" />);
    expect(container.innerHTML).toBe('');
  });
});

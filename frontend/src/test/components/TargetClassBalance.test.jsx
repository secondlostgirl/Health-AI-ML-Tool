import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TargetClassBalance from '../../components/TargetClassBalance/TargetClassBalance';

describe('TargetClassBalance', () => {
  it('returns null when labels is null', () => {
    const { container } = render(
      <TargetClassBalance labels={null} percentages={[]} isImbalanced={false} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('returns null when labels is an empty array', () => {
    const { container } = render(
      <TargetClassBalance labels={[]} percentages={[]} isImbalanced={false} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders segment labels with percentages', () => {
    render(
      <TargetClassBalance
        labels={['Yes', 'No']}
        percentages={[33, 67]}
        isImbalanced={false}
        targetLabel="Readmitted within 30 days"
      />
    );
    expect(screen.getByText('Yes (33%)')).toBeInTheDocument();
    expect(screen.getByText('No (67%)')).toBeInTheDocument();
  });

  it('renders the targetLabel badge and title', () => {
    render(
      <TargetClassBalance
        labels={['Yes', 'No']}
        percentages={[33, 67]}
        isImbalanced={false}
        targetLabel="Readmitted within 30 days"
      />
    );
    expect(screen.getByText('Target Class Balance')).toBeInTheDocument();
    expect(screen.getByText('Readmitted within 30 days')).toBeInTheDocument();
  });

  it('shows imbalance warning when isImbalanced is true', () => {
    render(
      <TargetClassBalance
        labels={['Seizure', 'Normal']}
        percentages={[20, 80]}
        isImbalanced={true}
        targetLabel="Seizure detected"
      />
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Imbalance detected')).toBeInTheDocument();
    expect(alert.textContent).toContain('20%');
  });

  it('does not show imbalance warning when isImbalanced is false', () => {
    render(
      <TargetClassBalance
        labels={['Yes', 'No']}
        percentages={[45, 55]}
        isImbalanced={false}
        targetLabel="Test"
      />
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import FeatureInspectionTable from '../../components/FeatureInspectionTable/FeatureInspectionTable';

const sampleStats = [
  { name: 'Age', type: 'Numerical', missingPercent: 0, actionNeeded: 'READY' },
  { name: 'BMI', type: 'Numerical', missingPercent: 8.5, actionNeeded: 'FILL MISSING VALUES' },
  { name: 'Sex', type: 'Categorical', missingPercent: 0, actionNeeded: 'READY' },
  { name: 'Creatinine', type: 'Numerical', missingPercent: 6.2, actionNeeded: 'FILL MISSING VALUES' },
];

describe('FeatureInspectionTable', () => {
  it('returns null when columnStats is null', () => {
    const { container } = render(<FeatureInspectionTable columnStats={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when columnStats is an empty array', () => {
    const { container } = render(<FeatureInspectionTable columnStats={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the table with all column rows', () => {
    render(<FeatureInspectionTable columnStats={sampleStats} />);
    expect(screen.getByText('Feature Inspection Table')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('BMI')).toBeInTheDocument();
    expect(screen.getByText('Sex')).toBeInTheDocument();
    expect(screen.getByText('Creatinine')).toBeInTheDocument();
  });

  it('displays type badges (Numerical/Categorical) and action badges', () => {
    render(<FeatureInspectionTable columnStats={sampleStats} />);
    const numericalBadges = screen.getAllByText('Numerical');
    const categoricalBadges = screen.getAllByText('Categorical');
    expect(numericalBadges).toHaveLength(3);
    expect(categoricalBadges).toHaveLength(1);

    const readyBadges = screen.getAllByText('READY');
    const fillBadges = screen.getAllByText('FILL MISSING VALUES');
    expect(readyBadges).toHaveLength(2);
    expect(fillBadges).toHaveLength(2);
  });

  it('sorts by missing% desc by default (highest missing first)', () => {
    render(<FeatureInspectionTable columnStats={sampleStats} />);
    const table = screen.getByRole('table');
    const rows = table.querySelectorAll('tbody tr');

    // Default sort: missing desc => BMI(8.5), Creatinine(6.2), Age(0), Sex(0)
    expect(rows[0].textContent).toContain('BMI');
    expect(rows[1].textContent).toContain('Creatinine');
  });

  it('changes sort to name (ascending) when sort dropdown is changed', async () => {
    const user = userEvent.setup();
    render(<FeatureInspectionTable columnStats={sampleStats} />);

    const sortSelect = screen.getByRole('combobox');
    await user.selectOptions(sortSelect, 'name');

    const table = screen.getByRole('table');
    const rows = table.querySelectorAll('tbody tr');

    // Alphabetical: Age, BMI, Creatinine, Sex
    expect(rows[0].textContent).toContain('Age');
    expect(rows[1].textContent).toContain('BMI');
    expect(rows[2].textContent).toContain('Creatinine');
    expect(rows[3].textContent).toContain('Sex');
  });
});

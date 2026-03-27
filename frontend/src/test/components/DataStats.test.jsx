import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DataStats from '../../components/DataStats/DataStats';

describe('DataStats', () => {
  it('renders records count with locale formatting', () => {
    render(<DataStats records={1500} features={12} missingPercent={3.2} />);
    // toLocaleString output varies by environment; match the actual formatted value
    const formatted = (1500).toLocaleString();
    expect(screen.getByText(formatted)).toBeInTheDocument();
    expect(screen.getByText('Patients Records')).toBeInTheDocument();
  });

  it('renders features count', () => {
    render(<DataStats records={304} features={11} missingPercent={2.0} />);
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('Measurements')).toBeInTheDocument();
  });

  it('renders missing percentage with one decimal place', () => {
    render(<DataStats records={100} features={5} missingPercent={7.456} />);
    expect(screen.getByText('7.5%')).toBeInTheDocument();
    expect(screen.getByText('Missing Data')).toBeInTheDocument();
  });

  it('applies green class for missing < 5%', () => {
    const { container } = render(
      <DataStats records={100} features={5} missingPercent={3.0} />
    );
    const missingValue = screen.getByText('3.0%');
    expect(missingValue.className).toContain('green');
  });

  it('applies yellow class for missing between 5% and 15%', () => {
    render(<DataStats records={100} features={5} missingPercent={10.0} />);
    const missingValue = screen.getByText('10.0%');
    expect(missingValue.className).toContain('yellow');
  });

  it('applies red class for missing >= 15%', () => {
    render(<DataStats records={100} features={5} missingPercent={20.0} />);
    const missingValue = screen.getByText('20.0%');
    expect(missingValue.className).toContain('red');
  });
});

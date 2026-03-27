import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MLJourneyTable from '../../components/MLJourneyTable/MLJourneyTable';

describe('MLJourneyTable', () => {
  it('renders the title and badge', () => {
    render(<MLJourneyTable currentStep={1} />);
    expect(screen.getByText('ML Learning Journey')).toBeInTheDocument();
    expect(screen.getByText('7 MODULES')).toBeInTheDocument();
  });

  it('renders all 7 journey rows', () => {
    render(<MLJourneyTable currentStep={1} />);
    const table = screen.getByRole('table');
    // 7 data rows + 1 header row
    const rows = table.querySelectorAll('tr');
    expect(rows).toHaveLength(8);
  });

  it('renders correct content for each row', () => {
    render(<MLJourneyTable currentStep={1} />);
    expect(screen.getByText(/1\. Clinical Context/)).toBeInTheDocument();
    expect(screen.getByText('Defined Objective')).toBeInTheDocument();
    expect(screen.getByText('What exactly am I trying to figure out or predict?')).toBeInTheDocument();
    expect(screen.getByText(/7\. Ethics & Bias/)).toBeInTheDocument();
    expect(screen.getByText('EU AI Act Checklist')).toBeInTheDocument();
  });

  it('highlights the active row matching currentStep', () => {
    const { container } = render(<MLJourneyTable currentStep={3} />);
    const table = screen.getByRole('table');
    const rows = table.querySelectorAll('tbody tr');

    // Row at index 2 (step 3) should have the activeRow class
    expect(rows[2].className).toContain('activeRow');
    // Other rows should not
    expect(rows[0].className).not.toContain('activeRow');
    expect(rows[4].className).not.toContain('activeRow');
  });

  it('renders the footnote text', () => {
    render(<MLJourneyTable currentStep={1} />);
    expect(
      screen.getByText(/modules are unlocked sequentially/i)
    ).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import HelpModal from '../../components/HelpModal/HelpModal';
import useAppStore from '../../stores/useAppStore';

describe('HelpModal', () => {
  beforeEach(() => {
    useAppStore.setState({
      currentStep: 1,
      selectedDomainId: 'cardiology',
      showHelp: true,
      clinicalContext: null,
      contextLoading: false,
      contextError: null,
    });
  });

  it('renders the modal title "How to Use HEALTH-AI"', () => {
    render(<HelpModal />);
    expect(screen.getByText('How to Use HEALTH-AI')).toBeInTheDocument();
  });

  it('renders all 4 help sections', () => {
    render(<HelpModal />);
    expect(screen.getByText('Step 1: Clinical Context')).toBeInTheDocument();
    expect(screen.getByText('Step 2: Data Exploration')).toBeInTheDocument();
    expect(screen.getByText('Step 3: Data Preparation')).toBeInTheDocument();
    expect(screen.getByText('Steps 4-7')).toBeInTheDocument();
  });

  it('clicking close button toggles showHelp to false', async () => {
    const user = userEvent.setup();
    render(<HelpModal />);

    expect(useAppStore.getState().showHelp).toBe(true);
    await user.click(screen.getByRole('button', { name: /close help/i }));
    expect(useAppStore.getState().showHelp).toBe(false);
  });

  it('clicking the overlay toggles showHelp to false', async () => {
    const user = userEvent.setup();
    const { container } = render(<HelpModal />);

    expect(useAppStore.getState().showHelp).toBe(true);
    // Click the overlay (the outermost div)
    const overlay = container.firstChild;
    await user.click(overlay);
    expect(useAppStore.getState().showHelp).toBe(false);
  });

  it('clicking inside the modal content does not close it', async () => {
    const user = userEvent.setup();
    render(<HelpModal />);

    expect(useAppStore.getState().showHelp).toBe(true);
    await user.click(screen.getByText('Step 1: Clinical Context'));
    // showHelp should still be true because stopPropagation prevents overlay click
    expect(useAppStore.getState().showHelp).toBe(true);
  });
});

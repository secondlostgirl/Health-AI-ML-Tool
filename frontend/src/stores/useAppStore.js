import { create } from 'zustand';

const useAppStore = create((set) => ({
  currentStep: 1,
  selectedDomainId: 'cardiology',
  showHelp: false,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((s) => ({ currentStep: Math.min(s.currentStep + 1, 7) })),
  prevStep: () =>
    set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),
  setDomain: (id) => set({ selectedDomainId: id }),
  toggleHelp: () => set((s) => ({ showHelp: !s.showHelp })),
  reset: () =>
    set({ currentStep: 1, selectedDomainId: 'cardiology', showHelp: false }),
}));

export default useAppStore;

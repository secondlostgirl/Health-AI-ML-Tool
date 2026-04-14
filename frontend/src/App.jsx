import useAppStore from './stores/useAppStore';
import useThemeStore from './stores/useThemeStore';
import Header from './components/Header/Header';
import DomainPillBar from './components/DomainPillBar/DomainPillBar';
import Stepper from './components/Stepper/Stepper';
import Footer from './components/Footer/Footer';
import HelpModal from './components/HelpModal/HelpModal';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Step1ClinicalContext from './pages/Step1ClinicalContext/Step1ClinicalContext';
import Step2DataExploration from './pages/Step2DataExploration/Step2DataExploration';
import Step3DataPreparation from './pages/Step3DataPreparation/Step3DataPreparation';
import Step4ModelParameters from './pages/Step4ModelParameters/Step4ModelParameters';
import Step5Results from './pages/Step5Results/Step5Results';
import Step6Explainability from './pages/Step6Explainability/Step6Explainability';
import Step7EthicsAndBias from './pages/Step7EthicsAndBias/Step7EthicsAndBias';
import styles from './App.module.css';

export default function App() {
  useThemeStore(); // initialize theme from localStorage on first render
  const currentStep = useAppStore((s) => s.currentStep);
  const showHelp = useAppStore((s) => s.showHelp);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1ClinicalContext />;
      case 2:
        return <Step2DataExploration />;
      case 3:
        return <Step3DataPreparation />;
      case 4:
        return <Step4ModelParameters />;
      case 5:
        return <Step5Results />;
      case 6:
        return <Step6Explainability />;
      case 7:
        return <Step7EthicsAndBias />;
      default:
        return (
          <div className={styles.comingSoon}>
            <h2>Step {currentStep}</h2>
            <p>Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.app}>
      <Header />
      <DomainPillBar />
      <Stepper />
      <main className={styles.content}>
        <ErrorBoundary key={currentStep}>{renderStep()}</ErrorBoundary>
      </main>
      <Footer />
      {showHelp && <HelpModal />}
    </div>
  );
}

import useAppStore from './stores/useAppStore';
import Header from './components/Header/Header';
import DomainPillBar from './components/DomainPillBar/DomainPillBar';
import Stepper from './components/Stepper/Stepper';
import Footer from './components/Footer/Footer';
import HelpModal from './components/HelpModal/HelpModal';
import Step1ClinicalContext from './pages/Step1ClinicalContext/Step1ClinicalContext';
import Step2DataExploration from './pages/Step2DataExploration/Step2DataExploration';
import Step3DataPreparation from './pages/Step3DataPreparation/Step3DataPreparation';
import styles from './App.module.css';

export default function App() {
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
      <main className={styles.content}>{renderStep()}</main>
      <Footer />
      {showHelp && <HelpModal />}
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { domains } from '../../data/domains';
import useAppStore from '../../stores/useAppStore';
import useDataStore from '../../stores/useDataStore';
import useModelStore from '../../stores/useModelStore';
import { clearSessionId } from '../../api';
import styles from './DomainPillBar.module.css';

export default function DomainPillBar() {
  const selectedDomainId = useAppStore((s) => s.selectedDomainId);
  const setDomain = useAppStore((s) => s.setDomain);
  const currentStep = useAppStore((s) => s.currentStep);
  const resetData = useDataStore((s) => s.resetAll);
  const resetModel = useModelStore((s) => s.resetModel);
  const [showResetBanner, setShowResetBanner] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const timerRef = useRef(null);
  const scrollRef = useRef(null);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 200, behavior: 'smooth' });
  };

  const handleSelect = (id) => {
    if (id !== selectedDomainId) {
      setDomain(id);
      // On Step 6/7, only update the domain (sense-check text refreshes automatically).
      // Full reset only happens on Steps 1–5 where retraining is needed.
      if (currentStep <= 5) {
        resetData();
        resetModel();
        clearSessionId();
        setShowResetBanner(true);
      }
    }
  };

  useEffect(() => {
    if (showResetBanner) {
      timerRef.current = setTimeout(() => setShowResetBanner(false), 3000);
      return () => clearTimeout(timerRef.current);
    }
  }, [showResetBanner]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.scrollArea}>
        {canScrollLeft && (
          <button
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={() => scroll(-1)}
            aria-label="Scroll domains left"
          >
            ‹
          </button>
        )}

        <div
          className={styles.scrollContainer}
          ref={scrollRef}
          role="tablist"
          aria-label="Healthcare domains"
        >
          {domains.map((domain) => (
            <button
              key={domain.id}
              role="tab"
              aria-selected={selectedDomainId === domain.id}
              className={`${styles.pill} ${selectedDomainId === domain.id ? styles.active : ''}`}
              onClick={() => handleSelect(domain.id)}
            >
              {domain.name}
            </button>
          ))}
        </div>

        {canScrollRight && (
          <button
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={() => scroll(1)}
            aria-label="Scroll domains right"
          >
            ›
          </button>
        )}
      </div>

      {showResetBanner && (
        <div className={styles.resetBanner} role="status" aria-live="polite">
          <span className={styles.resetIcon}>↻</span>
          Pipeline Reset — All progress has been reset for the new domain.
        </div>
      )}
    </div>
  );
}

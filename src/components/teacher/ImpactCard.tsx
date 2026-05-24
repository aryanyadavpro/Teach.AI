import { Rocket } from 'lucide-react';
import styles from './ImpactCard.module.css';

export default function ImpactCard() {
    // No mock data - will be fetched from MongoDB in the future
    const worksheetsCreated = 0;
    const timeSaved = 0;

    return (
        <div className={`${styles.card} animate-scale-in delay-100`}>
            <h3 className={styles.title}>
                <span className={styles.titleIconWrapper}>
                    <Rocket size={20} className={styles.titleIcon} />
                </span>
                This Month's Impact
            </h3>

            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="4" y="4" width="16" height="16" rx="2" />
                            <path d="M9 9h6M9 13h6M9 17h4" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{worksheetsCreated}</span>
                        <span className={styles.statLabel}>Worksheets</span>
                    </div>
                </div>

                <div className={styles.statItem}>
                    <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{timeSaved}h</span>
                        <span className={styles.statLabel}>Time Saved</span>
                    </div>
                </div>
            </div>

            <div className={styles.tip}>
                <div className={styles.tipIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4 4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z" />
                        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                        <path d="M12 14l4-4" strokeLinecap="round" />
                    </svg>
                </div>
                <div className={styles.tipContent}>
                    <span className={styles.tipTitle}>Pro Tip</span>
                    <span className={styles.tipText}>Create flashcards for vocab!</span>
                </div>
                <svg className={styles.tipArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
}

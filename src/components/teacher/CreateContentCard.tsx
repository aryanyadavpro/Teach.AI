'use client';

import styles from './CreateContentCard.module.css';

const contentTypes = [
    {
        id: 'worksheet',
        label: 'Worksheet',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="#f97316" strokeWidth="2" />
                <path d="M8 10h8M8 14h5" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        color: '#fff7ed'
    },
    {
        id: 'quiz',
        label: 'Quiz',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="#a855f7" strokeWidth="2" />
                <path d="M9 12l2 2 4-4" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        color: '#faf5ff'
    },
    {
        id: 'cards',
        label: 'Cards',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="4" width="12" height="16" rx="2" stroke="#3b82f6" strokeWidth="2" />
                <path d="M10 10h4M10 14h2" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        color: '#eff6ff'
    },
];

export default function CreateContentCard() {
    return (
        <div className={styles.card}>
            <h2 className={styles.title}>Create New Content</h2>
            <p className={styles.subtitle}>
                Tap and speak to instantly generate worksheets, quizzes, or flashcards.
            </p>

            {/* Voice Button */}
            <button className={styles.voiceBtn}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" fill="white" />
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18.5v3.5M8 22h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            {/* Try Saying */}
            <div className={styles.trySaying}>
                <span className={styles.tryLabel}>Try saying:</span>
                <span className={styles.tryExample}>"Create a math quiz for Class 5 on Fractions"</span>
            </div>

            {/* Divider */}
            <div className={styles.divider}></div>

            {/* Content Type Buttons */}
            <div className={styles.contentTypes}>
                {contentTypes.map((type) => (
                    <button key={type.id} className={styles.typeBtn}>
                        <div className={styles.typeIcon} style={{ background: type.color }}>
                            {type.icon}
                        </div>
                        <span className={styles.typeLabel}>{type.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

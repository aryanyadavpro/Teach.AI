import styles from './RecentCreations.module.css';

export default function RecentCreations() {
    // No mock data - will be fetched from MongoDB in the future
    const creations: any[] = [];

    return (
        <div className={`${styles.section} animate-fade-in delay-200`}>
            <div className={styles.header}>
                <h2 className={styles.title}>Recent Creations</h2>
                <button className={styles.viewAllBtn}>View All</button>
            </div>

            <div className={styles.grid}>
                {creations.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>✨</span>
                        <p className={styles.emptyText}>
                            No recent creations yet. Start creating magical content for your students!
                        </p>
                        <button className={styles.createBtn}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Create New Content
                        </button>
                    </div>
                ) : (
                    creations.map((item) => (
                        <div key={item.id} className={styles.card}>
                            {/* ... Content here ... */}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

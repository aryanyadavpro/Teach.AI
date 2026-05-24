import styles from './StorageCard.module.css';

export default function StorageCard() {
    // No mock data - will be fetched from MongoDB in the future
    const usedGB = 0;
    const totalGB = 5.0; // Default plan allocation
    const percentage = totalGB > 0 ? (usedGB / totalGB) * 100 : 0;

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Storage</h3>
                <span className={styles.plan}>Basic Plan</span>
            </div>

            <div className={styles.progressBar}>
                <div className={styles.progress} style={{ width: `${percentage}%` }}></div>
            </div>

            <div className={styles.stats}>
                <span>{usedGB} GB used</span>
                <span>{totalGB} GB total</span>
            </div>

            <button className={styles.manageBtn}>Manage Storage</button>
        </div>
    );
}

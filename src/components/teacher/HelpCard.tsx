import styles from './HelpCard.module.css';

export default function HelpCard() {
    return (
        <div className={styles.card}>
            <div className={styles.content}>
                <h3 className={styles.title}>Need Help?</h3>
                <p className={styles.text}>Our community of teachers is here to support you.</p>
                <button className={styles.btn}>Visit Community</button>
            </div>
            <div className={styles.decoration}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="60" cy="60" r="40" fill="rgba(255,255,255,0.2)" />
                    <circle cx="70" cy="50" r="25" fill="rgba(255,255,255,0.15)" />
                </svg>
            </div>
        </div>
    );
}

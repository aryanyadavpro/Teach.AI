import { GraduationCap, Sparkles } from 'lucide-react';
import styles from './WelcomeCard.module.css';

export default function WelcomeCard() {
    return (
        <div className={`${styles.card} animate-scale-in`}>
            <div className={styles.content}>
                <h1 className={styles.title}>
                    Welcome back, <br />
                    <span className={styles.name}>
                        Ramesh Sir!
                        <GraduationCap size={28} className={styles.nameIcon} strokeWidth={2.5} />
                    </span>
                </h1>
                <p className={styles.subtitle}>Ready to inspire your students today? Your AI assistant is prepped and ready.</p>

                <div className={styles.badge}>
                    <div className={styles.badgeIcon}>
                        <Sparkles size={16} strokeWidth={2.5} />
                    </div>
                    <span>You've saved <strong>23 hours</strong> this month using AI.</span>
                </div>
            </div>

            <div className={styles.illustration}>
                <div className={styles.circle1}></div>
                <div className={styles.circle2}></div>
                <div className={styles.illustrationBox}>
                    <Sparkles size={48} className={styles.illustrationIcon} strokeWidth={1.5} />
                </div>
            </div>
        </div>
    );
}

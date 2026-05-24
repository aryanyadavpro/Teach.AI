'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';
import styles from './WelcomeCard.module.css';

export default function WelcomeCard() {
    const [userName, setUserName] = useState('');

    useEffect(() => {
        async function fetchSession() {
            try {
                const res = await fetch('/api/auth/session');
                const session = await res.json();
                if (session?.user?.name) {
                    setUserName(session.user.name);
                }
            } catch (err) {
                console.error('Failed to fetch session:', err);
            }
        }
        fetchSession();
    }, []);

    return (
        <div className={`${styles.card} animate-scale-in`}>
            <div className={styles.content}>
                <h1 className={styles.title}>
                    Welcome back, <br />
                    <span className={styles.name}>
                        {userName || 'Teacher'}!
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
